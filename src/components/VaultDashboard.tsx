/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Star,
  ExternalLink,
  Download,
  Upload,
  Layers,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';
import { CredentialItem } from '../lib/crypto';

interface DecryptedCredential {
  item: CredentialItem;
  passwordPlain: string;
}

interface VaultDashboardProps {
  credentials: DecryptedCredential[];
  onAddCredential: () => void;
  onEditCredential: (item: CredentialItem, passwordPlain: string) => void;
  onDeleteCredential: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopyUsername: (username: string) => void;
  onCopyPassword: (password: string) => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  onClearVault: () => void;
  searchQuery: string;
  onResetSearch: () => void;
  onInstallApp?: () => void;
  lang: LanguageCode;
}

export const VaultDashboard: React.FC<VaultDashboardProps> = ({
  credentials,
  onAddCredential,
  onEditCredential,
  onDeleteCredential,
  onToggleFavorite,
  onCopyUsername,
  onCopyPassword,
  onOpenExport,
  onOpenImport,
  onClearVault,
  searchQuery,
  onResetSearch,
  onInstallApp,
  lang,
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Horizontal scroll state & ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [credentials]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = direction === 'left' ? -220 : 220;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (type: 'user' | 'pass', text: string, id: string) => {
    if (type === 'user') {
      onCopyUsername(text);
    } else {
      onCopyPassword(text);
    }
    const key = `${type}-${id}`;
    setCopiedField(key);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Filter credentials
  const filtered = credentials.filter(({ item }) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;

    const matchesFavorite = !onlyFavorites || !!item.favorite;

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const categories = [
    { key: 'all', label: t.category_all },
    { key: 'logins', label: t.category_logins },
    { key: 'finance', label: t.category_finance },
    { key: 'work', label: t.category_work },
    { key: 'personal', label: t.category_personal },
    { key: 'social', label: t.category_social },
    { key: 'notes', label: t.category_notes },
  ];

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: credentials.length, favorites: 0 };
    for (const { item } of credentials) {
      counts[item.category] = (counts[item.category] || 0) + 1;
      if (item.favorite) {
        counts.favorites += 1;
      }
    }
    return counts;
  }, [credentials]);

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'finance':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'work':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'social':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
      case 'notes':
        return 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/30';
      default:
        return 'bg-[#287A74]/15 text-[#287A74] dark:text-[#AEEED3] border-[#287A74]/30';
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Controls Hub */}
      <div className="space-y-3">
        
        {/* Row 1: Status & Action Buttons Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#122422] border border-[#287A74]/20 shadow-xs">
          
          {/* Status Counter */}
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#287A74]/10 dark:bg-[#AEEED3]/10 text-[#287A74] dark:text-[#AEEED3] font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>{filtered.length} {filtered.length === 1 ? 'Credential' : 'Credentials'}</span>
            </span>
            {searchQuery && (
              <span className="text-[11px] text-stone-400">
                (filtered from {credentials.length})
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onInstallApp && (
              <button
                type="button"
                onClick={onInstallApp}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-[#55A9A0]/15 hover:bg-[#55A9A0]/25 text-[#287A74] dark:text-[#AEEED3] border border-[#55A9A0]/30 transition-colors cursor-pointer"
                title="Install App for Offline Use"
                aria-label="Install App for Offline Use"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{t.install_pwa}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              title={t.export_vault}
              aria-label={t.export_vault}
            >
              <Download className="w-3.5 h-3.5 text-[#287A74] dark:text-[#AEEED3]" />
              <span className="hidden md:inline">{t.export_vault}</span>
            </button>

            <button
              type="button"
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              title={t.import_vault}
              aria-label={t.import_vault}
            >
              <Upload className="w-3.5 h-3.5 text-[#55A9A0]" />
              <span className="hidden md:inline">{t.import_vault}</span>
            </button>

            <button
              type="button"
              onClick={onAddCredential}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-[#287A74] to-[#55A9A0] hover:opacity-95 text-white shadow-sm shadow-[#287A74]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[#FFF8B0] cursor-pointer"
              aria-label={t.add_credential}
            >
              <Plus className="w-4 h-4" />
              <span>{t.add_credential}</span>
            </button>
          </div>

        </div>

        {/* Row 2: Category Filter Bar with BOTH Quick Dropdown & Horizontal Scrollable Pills */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#122422] border border-[#287A74]/20 shadow-xs">
          
          {/* Quick Category Dropdown */}
          <div className="relative shrink-0 flex items-center gap-1.5 pr-2 border-r border-stone-200 dark:border-[#1E3835]">
            <Filter className="w-3.5 h-3.5 text-[#287A74] dark:text-[#AEEED3] shrink-0" aria-hidden="true" />
            <select
              value={onlyFavorites ? 'favorites' : activeCategory}
              onChange={(e) => {
                if (e.target.value === 'favorites') {
                  setOnlyFavorites(true);
                  setActiveCategory('all');
                } else {
                  setOnlyFavorites(false);
                  setActiveCategory(e.target.value);
                }
              }}
              className="py-1 px-2 text-xs font-bold rounded-lg border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74] cursor-pointer"
              aria-label="Filter by Category"
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label} ({categoryCounts[cat.key] || 0})
                </option>
              ))}
              <option value="favorites">
                ★ {t.favorites_only} ({categoryCounts.favorites || 0})
              </option>
            </select>
          </div>

          {/* Left Scroll Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className={`p-1.5 rounded-lg border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-600 dark:text-stone-300 transition-opacity shrink-0 cursor-pointer ${
              canScrollLeft ? 'opacity-100' : 'opacity-30 cursor-default'
            }`}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Horizontal Scrollable Pills with Visible Scroll Hint */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth"
          >
            {categories.map((cat) => {
              const isSelected = !onlyFavorites && activeCategory === cat.key;
              const count = categoryCounts[cat.key] || 0;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setOnlyFavorites(false);
                    setActiveCategory(cat.key);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#287A74] text-white shadow-xs'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1E3835] border border-stone-200/50 dark:border-[#1E3835]/50'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}

            {/* Favorites Filter */}
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                onlyFavorites
                  ? 'bg-[#FFF8B0] text-[#122422] shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-[#1E3835] border border-stone-200/50 dark:border-[#1E3835]/50'
              }`}
              aria-label={t.favorites_only}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-[#122422]' : ''}`} />
              <span>{t.favorites_only}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none ${
                onlyFavorites
                  ? 'bg-black/15 text-stone-900 font-bold'
                  : 'bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
              }`}>
                {categoryCounts.favorites || 0}
              </span>
            </button>
          </div>

          {/* Right Scroll Arrow */}
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className={`p-1.5 rounded-lg border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-600 dark:text-stone-300 transition-opacity shrink-0 cursor-pointer ${
              canScrollRight ? 'opacity-100' : 'opacity-30 cursor-default'
            }`}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Grid of Credentials */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ item, passwordPlain }) => {
            const isRevealed = !!revealedIds[item.id];
            const isUserCopied = copiedField === `user-${item.id}`;
            const isPassCopied = copiedField === `pass-${item.id}`;

            return (
              <div
                key={item.id}
                className="group relative p-5 rounded-3xl bg-white dark:bg-[#122422] border border-stone-200 dark:border-[#1E3835] hover:border-[#287A74]/50 dark:hover:border-[#AEEED3]/40 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#287A74]/15 to-[#55A9A0]/20 text-[#287A74] dark:text-[#AEEED3] flex items-center justify-center font-black text-sm uppercase shrink-0">
                        {item.title.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-[#122422] dark:text-[#E6F4F1] tracking-tight group-hover:text-[#287A74] dark:group-hover:text-[#AEEED3] transition-colors flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {item.url && (
                            <a
                              href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-400 hover:text-[#287A74] transition-colors cursor-pointer"
                              title="Visit website"
                              aria-label={`Visit ${item.title} website`}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </h3>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md border uppercase tracking-wider ${categoryColor(item.category)}`}>
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Favorite star */}
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1.5 rounded-lg text-stone-300 dark:text-stone-600 hover:text-amber-400 dark:hover:text-amber-400 transition-colors cursor-pointer"
                      aria-label="Toggle favorite"
                    >
                      <Star
                        className={`w-4 h-4 ${item.favorite ? 'fill-amber-400 text-amber-400' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Username / Email Row */}
                  {item.username && (
                    <div className="mt-3 p-2.5 rounded-xl bg-stone-50 dark:bg-[#0B1615] border border-stone-100 dark:border-[#1E3835]/50 flex items-center justify-between text-xs">
                      <span className="text-stone-600 dark:text-stone-400 truncate max-w-[190px]">
                        {item.username}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy('user', item.username, item.id)}
                        className="p-1 rounded-md text-stone-400 hover:text-[#287A74] dark:hover:text-[#AEEED3] hover:bg-stone-200 dark:hover:bg-[#1E3835] transition-colors shrink-0 cursor-pointer"
                        title={t.copy_username}
                        aria-label={t.copy_username}
                      >
                        {isUserCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Password Row */}
                  <div className="mt-2 p-2.5 rounded-xl bg-stone-50 dark:bg-[#0B1615] border border-stone-100 dark:border-[#1E3835]/50 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#122422] dark:text-[#E6F4F1] truncate max-w-[170px] select-all">
                      {isRevealed ? passwordPlain : '••••••••••••'}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleReveal(item.id)}
                        className="p-1 rounded-md text-stone-400 hover:text-[#287A74] dark:hover:text-[#AEEED3] transition-colors cursor-pointer"
                        title={isRevealed ? t.hide_password : t.reveal_password}
                        aria-label={isRevealed ? t.hide_password : t.reveal_password}
                      >
                        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy('pass', passwordPlain, item.id)}
                        className="p-1 rounded-md text-stone-400 hover:text-[#287A74] dark:hover:text-[#AEEED3] hover:bg-stone-200 dark:hover:bg-[#1E3835] transition-colors cursor-pointer"
                        title={t.copy_password}
                        aria-label={t.copy_password}
                      >
                        {isPassCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Secure Notes preview if present */}
                  {item.notes && (
                    <div className="mt-2.5 text-[11px] text-stone-500 dark:text-stone-400 italic line-clamp-2 px-1">
                      {item.notes}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-[#1E3835]/50 flex items-center justify-between text-xs text-stone-400">
                  <span className="text-[10px]">
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditCredential(item, passwordPlain)}
                      className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-600 dark:text-stone-300 hover:text-[#287A74] dark:hover:text-[#AEEED3] transition-colors cursor-pointer"
                      aria-label={t.edit}
                      title={t.edit}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCredential(item.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                      aria-label={t.delete}
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#122422] border border-stone-200 dark:border-[#1E3835] max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#287A74]/15 text-[#287A74] dark:text-[#AEEED3] mx-auto flex items-center justify-center mb-4">
            {searchQuery ? <Layers className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
          </div>
          <h3 className="text-lg font-bold text-[#122422] dark:text-[#E6F4F1]">
            {searchQuery ? t.empty_search_title : t.empty_vault_title}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            {searchQuery ? t.empty_search_desc : t.empty_vault_desc}
          </p>

          <div className="mt-6">
            {searchQuery ? (
              <button
                type="button"
                onClick={onResetSearch}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#1E3835] transition-colors cursor-pointer"
              >
                {t.clear_search}
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddCredential}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-[#287A74] hover:bg-[#1f5f5a] text-white shadow-sm transition-all cursor-pointer"
              >
                {t.add_credential}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Vault Reset Footer Link */}
      <div className="pt-6 text-center">
        <button
          type="button"
          onClick={onClearVault}
          className="text-[11px] text-stone-400 hover:text-rose-500 transition-colors underline underline-offset-4 cursor-pointer"
        >
          {t.clear_vault}
        </button>
      </div>

    </div>
  );
};
