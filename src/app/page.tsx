'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { FeedList } from '@/components/feed/FeedList';
import { TrendingView } from '@/components/trending/TrendingView';
import { FavoritesView } from '@/components/favorites/FavoritesView';
import { useAppSelector } from '@/store/hooks';

export default function DashboardPage() {
  const activeSection = useAppSelector((state) => state.ui.activeSection);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {activeSection === 'feed' && <FeedList />}
          {activeSection === 'trending' && <TrendingView />}
          {activeSection === 'favorites' && <FavoritesView />}
        </main>
      </div>
    </div>
  );
}
