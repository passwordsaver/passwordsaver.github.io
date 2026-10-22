/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Upload,
  Shield,
  FileCheck,
  AlertCircle,
  FileJson
} from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';
import { VaultExport } from '../lib/crypto';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  onImport: (vaultData: VaultExport) => Promise<boolean>;
  lang: LanguageCode;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onExport,
  onImport,
  lang,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as VaultExport;

        if (parsed.app !== 'PasswordSaver' || !parsed.metadata || !Array.isArray(parsed.credentials)) {
          setImportStatus('error');
          setErrorMessage(t.import_error);
          return;
        }

        const success = await onImport(parsed);
        if (success) {
          setImportStatus('success');
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setImportStatus('error');
          setErrorMessage(t.import_error);
        }
      } catch (err) {
        console.error(err);
        setImportStatus('error');
        setErrorMessage(t.import_error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#122422] border border-[#287A74]/30 shadow-2xl text-[#122422] dark:text-[#E6F4F1] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-[#1E3835]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#287A74]/15 text-[#287A74] dark:text-[#AEEED3]">
              <Shield className="w-5 h-5" />
            </div>
            <h2 id="backup-modal-title" className="text-lg font-bold">
              {t.export_vault} / {t.import_vault}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1E3835] transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-5 space-y-6">
          
          {/* Export Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#122422] dark:text-[#E6F4F1]">
              <Download className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
              <span>{t.export_vault}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {t.export_desc}
            </p>
            <button
              onClick={onExport}
              className="mt-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-[#287A74] hover:bg-[#1f5f5a] text-white shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileJson className="w-4 h-4" />
              <span>{t.download_backup_btn}</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835] space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#122422] dark:text-[#E6F4F1]">
              <Upload className="w-4 h-4 text-[#55A9A0]" />
              <span>{t.import_vault}</span>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              {t.import_desc}
            </p>
            
            <label className="mt-2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#55A9A0]/40 rounded-xl cursor-pointer hover:bg-stone-100 dark:hover:bg-[#122422] transition-colors">
              <Upload className="w-5 h-5 text-[#55A9A0] mb-1" />
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-200">
                {t.click_to_browse}
              </span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Status alerts */}
            {importStatus === 'success' && (
              <div role="status" className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>{t.import_success}</span>
              </div>
            )}

            {importStatus === 'error' && (
              <div role="alert" className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
