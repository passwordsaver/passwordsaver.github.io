/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';

interface IOSGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: LanguageCode;
}

export const IOSGuideModal: React.FC<IOSGuideModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-white dark:bg-[#122422] border border-[#287A74]/30 shadow-2xl text-[#122422] dark:text-[#E6F4F1]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#1E3835] transition-colors"
          aria-label={t.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[#287A74]/15 text-[#287A74] dark:text-[#AEEED3]">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 id="ios-modal-title" className="text-lg font-bold">
            {t.ios_install_title}
          </h3>
        </div>

        <div className="space-y-3.5 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFCFB] dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835]">
            <Share className="w-5 h-5 text-[#287A74] dark:text-[#AEEED3] shrink-0 mt-0.5" />
            <span>{t.ios_install_step1}</span>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAFCFB] dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835]">
            <PlusSquare className="w-5 h-5 text-[#287A74] dark:text-[#AEEED3] shrink-0 mt-0.5" />
            <span>{t.ios_install_step2}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#FFF8B0]/20 dark:bg-[#287A74]/20 border border-[#FFF8B0]/50 dark:border-[#287A74]/50 text-xs text-[#287A74] dark:text-[#AEEED3]">
            {t.ios_install_step3}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#287A74] hover:bg-[#1f5f5a] text-white font-medium transition-colors shadow-sm"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
