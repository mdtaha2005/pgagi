'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  Compass,
  Filter,
  RotateCcw,
  Sparkles,
  ArrowDownCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUnifiedFeed,
  reorderFeedItems,
  resetFeedOrder,
  setActiveFilter,
  clearLiveCount,
} from '@/store/slices/feedSlice';
import { openPreferencesModal } from '@/store/slices/uiSlice';
import { ContentCard } from './ContentCard';
import { ContentItem, ContentType } from '@/types/content';
import { I18N_STRINGS } from '@/utils/formatters';

function ReorderableFeedItem({ item }: { item: ContentItem }) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="list-none"
      whileDrag={{ scale: 1.02, zIndex: 50 }}
    >
      <ContentCard item={item} dragControls={dragControls} />
    </Reorder.Item>
  );
}

export function FeedList() {
  const dispatch = useAppDispatch();
  const { items, customOrder, status, error, page, hasMore, activeFilter, liveNewCount } =
    useAppSelector((state) => state.feed);
  const { selectedCategories, language } = useAppSelector((state) => state.preferences);

  const t = I18N_STRINGS[language] || I18N_STRINGS.en;
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Initial fetch on mount or when category preferences change
  useEffect(() => {
    dispatch(
      fetchUnifiedFeed({
        page: 1,
        categories: selectedCategories,
        filter: activeFilter,
        reset: true,
      })
    );
  }, [selectedCategories, activeFilter, dispatch]);

  // Infinite scroll observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && status !== 'loading') {
        dispatch(
          fetchUnifiedFeed({
            page: page + 1,
            categories: selectedCategories,
            filter: activeFilter,
          })
        );
      }
    },
    [hasMore, status, page, selectedCategories, activeFilter, dispatch]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleReorder = (newItems: ContentItem[]) => {
    dispatch(reorderFeedItems(newItems));
  };

  const handleFilterChange = (filter: ContentType | 'all') => {
    dispatch(setActiveFilter(filter));
  };

  // Filter items in memory if needed
  const displayItems =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827]/70 p-5 backdrop-blur-md shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {t.feed}
            </h1>
            {liveNewCount > 0 && (
              <button
                onClick={() => dispatch(clearLiveCount())}
                className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 animate-pulse"
              >
                <span>+{liveNewCount} new</span>
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Unified stream curated from your {selectedCategories.length} favorite categories.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
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
              onClick={() => handleFilterChange(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reorder Drag Hint & Reset Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          {t.dragHint}
        </span>
        {customOrder.length > 0 && (
          <button
            onClick={() => dispatch(resetFeedOrder())}
            className="flex items-center gap-1 font-semibold text-indigo-500 hover:underline"
          >
            <RotateCcw className="h-3 w-3" />
            {t.resetOrder}
          </button>
        )}
      </div>

      {/* Main Drag-and-Drop Feed Grid */}
      {displayItems.length > 0 ? (
        <Reorder.Group
          axis="y"
          values={displayItems}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 list-none p-0 m-0"
        >
          {displayItems.map((item) => (
            <ReorderableFeedItem key={item.id} item={item} />
          ))}
        </Reorder.Group>
      ) : status === 'loading' ? null : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-16 text-center bg-white/40 dark:bg-[#111827]/40">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 mb-4 shadow-sm">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            No items in feed
          </h3>
          <p className="mt-1.5 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {t.noResults} Try enabling more categories in your preferences.
          </p>
          <button
            onClick={() => dispatch(openPreferencesModal())}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 transition-all hover:scale-105"
          >
            Configure Preferences
          </button>
        </div>
      )}

      {/* Loading Skeletons */}
      {status === 'loading' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-44 rounded-xl bg-slate-200 dark:bg-slate-800 w-full" />
              <div className="space-y-2 mt-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mt-4" />
            </div>
          ))}
        </div>
      )}

      {/* Error Banner */}
      {status === 'failed' && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 p-4 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error || 'Failed to load content. Please refresh.'}</p>
        </div>
      )}

      {/* Sentinel for Infinite Scroll */}
      <div ref={observerRef} className="h-10 flex items-center justify-center">
        {hasMore && status !== 'loading' && displayItems.length > 0 && (
          <button
            onClick={() =>
              dispatch(
                fetchUnifiedFeed({
                  page: page + 1,
                  categories: selectedCategories,
                  filter: activeFilter,
                })
              )
            }
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
          >
            <ArrowDownCircle className="h-4 w-4" />
            Load More Content
          </button>
        )}
      </div>
    </div>
  );
}
