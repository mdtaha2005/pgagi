'use client';

import React from 'react';
import {
  Bookmark,
  Search,
  Trash2,
  Download,
  Compass,
  Filter,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setFavoritesFilter,
  setFavoritesSearchQuery,
  clearAllFavorites,
} from '@/store/slices/favoritesSlice';
import { setActiveSection, showToast } from '@/store/slices/uiSlice';
import { ContentCard } from '../feed/ContentCard';
import { ContentType } from '@/types/content';
import { I18N_STRINGS } from '@/utils/formatters';

export function FavoritesView() {
  const dispatch = useAppDispatch();
  const { items, filter, searchQuery } = useAppSelector((state) => state.favorites);
  const language = useAppSelector((state) => state.preferences.language);
  const t = I18N_STRINGS[language] || I18N_STRINGS.en;

  // Filter and search favorites in memory
  let filtered = items;
  if (filter !== 'all') {
    filtered = filtered.filter((i) => i.type === filter);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved favorites?')) {
      dispatch(clearAllFavorites());
      dispatch(showToast('Cleared all favorites'));
    }
  };

  const handleExport = () => {
    if (items.length === 0) return;
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsefeed-favorites-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch(showToast('Favorites exported as JSON!'));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <Bookmark className="h-6 w-6 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {t.favorites} ({items.length})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your personal library of bookmarked articles, recommendations, and threads.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              title="Export favorites as JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40"
              title="Clear all favorites"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar inside Favorites */}
      {items.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search within favorites */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setFavoritesSearchQuery(e.target.value))}
              placeholder="Filter saved items..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'all', label: t.all },
                { id: 'news', label: t.news },
                { id: 'recommendation', label: t.recommendations },
                { id: 'social', label: t.social },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setFavoritesFilter(tab.id))}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Favorites */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-4">
            <Bookmark className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {items.length === 0 ? 'No favorites yet' : 'No matching favorites'}
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {items.length === 0
              ? t.emptyFavorites
              : 'Try clearing your filter or search query.'}
          </p>
          {items.length === 0 && (
            <button
              onClick={() => dispatch(setActiveSection('feed'))}
              className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700"
            >
              <Compass className="h-4 w-4" />
              <span>Explore My Feed</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
