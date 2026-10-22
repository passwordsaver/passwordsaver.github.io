/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Search,
  Globe,
  Sun,
  Moon,
  Download,
  Lock,
  Heart,
  ChevronDown,
  Check,
  Menu,
  X
} from 'lucide-react';
import { TRANSLATIONS, SUPPORTED_LANGUAGES, LanguageCode } from '../lib/i18n';

interface NavbarProps {
  lang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isUnlocked: boolean;
  onLockVault: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isInstallable: boolean;
  onInstallPWA: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onSelectLang,
  theme,
  onToggleTheme,
  isUnlocked,
  onLockVault,
  searchQuery,
  onSearchChange,
  isInstallable,
  onInstallPWA,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  
  // Desktop language dropdown state
  const [desktopLangOpen, setDesktopLangOpen] = useState(false);
  const desktopLangRef = useRef<HTMLDivElement>(null);

  // Mobile & Tablet Menu Toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileLangOpen, setMobileLangOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (desktopLangRef.current && !desktopLangRef.current.contains(target)) {
        setDesktopLangOpen(false);
      }
      if (mobileNavRef.current && !mobileNavRef.current.contains(target)) {
        // Only close if clicked outside the entire mobile header
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (code: LanguageCode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectLang(code);
    setDesktopLangOpen(false);
    setMobileLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#287A74]/15 bg-white/95 dark:bg-[#0B1615]/95 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand Identity (Protected against cutoff) */}
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          <a
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#55A9A0] rounded-xl p-1"
            aria-label="PasswordSaver Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#55A9A0] to-[#287A74] flex items-center justify-center text-white shadow-sm shadow-[#287A74]/30 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Shield className="w-5 h-5 text-[#FFF8B0]" aria-hidden="true" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold tracking-tight text-lg text-[#122422] dark:text-[#E6F4F1] whitespace-nowrap">
                Password<span className="text-[#287A74] dark:text-[#AEEED3]">Saver</span>
              </span>
              <span className="hidden xl:inline-block text-[10px] uppercase tracking-wider font-semibold text-[#55A9A0] whitespace-nowrap">
                Zero-Knowledge Vault
              </span>
            </div>
          </a>
        </div>

        {/* Global Search Bar (Desktop only in header) */}
        {isUnlocked && (
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t.search_placeholder}
                aria-label={t.search_placeholder}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50/80 dark:bg-[#122422] text-[#122422] dark:text-[#E6F4F1] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#287A74] dark:focus:ring-[#AEEED3] transition-all"
              />
            </div>
          </div>
        )}

        {/* Desktop Navbar Controls (lg and above) */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative" ref={desktopLangRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDesktopLangOpen(!desktopLangOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#122422] text-[#122422] dark:text-[#E6F4F1] transition-colors cursor-pointer"
              aria-haspopup="true"
              aria-expanded={desktopLangOpen}
              aria-label="Select Language"
            >
              <span className="text-base leading-none">{currentLangObj.flag}</span>
              <span>{currentLangObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" aria-hidden="true" />
            </button>

            {desktopLangOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-56 py-1.5 rounded-2xl bg-white dark:bg-[#122422] border border-stone-200 dark:border-[#1E3835] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Languages (8)
                </div>
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={(e) => handleLanguageSelect(item.code, e)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                      item.code === lang
                        ? 'bg-[#AEEED3]/25 text-[#287A74] dark:text-[#AEEED3] font-bold'
                        : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1E3835]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.flag}</span>
                      <span>{item.nativeName} ({item.name})</span>
                    </span>
                    {item.code === lang && <Check className="w-3.5 h-3.5 text-[#287A74] dark:text-[#AEEED3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#122422] text-[#122422] dark:text-[#E6F4F1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#55A9A0] cursor-pointer"
            aria-label={theme === 'dark' ? t.theme_light : t.theme_dark}
            title={theme === 'dark' ? t.theme_light : t.theme_dark}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFF8B0]" /> : <Moon className="w-4 h-4 text-[#287A74]" />}
          </button>

          {/* PWA Install Button */}
          {isInstallable && (
            <button
              type="button"
              onClick={onInstallPWA}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#55A9A0]/15 hover:bg-[#55A9A0]/25 text-[#287A74] dark:text-[#AEEED3] border border-[#55A9A0]/30 transition-colors cursor-pointer"
              aria-label={t.install_pwa}
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.install_pwa}</span>
            </button>
          )}

          {/* Support Developer (Ko-fi) */}
          <a
            href="https://ko-fi.com/kishara"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#FFF8B0]/50 hover:bg-[#FFF8B0] text-[#122422] border border-[#FFF8B0] transition-colors shadow-xs"
            aria-label={t.support_kofi}
            title={t.ko_fi_tooltip}
          >
            <Heart className="w-3.5 h-3.5 text-[#287A74] fill-[#287A74]" aria-hidden="true" />
            <span>{t.support_kofi}</span>
          </a>

          {/* Lock Button */}
          {isUnlocked && (
            <button
              type="button"
              onClick={onLockVault}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              aria-label={t.lock_vault}
              title={t.lock_vault}
            >
              <Lock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.lock_vault}</span>
            </button>
          )}
        </div>

        {/* Mobile & Tablet Toggle Controls (Screen < lg) */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Quick Lock Button if unlocked */}
          {isUnlocked && (
            <button
              type="button"
              onClick={onLockVault}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
              aria-label={t.lock_vault}
              title={t.lock_vault}
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* Clean Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#122422] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-[#122422] dark:text-[#E6F4F1] transition-all cursor-pointer shadow-xs"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[#287A74] dark:text-[#AEEED3]" />
            ) : (
              <Menu className="w-5 h-5 text-[#287A74] dark:text-[#AEEED3]" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Full-Width Toggle Drawer Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileNavRef}
          className="lg:hidden border-t border-stone-200 dark:border-[#1E3835] bg-white/98 dark:bg-[#0B1615]/98 backdrop-blur-xl px-4 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200 space-y-4"
        >
          {/* Mobile Search Bar (If unlocked) */}
          {isUnlocked && (
            <div>
              <label htmlFor="mobile-search-input" className="sr-only">Search</label>
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500 pointer-events-none" aria-hidden="true" />
                <input
                  id="mobile-search-input"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={t.search_placeholder}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#122422] text-[#122422] dark:text-[#E6F4F1] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#287A74]"
                />
              </div>
            </div>
          )}

          {/* Action Row: Theme, Install, Ko-fi */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#122422] text-xs font-bold text-[#122422] dark:text-[#E6F4F1] transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFF8B0]" /> : <Moon className="w-4 h-4 text-[#287A74]" />}
              <span>{theme === 'dark' ? t.theme_light : t.theme_dark}</span>
            </button>

            {/* Install App Button */}
            {isInstallable && (
              <button
                type="button"
                onClick={() => {
                  onInstallPWA();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#55A9A0]/15 text-[#287A74] dark:text-[#AEEED3] border border-[#55A9A0]/30 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{t.install_pwa}</span>
              </button>
            )}

            {/* Support on Ko-fi */}
            <a
              href="https://ko-fi.com/kishara"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#FFF8B0]/50 text-[#122422] border border-[#FFF8B0] text-xs font-bold transition-colors col-span-2 shadow-xs"
            >
              <Heart className="w-4 h-4 text-[#287A74] fill-[#287A74]" />
              <span>{t.support_kofi}</span>
            </a>
          </div>

          {/* Language Selection Accordion in Mobile Menu */}
          <div className="pt-2 border-t border-stone-100 dark:border-[#1E3835]/60">
            <button
              type="button"
              onClick={() => setMobileLangOpen(!mobileLangOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-50 dark:bg-[#122422] border border-stone-200 dark:border-[#1E3835] text-xs font-bold text-[#122422] dark:text-[#E6F4F1] cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#287A74] dark:text-[#AEEED3]" />
                <span>Language: {currentLangObj.flag} {currentLangObj.name}</span>
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {mobileLangOpen && (
              <div className="grid grid-cols-2 gap-1.5 mt-2 p-2 rounded-2xl bg-stone-50/70 dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835]">
                {SUPPORTED_LANGUAGES.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={(e) => {
                      handleLanguageSelect(item.code, e);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between p-2 text-xs rounded-lg transition-colors cursor-pointer ${
                      item.code === lang
                        ? 'bg-[#AEEED3]/25 text-[#287A74] dark:text-[#AEEED3] font-bold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#1E3835]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="text-sm">{item.flag}</span>
                      <span className="truncate">{item.nativeName}</span>
                    </span>
                    {item.code === lang && <Check className="w-3.5 h-3.5 text-[#287A74] dark:text-[#AEEED3] shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </header>
  );
};
