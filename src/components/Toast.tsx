/**
 * @license
 * SPDX-License-Identifier: MIT
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#122422] text-[#AEEED3] border-[#287A74]'
                : isError
                ? 'bg-[#2A1215] text-[#FFA0A0] border-[#8A2525]'
                : 'bg-[#FAFCFB] text-[#122422] border-[#55A9A0] dark:bg-[#122422] dark:text-[#E6F4F1]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#AEEED3] shrink-0" aria-hidden="true" />}
              {isError && <AlertCircle className="w-5 h-5 text-[#FFA0A0] shrink-0" aria-hidden="true" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-[#55A9A0] shrink-0" aria-hidden="true" />}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg hover:bg-black/20 text-current transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};
