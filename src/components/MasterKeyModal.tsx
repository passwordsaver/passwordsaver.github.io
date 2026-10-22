/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  Upload,
  Lock,
  Sparkles
} from 'lucide-react';
import { TRANSLATIONS, LanguageCode } from '../lib/i18n';
import { evaluateStrength } from '../lib/crypto';

interface MasterKeyModalProps {
  isSetup: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onSetup: (password: string) => Promise<void>;
  onOpenImport: () => void;
  lang: LanguageCode;
}

export const MasterKeyModal: React.FC<MasterKeyModalProps> = ({
  isSetup,
  onUnlock,
  onSetup,
  onOpenImport,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = evaluateStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (isSetup) {
      if (password.length < 8) {
        setErrorMessage(t.password_too_short);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage(t.password_mismatch);
        return;
      }

      setIsLoading(true);
      try {
        await onSetup(password);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to initialize vault.');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!password) return;
      setIsLoading(true);
      try {
        const success = await onUnlock(password);
        if (!success) {
          setErrorMessage(t.incorrect_password);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage(t.incorrect_password);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const strengthColorMap = {
    0: 'bg-stone-300 dark:bg-stone-700',
    1: 'bg-rose-500',
    2: 'bg-amber-500',
    3: 'bg-[#55A9A0]',
    4: 'bg-[#287A74]',
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#122422] border border-[#287A74]/20 shadow-2xl transition-all duration-300">
      
      {/* Icon & Title */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#287A74] to-[#55A9A0] text-white shadow-lg shadow-[#287A74]/25 mb-4">
          {isSetup ? <KeyRound className="w-7 h-7 text-[#FFF8B0]" /> : <Lock className="w-7 h-7 text-[#FFF8B0]" />}
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black text-[#122422] dark:text-[#E6F4F1] tracking-tight">
          {isSetup ? t.setup_master_title : t.unlock_vault}
        </h2>
        
        <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          {isSetup ? t.setup_master_desc : t.enter_master_password}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="master-key-input" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
            {t.master_password}
          </label>
          <div className="relative">
            <input
              id="master-key-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoFocus
              className="w-full pl-4 pr-11 py-3 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74] dark:focus:ring-[#AEEED3] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              aria-label={showPassword ? t.hide_password : t.reveal_password}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Strength Meter on Setup */}
          {isSetup && password.length > 0 && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-500 dark:text-stone-400">{t.strength_label}:</span>
                <span className="text-[#287A74] dark:text-[#AEEED3]">
                  {t[strength.labelKey] || strength.labelKey}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full transition-all duration-300 ${
                      step <= strength.score ? strengthColorMap[strength.score] : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Input for Setup */}
        {isSetup && (
          <div>
            <label htmlFor="confirm-master-key" className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              {t.confirm_master_password}
            </label>
            <input
              id="confirm-master-key"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-[#1E3835] bg-stone-50 dark:bg-[#0B1615] text-[#122422] dark:text-[#E6F4F1] focus:outline-none focus:ring-2 focus:ring-[#287A74] dark:focus:ring-[#AEEED3] transition-all"
            />
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div role="alert" className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#287A74] to-[#55A9A0] hover:opacity-95 text-white shadow-md shadow-[#287A74]/30 focus:outline-none focus:ring-2 focus:ring-[#FFF8B0] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              {t.processing}
            </span>
          ) : isSetup ? (
            t.create_vault
          ) : (
            t.unlock_vault
          )}
        </button>
      </form>

      {/* Alternative actions on Unlock screen */}
      {!isSetup && (
        <div className="mt-6 pt-5 border-t border-stone-200 dark:border-[#1E3835] flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onOpenImport}
            className="flex items-center gap-1.5 text-stone-600 dark:text-stone-300 hover:text-[#287A74] dark:hover:text-[#AEEED3] font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{t.import_vault}</span>
          </button>

          <span className="text-[11px] text-stone-400">
            AES-GCM • 100,000 PBKDF2
          </span>
        </div>
      )}
    </div>
  );
};
