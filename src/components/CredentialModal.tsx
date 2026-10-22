/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  Sliders,
  Check,
  ShieldAlert,
  FolderLock
} from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';
import {
  generatePassword,
  evaluateStrength,
  GeneratorOptions,
  CredentialItem
} from '../lib/crypto';

interface CredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credential: {
    id?: string;
    title: string;
    username: string;
    passwordPlain: string;
    url?: string;
    category: CredentialItem['category'];
    notes?: string;
  }) => Promise<void>;
  initialData?: {
    id: string;
    title: string;
    username: string;
    passwordPlain: string;
    url?: string;
    category: CredentialItem['category'];
    notes?: string;
  } | null;
  lang: LanguageCode;
}

export const CredentialModal: React.FC<CredentialModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang,
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const [title, setTitle] = useState(initialData?.title || '');
  const [username, setUsername] = useState(initialData?.username || '');
  const [password, setPassword] = useState(initialData?.passwordPlain || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [category, setCategory] = useState<CredentialItem['category']>(initialData?.category || 'logins');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generator settings
  const [genOptions, setGenOptions] = useState<GeneratorOptions>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    avoidAmbiguous: true,
    passphraseMode: false,
    wordCount: 4,
  });

  const strength = evaluateStrength(password);

  const handleGenerate = () => {
    const newPass = generatePassword(genOptions);
    setPassword(newPass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !password) return;

    let cleanUrl = url.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialData?.id,
        title: title.trim(),
        username: username.trim(),
        passwordPlain: password,
        url: cleanUrl || undefined,
        category,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="credential-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-lg my-8 p-6 rounded-3xl bg-white dark:bg-[#122422] border border-[#287A74]/30 shadow-2xl text-[#122422] dark:text-[#E6F4F1] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-[#1E3835]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#287A74]/15 text-[#287A74] dark:text-[#AEEED3]">
              <FolderLock className="w-5 h-5" />
            </div>
            <h2 id="credential-modal-title" className="text-lg font-bold">
              {initialData ? t.edit_credential : t.new_credential}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#1E3835] transition-colors"
            aria-label={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Service Title */}
          <div>
            <label htmlFor="service-title-input" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              {t.service_name} *
            </label>
            <input
              id="service-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.service_placeholder}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74] dark:focus:ring-[#AEEED3]"
            />
          </div>

          {/* Username / Email */}
          <div>
            <label htmlFor="credential-username-input" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              {t.username_label}
            </label>
            <input
              id="credential-username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.username_placeholder}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74] dark:focus:ring-[#AEEED3]"
            />
          </div>

          {/* Password with generator toggle */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="credential-password-input" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                {t.password_label} *
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowGenerator(!showGenerator);
                  if (!password && !showGenerator) handleGenerate();
                }}
                className="flex items-center gap-1 text-xs font-semibold text-[#287A74] dark:text-[#AEEED3] hover:underline cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showGenerator ? t.hide_generator : t.generator_title}</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="credential-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3.5 pr-20 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74] dark:focus:ring-[#AEEED3] font-mono"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="p-1.5 text-stone-400 hover:text-[#287A74] dark:hover:text-[#AEEED3] transition-colors cursor-pointer"
                  title={t.generate_new}
                  aria-label={t.generate_new}
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                  aria-label={showPassword ? t.hide_password : t.reveal_password}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength feedback */}
            {password.length > 0 && (
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500">
                <span>{t.strength_label}: <strong className="text-[#287A74] dark:text-[#AEEED3]">{t[strength.labelKey] || strength.labelKey}</strong></span>
                <span>{t.entropy_label}: {strength.entropy} bits</span>
              </div>
            )}
          </div>

          {/* Interactive Generator Panel */}
          {showGenerator && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0B1615] border border-stone-200 dark:border-[#1E3835] space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#122422] dark:text-[#E6F4F1]">
                  {t.length}: <span className="text-[#287A74] dark:text-[#AEEED3] font-mono">{genOptions.length}</span>
                </span>
                <input
                  type="range"
                  min="8"
                  max="48"
                  value={genOptions.length}
                  onChange={(e) => {
                    const len = Number(e.target.value);
                    setGenOptions({ ...genOptions, length: len });
                    const newPass = generatePassword({ ...genOptions, length: len });
                    setPassword(newPass);
                  }}
                  className="w-32 accent-[#287A74]"
                  aria-label="Password length"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.uppercase}
                    onChange={(e) => setGenOptions({ ...genOptions, uppercase: e.target.checked })}
                    className="rounded text-[#287A74] focus:ring-[#287A74]"
                  />
                  <span>{t.uppercase}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.lowercase}
                    onChange={(e) => setGenOptions({ ...genOptions, lowercase: e.target.checked })}
                    className="rounded text-[#287A74] focus:ring-[#287A74]"
                  />
                  <span>{t.lowercase}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.numbers}
                    onChange={(e) => setGenOptions({ ...genOptions, numbers: e.target.checked })}
                    className="rounded text-[#287A74] focus:ring-[#287A74]"
                  />
                  <span>{t.numbers}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.symbols}
                    onChange={(e) => setGenOptions({ ...genOptions, symbols: e.target.checked })}
                    className="rounded text-[#287A74] focus:ring-[#287A74]"
                  />
                  <span>{t.symbols}</span>
                </label>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-[#1E3835] flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genOptions.passphraseMode}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setGenOptions({ ...genOptions, passphraseMode: enabled });
                      const newPass = generatePassword({ ...genOptions, passphraseMode: enabled });
                      setPassword(newPass);
                    }}
                    className="rounded text-[#287A74] focus:ring-[#287A74]"
                  />
                  <span className="font-medium">{t.passphrase_mode}</span>
                </label>

                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#287A74]/15 hover:bg-[#287A74]/25 text-[#287A74] dark:text-[#AEEED3] transition-colors"
                >
                  {t.generate_new}
                </button>
              </div>
            </div>
          )}

          {/* Category & Website URL in grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="credential-category-select" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                {t.category_label}
              </label>
              <select
                id="credential-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CredentialItem['category'])}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74]"
              >
                <option value="logins">{t.category_logins}</option>
                <option value="finance">{t.category_finance}</option>
                <option value="work">{t.category_work}</option>
                <option value="personal">{t.category_personal}</option>
                <option value="social">{t.category_social}</option>
                <option value="notes">{t.category_notes}</option>
              </select>
            </div>

            <div>
              <label htmlFor="credential-url-input" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
                {t.website_url}
              </label>
              <input
                id="credential-url-input"
                type="text"
                inputMode="url"
                autoComplete="off"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => {
                  const trimmed = url.trim();
                  if (trimmed && !/^https?:\/\//i.test(trimmed) && trimmed.includes('.')) {
                    setUrl(`https://${trimmed}`);
                  }
                }}
                placeholder="e.g. google.com or https://..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74]"
              />
            </div>
          </div>

          {/* Secure Notes */}
          <div>
            <label htmlFor="credential-notes-textarea" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1">
              {t.notes_label}
            </label>
            <textarea
              id="credential-notes-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.notes_placeholder}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-stone-200 dark:border-[#1E3835] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-stone-200 dark:border-[#1E3835] hover:bg-stone-100 dark:hover:bg-[#1E3835] text-stone-700 dark:text-stone-200 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#287A74] to-[#55A9A0] hover:opacity-95 text-white shadow-sm shadow-[#287A74]/30 focus:outline-none focus:ring-2 focus:ring-[#FFF8B0] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? t.processing : t.save}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
