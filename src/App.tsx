/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MasterKeyModal } from './components/MasterKeyModal';
import { VaultDashboard } from './components/VaultDashboard';
import { CredentialModal } from './components/CredentialModal';
import { BackupModal } from './components/BackupModal';
import { FaqSection } from './components/FaqSection';
import { ToastContainer, ToastMessage } from './components/Toast';
import { InstallModal } from './components/InstallModal';
import { usePWAInstall, useOnlineStatus } from './hooks/usePWAInstall';
import {
  deriveKey,
  encryptText,
  decryptText,
  createVerificationToken,
  verifyMasterPassword,
  CredentialItem,
  VaultMetadata,
  VaultExport,
  EncryptedPayload
} from './lib/crypto';
import { TRANSLATIONS, LanguageCode } from './lib/i18n';
import { Shield, Lock, WifiOff, Heart, Download } from 'lucide-react';

const STORAGE_KEY_META = 'pws_vault_meta';
const STORAGE_KEY_ITEMS = 'pws_vault_credentials';
const STORAGE_KEY_THEME = 'pws_theme';
const STORAGE_KEY_LANG = 'pws_lang';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Language state
  const [lang, setLang] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG) as LanguageCode;
    if (saved && TRANSLATIONS[saved]) return saved;
    const browserLang = navigator.language?.slice(0, 2) as LanguageCode;
    if (browserLang && TRANSLATIONS[browserLang]) return browserLang;
    return 'en';
  });

  const t = TRANSLATIONS[lang];

  // Vault state
  const [hasVault, setHasVault] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY_META);
  });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeMasterKey, setActiveMasterKey] = useState<CryptoKey | null>(null);
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [decryptedList, setDecryptedList] = useState<Array<{ item: CredentialItem; passwordPlain: string }>>([]);

  // Modals & Navigation
  const [isCredModalOpen, setIsCredModalOpen] = useState(false);
  const [editingCred, setEditingCred] = useState<{
    id: string;
    title: string;
    username: string;
    passwordPlain: string;
    url?: string;
    category: CredentialItem['category'];
    notes?: string;
  } | null>(null);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // PWA & Connectivity
  const { isInstallable, install, isIOS, isInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Apply Theme to root HTML
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply Language to document
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  // Toast helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Lock Vault (Wipes plaintext from RAM)
  const handleLockVault = useCallback(() => {
    setActiveMasterKey(null);
    setIsUnlocked(false);
    setDecryptedList([]);
    addToast('info', t.locked_toast);
  }, [addToast, t.locked_toast]);

  // Decrypt all credentials with active key
  const decryptVault = useCallback(async (items: CredentialItem[], key: CryptoKey) => {
    const results: Array<{ item: CredentialItem; passwordPlain: string }> = [];
    for (const item of items) {
      try {
        const payload: EncryptedPayload = JSON.parse(item.encryptedPassword);
        const plain = await decryptText(payload, key);
        results.push({ item, passwordPlain: plain });
      } catch (err) {
        console.error('Failed to decrypt item:', item.id, err);
        results.push({ item, passwordPlain: '••••••••' });
      }
    }
    setDecryptedList(results);
  }, []);

  // Unlock Vault
  const handleUnlock = async (candidatePassword: string): Promise<boolean> => {
    const metaRaw = localStorage.getItem(STORAGE_KEY_META);
    if (!metaRaw) return false;

    try {
      const meta: VaultMetadata = JSON.parse(metaRaw);
      const verify = await verifyMasterPassword(candidatePassword, meta.verificationToken);
      if (verify.valid && verify.key) {
        setActiveMasterKey(verify.key);
        setIsUnlocked(true);

        const storedItemsRaw = localStorage.getItem(STORAGE_KEY_ITEMS);
        const items: CredentialItem[] = storedItemsRaw ? JSON.parse(storedItemsRaw) : [];
        setCredentials(items);
        await decryptVault(items, verify.key);
        addToast('success', t.vault_status_unlocked);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Setup Vault (First time)
  const handleSetup = async (newMasterPassword: string) => {
    const token = await createVerificationToken(newMasterPassword);
    const meta: VaultMetadata = {
      version: 1,
      createdAt: Date.now(),
      verificationToken: token,
    };
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify([]));

    setHasVault(true);
    await handleUnlock(newMasterPassword);
    addToast('success', 'Master Key configured! Vault initialized.');
  };

  // Save (Add or Update) Credential
  const handleSaveCredential = async (credData: {
    id?: string;
    title: string;
    username: string;
    passwordPlain: string;
    url?: string;
    category: CredentialItem['category'];
    notes?: string;
  }) => {
    if (!activeMasterKey) return;

    const encrypted = await encryptText(credData.passwordPlain, activeMasterKey);
    const now = Date.now();

    let updatedList: CredentialItem[];
    if (credData.id) {
      // Update existing
      updatedList = credentials.map((item) => {
        if (item.id === credData.id) {
          return {
            ...item,
            title: credData.title,
            username: credData.username,
            encryptedPassword: JSON.stringify(encrypted),
            url: credData.url,
            category: credData.category,
            notes: credData.notes,
            updatedAt: now,
          };
        }
        return item;
      });
    } else {
      // Add new
      const newItem: CredentialItem = {
        id: 'cred_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        title: credData.title,
        username: credData.username,
        encryptedPassword: JSON.stringify(encrypted),
        url: credData.url,
        category: credData.category,
        notes: credData.notes,
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      updatedList = [newItem, ...credentials];
    }

    setCredentials(updatedList);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updatedList));
    await decryptVault(updatedList, activeMasterKey);
    addToast('success', t.saved_toast);
  };

  // Delete Credential
  const handleDeleteCredential = async (id: string) => {
    if (!window.confirm(t.delete_confirm)) return;
    const updated = credentials.filter((c) => c.id !== id);
    setCredentials(updated);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
    if (activeMasterKey) {
      await decryptVault(updated, activeMasterKey);
    }
    addToast('info', t.deleted_toast);
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    const updated = credentials.map((c) => {
      if (c.id === id) {
        return { ...c, favorite: !c.favorite, updatedAt: Date.now() };
      }
      return c;
    });
    setCredentials(updated);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
    setDecryptedList((prev) =>
      prev.map((d) => (d.item.id === id ? { ...d, item: { ...d.item, favorite: !d.item.favorite } } : d))
    );
  };

  // Copy helpers
  const handleCopyUsername = (username: string) => {
    navigator.clipboard.writeText(username);
    addToast('success', t.copied_username_toast);
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard.writeText(password);
    addToast('success', t.copied_password_toast);
  };

  // Export Encrypted JSON Vault
  const handleExportVault = () => {
    const metaRaw = localStorage.getItem(STORAGE_KEY_META);
    if (!metaRaw) return;

    const exportData: VaultExport = {
      app: 'PasswordSaver',
      version: 1,
      exportedAt: new Date().toISOString(),
      metadata: JSON.parse(metaRaw),
      credentials: credentials,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `passwordsaver-encrypted-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', t.export_success);
  };

  // Import Encrypted JSON Vault
  const handleImportVault = async (data: VaultExport): Promise<boolean> => {
    try {
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(data.metadata));
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(data.credentials));
      setHasVault(true);
      setCredentials(data.credentials);
      setIsUnlocked(false);
      setActiveMasterKey(null);
      setDecryptedList([]);
      addToast('success', t.import_success);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Wipe / Reset Vault
  const handleClearVault = () => {
    if (window.confirm(t.clear_vault_confirm)) {
      localStorage.removeItem(STORAGE_KEY_META);
      localStorage.removeItem(STORAGE_KEY_ITEMS);
      setHasVault(false);
      setIsUnlocked(false);
      setActiveMasterKey(null);
      setCredentials([]);
      setDecryptedList([]);
      addToast('info', 'Vault successfully reset.');
    }
  };

  // PWA Install Trigger
  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else {
      setShowInstallModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFCFB] dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] selection:bg-[#AEEED3] selection:text-[#0B1615] transition-colors duration-200">
      
      {/* Offline Status Badge */}
      {!isOnline && (
        <aside
          role="status"
          aria-live="polite"
          className="bg-amber-500 text-stone-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs"
        >
          <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.offline_badge}</span>
        </aside>
      )}

      {/* Main Top Navbar */}
      <Navbar
        lang={lang}
        onSelectLang={(newLang) => setLang(newLang)}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        isUnlocked={isUnlocked}
        onLockVault={handleLockVault}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isInstallable={!isInstalled}
        onInstallPWA={handleInstallClick}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Hero Banner with Value Proposition */}
        <section aria-labelledby="hero-title" className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#287A74]/10 dark:bg-[#AEEED3]/10 text-[#287A74] dark:text-[#AEEED3] border border-[#287A74]/20 mb-4">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span>{t.security_badge}</span>
          </div>

          <h1 id="hero-title" className="text-3xl sm:text-5xl font-black tracking-tight text-[#122422] dark:text-[#E6F4F1] max-w-3xl mx-auto">
            {t.app_title} <span className="text-[#287A74] dark:text-[#AEEED3] font-light">—</span> {t.tagline}
          </h1>

          <p className="mt-3 text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero_subtitle}
          </p>

          {!isInstalled && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#55A9A0]/15 hover:bg-[#55A9A0]/25 text-[#287A74] dark:text-[#AEEED3] border border-[#55A9A0]/30 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.install_pwa} (Use Locally 100% Offline)</span>
              </button>
            </div>
          )}
        </section>

        {/* Vault Workspace */}
        <section id="vault" aria-label="Password Vault Workspace" className="w-full">
          {!isUnlocked ? (
            <MasterKeyModal
              isSetup={!hasVault}
              onUnlock={handleUnlock}
              onSetup={handleSetup}
              onOpenImport={() => setIsBackupModalOpen(true)}
              lang={lang}
            />
          ) : (
            <VaultDashboard
              credentials={decryptedList}
              onAddCredential={() => {
                setEditingCred(null);
                setIsCredModalOpen(true);
              }}
              onEditCredential={(item, passwordPlain) => {
                setEditingCred({
                  id: item.id,
                  title: item.title,
                  username: item.username,
                  passwordPlain,
                  url: item.url,
                  category: item.category,
                  notes: item.notes,
                });
                setIsCredModalOpen(true);
              }}
              onDeleteCredential={handleDeleteCredential}
              onToggleFavorite={handleToggleFavorite}
              onCopyUsername={handleCopyUsername}
              onCopyPassword={handleCopyPassword}
              onOpenExport={() => setIsBackupModalOpen(true)}
              onOpenImport={() => setIsBackupModalOpen(true)}
              onClearVault={handleClearVault}
              searchQuery={searchQuery}
              onResetSearch={() => setSearchQuery('')}
              onInstallApp={!isInstalled ? handleInstallClick : undefined}
              lang={lang}
            />
          )}
        </section>

        {/* SEO-Rich Technical FAQ & Architecture Section */}
        <FaqSection lang={lang} />

      </main>

      {/* Semantic Footer */}
      <footer className="w-full border-t border-stone-200 dark:border-[#1E3835] bg-white/70 dark:bg-[#0B1615]/70 py-8 px-4 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t.footer_text}</p>
          <div className="flex items-center gap-4">
            <a
              href="https://ko-fi.com/kishara"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-semibold text-[#287A74] dark:text-[#AEEED3] hover:underline"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>{t.support_kofi}</span>
            </a>
            <span>•</span>
            <a
              href="https://passwordsaver.github.io/"
              className="hover:text-[#287A74] dark:hover:text-[#AEEED3] transition-colors"
            >
              passwordsaver.github.io
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      <CredentialModal
        isOpen={isCredModalOpen}
        onClose={() => {
          setIsCredModalOpen(false);
          setEditingCred(null);
        }}
        onSave={handleSaveCredential}
        initialData={editingCred}
        lang={lang}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onExport={handleExportVault}
        onImport={handleImportVault}
        lang={lang}
      />

      <InstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
        isInstallable={isInstallable}
        isIOS={isIOS}
        onNativeInstall={install}
        lang={lang}
      />

      {/* Interactive Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}
