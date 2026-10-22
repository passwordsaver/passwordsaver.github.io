/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Cpu, WifiOff, HardDrive, KeyRound } from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';

interface FaqSectionProps {
  lang: LanguageCode;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      icon: ShieldCheck,
      q: t.faq_q1,
      a: t.faq_a1,
    },
    {
      icon: Cpu,
      q: t.faq_q2,
      a: t.faq_a2,
    },
    {
      icon: WifiOff,
      q: t.faq_q3,
      a: t.faq_a3,
    },
    {
      icon: HardDrive,
      q: t.faq_q4,
      a: t.faq_a4,
    },
  ];

  return (
    <section id="faq" aria-labelledby="faq-main-heading" className="w-full mt-16 pt-12 border-t border-stone-200 dark:border-[#1E3835]">
      
      {/* Visual Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
          <li>
            <a href="/" className="hover:text-[#287A74] dark:hover:text-[#AEEED3] transition-colors">
              {t.breadcrumbs_home}
            </a>
          </li>
          <li><span className="mx-1">/</span></li>
          <li>
            <a href="#vault" className="hover:text-[#287A74] dark:hover:text-[#AEEED3] transition-colors">
              {t.breadcrumbs_vault}
            </a>
          </li>
          <li><span className="mx-1">/</span></li>
          <li aria-current="page" className="font-semibold text-[#287A74] dark:text-[#AEEED3]">
            {t.breadcrumbs_credentials}
          </li>
        </ol>
      </nav>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#AEEED3]/30 dark:bg-[#AEEED3]/15 text-[#287A74] dark:text-[#AEEED3] border border-[#55A9A0]/30 mb-3">
          <KeyRound className="w-3.5 h-3.5" />
          <span>{t.security_architecture}</span>
        </div>
        <h2 id="faq-main-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-[#122422] dark:text-[#E6F4F1]">
          {t.faq_title}
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
          {t.faq_subtitle}
        </p>
      </div>

      {/* FAQ Accordion Articles */}
      <div className="max-w-3xl mx-auto space-y-3.5">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          const IconComponent = item.icon;

          return (
            <article
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-[#122422] border-[#287A74]/40 shadow-md shadow-[#287A74]/10'
                  : 'bg-white/60 dark:bg-[#122422]/60 border-stone-200 dark:border-[#1E3835] hover:border-[#55A9A0]/40'
              }`}
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm sm:text-base font-bold text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74]"
                >
                  <span className="flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-[#287A74]/10 dark:bg-[#287A74]/25 text-[#287A74] dark:text-[#AEEED3] shrink-0">
                      <IconComponent className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span>{item.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 dark:text-stone-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#287A74] dark:text-[#AEEED3]' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>

              {isOpen && (
                <div
                  id={`faq-answer-${idx}`}
                  role="region"
                  aria-labelledby={`faq-question-${idx}`}
                  className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-[#1E3835]/50 pt-3.5"
                >
                  <p>{item.a}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>

    </section>
  );
};
