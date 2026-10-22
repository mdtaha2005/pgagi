'use client';

import React from 'react';
import Image from 'next/image';
import {
  Compass,
  TrendingUp,
  Bookmark,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setActiveSection,
  toggleSidebar,
  setMobileSidebarOpen,
  openPreferencesModal,
  openProfileModal,
} from '@/store/slices/uiSlice';
import { toggleCategory, ALL_CATEGORIES } from '@/store/slices/preferencesSlice';
import { I18N_STRINGS } from '@/utils/formatters';
import { ContentCategory } from '@/types/content';

export function Sidebar() {
  const dispatch = useAppDispatch();
  const { activeSection, sidebarCollapsed, mobileSidebarOpen } = useAppSelector(
    (state) => state.ui
  );
  const { selectedCategories, language } = useAppSelector((state) => state.preferences);
  const favoritesCount = useAppSelector((state) => state.favorites.items.length);
  const liveCount = useAppSelector((state) => state.feed.liveNewCount);
  const user = useAppSelector((state) => state.auth.user);

  const t = I18N_STRINGS[language] || I18N_STRINGS.en;

  const navItems = [
    {
      id: 'feed' as const,
      label: t.feed,
      icon: Compass,
      badge: liveCount > 0 ? `+${liveCount}` : undefined,
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
    },
    {
      id: 'trending' as const,
      label: t.trending,
      icon: TrendingUp,
      badge: 'HOT',
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'favorites' as const,
      label: t.favorites,
      icon: Bookmark,
      badge: favoritesCount > 0 ? `${favoritesCount}` : undefined,
      badgeColor: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold',
    },
  ];

  const handleNavClick = (section: 'feed' | 'trending' | 'favorites') => {
    dispatch(setActiveSection(section));
    dispatch(setMobileSidebarOpen(false));
  };

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-5 px-3">
      {/* Top Navigation */}
      <div className="space-y-6">
        {/* Main Nav Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                } ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
                title={item.label}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'
                  }`}
                />
                {!sidebarCollapsed && (
                  <div className="flex flex-1 items-center justify-between truncate">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Preferences Categories (when expanded) */}
        {!sidebarCollapsed && (
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="mb-2.5 flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                {t.categoriesTitle}
              </span>
              <button
                onClick={() => dispatch(openPreferencesModal())}
                className="text-[10px] lowercase text-indigo-500 hover:underline"
              >
                edit
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 px-1">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => dispatch(toggleCategory(cat))}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium capitalize transition-all ${
                      isSelected
                        ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile & Collapse Toggle */}
      <div className="space-y-3 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        {/* Settings button */}
        <button
          onClick={() => dispatch(openPreferencesModal())}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
            sidebarCollapsed ? 'justify-center px-2' : ''
          }`}
          title={t.settings}
        >
          <Sliders className="h-4 w-4 text-slate-400" />
          {!sidebarCollapsed && <span>{t.settings}</span>}
        </button>

        {/* User Card */}
        <div
          onClick={() => dispatch(openProfileModal())}
          className={`flex items-center gap-3 rounded-xl p-2 cursor-pointer transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
            sidebarCollapsed ? 'justify-center' : ''
          }`}
          title="Click to view profile"
        >
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-indigo-500/40">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-indigo-600 text-white text-xs font-bold">
                {user.name.slice(0, 1)}
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>
            </div>
          )}
        </div>

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex justify-end pt-2">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block sticky top-16 h-[calc(100vh-4rem)] border-r border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all duration-300 z-30 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => dispatch(setMobileSidebarOpen(false))}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Box */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl p-2 z-50 flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-base bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                PulseFeed Navigation
              </span>
              <button
                onClick={() => dispatch(setMobileSidebarOpen(false))}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
