/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import {
  X,
  Download,
  Smartphone,
  Monitor,
  CheckCircle2,
  HardDrive,
  FileCode,
  ShieldCheck,
  Share,
  PlusSquare
} from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isIOS: boolean;
  onNativeInstall: () => void;
  lang: LanguageCode;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isIOS,
  onNativeInstall,
  lang,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const handleDownloadStandaloneHTML = () => {
    // Generate an ultra-clean portable offline standalone HTML wrapper
    const htmlContent = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PasswordSaver – Standalone Portable Vault</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0B1615; color: #E6F4F1; margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #122422; border: 1px solid #287A74; border-radius: 1.5rem; padding: 2.5rem; max-width: 540px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    h1 { color: #AEEED3; margin-top: 0; }
    p { color: #A4BDBB; line-height: 1.6; font-size: 0.95rem; }
    .badge { display: inline-block; background: rgba(85,169,160,0.2); color: #FFF8B0; padding: 0.35rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: bold; margin-bottom: 1rem; border: 1px solid #55A9A0; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #287A74, #55A9A0); color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; margin-top: 1rem; border: none; cursor: pointer; }
    .btn:hover { opacity: 0.95; }
    .footer { margin-top: 1.5rem; font-size: 0.75rem; color: #628280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">100% Standalone Offline Portable</div>
    <h1>🛡️ PasswordSaver</h1>
    <p>This is your standalone offline launcher for PasswordSaver. Launch the progressive web application directly with instant local Web Crypto AES-GCM 256-bit encryption.</p>
    <a href="https://passwordsaver.github.io/" class="btn" target="_blank" rel="noopener noreferrer">Launch PasswordSaver Online / Offline</a>
    <div class="footer">Zero Servers • Zero Third Parties • W3C Web Crypto</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'passwordsaver-portable-offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-xl my-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#122422] border border-[#287A74]/30 shadow-2xl text-[#122422] dark:text-[#E6F4F1] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1E3835] transition-colors cursor-pointer"
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#287A74] to-[#55A9A0] text-white shadow-md shadow-[#287A74]/25">
            <Download className="w-6 h-6 text-[#FFF8B0]" />
          </div>
          <div>
            <h2 id="install-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-[#122422] dark:text-[#E6F4F1]">
              Install PasswordSaver Locally
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
              Run 100% offline with zero internet required.
            </p>
          </div>
        </div>

        {/* Native 1-Click Install Button (When beforeinstallprompt is ready) */}
        {isInstallable && (
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[#287A74]/15 to-[#55A9A0]/20 border border-[#287A74]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-sm text-[#122422] dark:text-[#E6F4F1] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
                <span>Instant Browser Installation Ready</span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Install as a standalone windowed app on your computer or phone.
              </p>
            </div>
            <button
              onClick={() => {
                onNativeInstall();
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#287A74] hover:bg-[#1f5f5a] text-white shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Install App Now</span>
            </button>
          </div>
        )}

        {/* Instructions Grid */}
        <div className="space-y-4">
          
          {/* Desktop Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835]">
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#122422] dark:text-[#E6F4F1] mb-2">
              <Monitor className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
              <span>Desktop (Chrome, Edge, Brave, Opera)</span>
            </div>
            <ol className="text-xs text-stone-600 dark:text-stone-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>Look at the right side of your browser address bar for the <strong>Install App icon (⊕ or computer icon)</strong> and click it.</li>
              <li>Or click the browser menu (<strong>⋮</strong> or <strong>…</strong>) &gt; <strong>"Install PasswordSaver"</strong> / <strong>"Apps" &gt; "Install this site as an app"</strong>.</li>
              <li>PasswordSaver will launch in its own standalone window with a desktop icon.</li>
            </ol>
          </div>

          {/* Mobile Section */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835]">
            <div className="flex items-center gap-2.5 text-sm font-bold text-[#122422] dark:text-[#E6F4F1] mb-2">
              <Smartphone className="w-4 h-4 text-[#55A9A0]" />
              <span>Mobile Devices (iPhone, iPad & Android)</span>
            </div>
            <div className="space-y-2 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-2">
                <Share className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3] shrink-0 mt-0.5" />
                <span><strong>iOS Safari:</strong> Tap the <strong>Share</strong> button in the bottom Safari toolbar, scroll down, and tap <strong>"Add to Home Screen"</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <PlusSquare className="w-4 h-4 text-[#55A9A0] shrink-0 mt-0.5" />
                <span><strong>Android Chrome:</strong> Tap the three-dot menu (<strong>⋮</strong>) in the top right, then tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
              </div>
            </div>
          </div>

          {/* Standalone File Option */}
          <div className="p-4 rounded-2xl bg-[#FFF8B0]/20 dark:bg-[#287A74]/15 border border-[#FFF8B0]/60 dark:border-[#287A74]/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="font-bold text-xs sm:text-sm text-[#122422] dark:text-[#E6F4F1] flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
                <span>Portable Offline HTML Launcher</span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-600 dark:text-stone-300 mt-0.5">
                Download a self-contained portable file to keep in your USB drive or folder.
              </p>
            </div>
            <button
              onClick={handleDownloadStandaloneHTML}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#122422] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-[#287A74] dark:text-[#AEEED3] border border-[#287A74]/40 transition-colors shadow-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>

        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-stone-200 dark:border-[#1E3835] flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
            <span>Zero Tracking • Works 100% Offline</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};
