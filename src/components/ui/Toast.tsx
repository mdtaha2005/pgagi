'use client';

import React, { useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearToast } from '@/store/slices/uiSlice';

export function Toast() {
  const dispatch = useAppDispatch();
  const toastMessage = useAppSelector((state) => state.ui.toastMessage);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 4000);
    return () => clearTimeout(timer);
  }, [toastMessage, dispatch]);

  if (!toastMessage) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-indigo-500/30 bg-slate-950/90 text-white px-4 py-3 shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-5 max-w-sm"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400">
        <Bell className="h-4 w-4" />
      </div>
      <p className="flex-1 text-xs font-medium leading-snug">{toastMessage}</p>
      <button
        onClick={() => dispatch(clearToast())}
        className="rounded-lg p-1 text-slate-400 hover:text-white"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
