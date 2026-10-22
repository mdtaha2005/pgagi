'use client';

import React from 'react';
import {
  X,
  Sliders,
  Check,
  RefreshCw,
  Zap,
  Globe,
  LayoutGrid,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { closePreferencesModal, showToast } from '@/store/slices/uiSlice';
import {
  toggleCategory,
  setDensity,
  setLanguage,
  toggleRealTime,
  resetPreferences,
  ALL_CATEGORIES,
} from '@/store/slices/preferencesSlice';
import { fetchUnifiedFeed } from '@/store/slices/feedSlice';
import { I18N_STRINGS } from '@/utils/formatters';

export function PreferencesModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.preferencesModalOpen);
  const {
    selectedCategories,
    density,
    language,
    realTimeEnabled,
  } = useAppSelector((state) => state.preferences);

  if (!isOpen) return null;

  const t = I18N_STRINGS[language] || I18N_STRINGS.en;

  const handleSaveAndRefresh = () => {
    dispatch(
      fetchUnifiedFeed({
        categories: selectedCategories,
        reset: true,
      })
    );
    dispatch(showToast('Preferences updated and feed refreshed!'));
    dispatch(closePreferencesModal());
  };

  const handleReset = () => {
    dispatch(resetPreferences());
    dispatch(showToast('Reset to default preferences'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(closePreferencesModal())}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl z-10 transition-all max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 id="preferences-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t.settings}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize your content streams and dashboard behavior
              </p>
            </div>
          </div>
          <button
            onClick={() => dispatch(closePreferencesModal())}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close preferences"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="space-y-6 py-5">
          {/* Categories Multi-Select */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              {t.categoriesTitle} (Select your favorites)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => dispatch(toggleCategory(cat))}
                    className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold capitalize border transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">
              Your feed will prioritize and blend content matching these topics.
            </p>
          </div>

          {/* Real-Time Live Feed Simulation Toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  Real-Time Live Updates
                </span>
                <span className="text-[11px] text-slate-400">
                  Simulate incoming breaking news and live social activity
                </span>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleRealTime())}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                realTimeEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-label="Toggle real-time updates"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  realTimeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Density Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              <LayoutGrid className="inline h-3.5 w-3.5 mr-1" />
              {t.density}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => dispatch(setDensity('comfortable'))}
                className={`flex flex-col items-center justify-center rounded-xl p-3 border text-xs font-semibold transition-all ${
                  density === 'comfortable'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{t.comfortable}</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                  Full imagery & details
                </span>
              </button>
              <button
                onClick={() => dispatch(setDensity('compact'))}
                className={`flex flex-col items-center justify-center rounded-xl p-3 border text-xs font-semibold transition-all ${
                  density === 'compact'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{t.compact}</span>
                <span className="text-[10px] font-normal text-slate-400 mt-0.5">
                  Streamlined cards
                </span>
              </button>
            </div>
          </div>

          {/* Multi-language selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5">
              <Globe className="inline h-3.5 w-3.5 mr-1" />
              {t.language}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' },
                { code: 'fr', label: 'Français' },
                { code: 'hi', label: 'हिन्दी' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => dispatch(setLanguage(lang.code as any))}
                  className={`rounded-xl py-2 px-3 text-xs font-semibold border transition-all ${
                    language === lang.code
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSaveAndRefresh}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            {t.savePreferences}
          </button>
        </div>
      </div>
    </div>
  );
}
