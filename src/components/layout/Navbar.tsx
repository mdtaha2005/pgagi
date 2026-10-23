'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Search,
  X,
  Moon,
  Sun,
  Menu,
  Sparkles,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setQuery,
  setDebouncedQuery,
  searchContent,
  clearSearch,
} from '@/store/slices/searchSlice';
import {
  toggleTheme,
  setMobileSidebarOpen,
  openPreferencesModal,
  openProfileModal,
  setActiveItemModal,
} from '@/store/slices/uiSlice';
import { toggleRealTime, setLanguage } from '@/store/slices/preferencesSlice';
import { I18N_STRINGS } from '@/utils/formatters';

export function Navbar() {
  const dispatch = useAppDispatch();
  const { query, results, status } = useAppSelector((state) => state.search);
  const theme = useAppSelector((state) => state.ui.theme);
  const { realTimeEnabled, language } = useAppSelector((state) => state.preferences);
  const user = useAppSelector((state) => state.auth.user);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const t = I18N_STRINGS[language] || I18N_STRINGS.en;

  // 300ms debounce with request cancellation for search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      dispatch(clearSearch());
      return;
    }

    let activePromise: { abort?: () => void } | null = null;
    const timer = setTimeout(() => {
      dispatch(setDebouncedQuery(trimmed));
      activePromise = dispatch(searchContent({ query: trimmed }));
    }, 300);

    return () => {
      clearTimeout(timer);
      if (activePromise && typeof activePromise.abort === 'function') {
        activePromise.abort();
      }
    };
  }, [query, dispatch]);

  // Click outside to close search preview dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearSearch = () => {
    dispatch(clearSearch());
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(setMobileSidebarOpen(true))}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-300 dark:to-pink-400">
                PulseFeed
              </span>
              <span className="ml-1.5 rounded-full bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                v2.0
              </span>
            </div>
          </div>
        </div>

        {/* Center: Search Bar with Debounce & Dropdown */}
        <div
          ref={searchContainerRef}
          className="relative flex-1 max-w-xl mx-auto"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                dispatch(setQuery(e.target.value));
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2 pl-10 pr-9 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              aria-label="Search content"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown Preview */}
          {isSearchOpen && query.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span>Search Results ({results.length})</span>
                {status === 'loading' && (
                  <span className="text-indigo-500 animate-pulse">Searching...</span>
                )}
              </div>

              {results.length === 0 && status !== 'loading' ? (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  No matching results for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {results.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        dispatch(setActiveItemModal(item));
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-start gap-3"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions (Live Pill, Theme, Lang, Settings, Avatar) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Live Feed Simulator Toggle Pill */}
          <button
            onClick={() => dispatch(toggleRealTime())}
            className={`hidden md:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
              realTimeEnabled
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
            title={realTimeEnabled ? 'Click to pause live feed' : 'Click to resume live feed'}
            aria-label="Toggle live feed updates"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                realTimeEnabled
                  ? 'bg-emerald-500 animate-ping'
                  : 'bg-slate-400'
              }`}
            />
            <span>{realTimeEnabled ? t.realTimeActive : t.realTimePaused}</span>
          </button>

          {/* Preferences Button */}
          <button
            onClick={() => dispatch(openPreferencesModal())}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Content Preferences"
            aria-label="Content Preferences"
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-indigo-600" />
            )}
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Select Language"
              aria-label="Select Language"
            >
              <Globe className="h-5 w-5" />
              <span className="text-xs uppercase font-bold">{language}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xl z-50">
                {(['en', 'es', 'fr', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      dispatch(setLanguage(lang));
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      language === lang
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lang === 'en' && 'English'}
                    {lang === 'es' && 'Español'}
                    {lang === 'fr' && 'Français'}
                    {lang === 'hi' && 'हिन्दी'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => dispatch(openProfileModal())}
            className="relative ml-1 h-9 w-9 overflow-hidden rounded-full ring-2 ring-indigo-500/30 hover:ring-indigo-500 transition-all"
            title={`Signed in as ${user.name}`}
            aria-label="User Profile"
          >
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-white font-bold text-xs">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
