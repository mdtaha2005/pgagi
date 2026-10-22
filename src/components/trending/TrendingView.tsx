'use client';

import React, { useEffect } from 'react';
import {
  TrendingUp,
  Flame,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTrendingItems,
  setSelectedCategory,
} from '@/store/slices/trendingSlice';
import { ContentCard } from '../feed/ContentCard';
import { ContentCategory } from '@/types/content';
import { ALL_CATEGORIES } from '@/store/slices/preferencesSlice';
import { I18N_STRINGS } from '@/utils/formatters';

export function TrendingView() {
  const dispatch = useAppDispatch();
  const { items, status, error, selectedCategory } = useAppSelector(
    (state) => state.trending
  );
  const language = useAppSelector((state) => state.preferences.language);
  const t = I18N_STRINGS[language] || I18N_STRINGS.en;

  useEffect(() => {
    dispatch(fetchTrendingItems(selectedCategory));
  }, [selectedCategory, dispatch]);

  const handleCategorySelect = (category: ContentCategory | 'all') => {
    dispatch(setSelectedCategory(category));
  };

  return (
    <div className="space-y-6">
      {/* Trending Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 dark:from-amber-950/30 dark:via-purple-950/20 dark:to-slate-900/80 p-6 backdrop-blur-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
                <Flame className="h-6 w-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                {t.trending} Leaderboard
              </h1>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Real-time viral index aggregating the highest-engagement news, media recommendations, and social discussions.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/20 px-3.5 py-1.5 rounded-2xl border border-amber-500/30 self-start sm:self-auto">
            <Award className="h-4 w-4" />
            <span>Updated Every Hour</span>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition-all capitalize whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          All Topics
        </button>
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all capitalize whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Trending Cards */}
      {status === 'loading' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 animate-pulse p-4"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-slate-400 text-xs">
          No trending items found for this category.
        </div>
      )}
    </div>
  );
}
