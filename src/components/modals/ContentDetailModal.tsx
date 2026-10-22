'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  ExternalLink,
  Bookmark,
  Share2,
  Heart,
  Star,
  Clock,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Repeat2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveItemModal, showToast } from '@/store/slices/uiSlice';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { likeItem } from '@/store/slices/feedSlice';
import {
  formatRelativeTime,
  getCategoryBadgeStyle,
  getTypeBadgeStyle,
} from '@/utils/formatters';

export function ContentDetailModal() {
  const dispatch = useAppDispatch();
  const item = useAppSelector((state) => state.ui.activeItemModal);
  const favorites = useAppSelector((state) => state.favorites.items);
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  const isFavorite = favorites.some((fav) => fav.id === item.id);
  const categoryStyle = getCategoryBadgeStyle(item.category);
  const typeStyle = getTypeBadgeStyle(item.type);

  const handleToggleFavorite = () => {
    dispatch(toggleFavorite(item));
    dispatch(
      showToast(
        isFavorite
          ? `Removed from favorites`
          : `Saved "${item.title.slice(0, 30)}..." to favorites`
      )
    );
  };

  const handleLike = () => {
    dispatch(likeItem(item.id));
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.url || window.location.href);
      dispatch(showToast('Link copied to clipboard!'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => dispatch(setActiveItemModal(null))}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        className="relative w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-2xl z-10 max-h-[92vh] overflow-hidden flex flex-col"
      >
        {/* Top Image Banner */}
        <div className="relative w-full h-64 sm:h-72 bg-slate-950 flex-shrink-0">
          {item.imageUrl && !imageError ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-indigo-950 to-slate-900 text-slate-500">
              <Sparkles className="h-12 w-12 text-indigo-400" />
            </div>
          )}

          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={() => dispatch(setActiveItemModal(null))}
            className="absolute right-4 top-4 rounded-full bg-black/60 p-2 text-white/80 hover:text-white backdrop-blur-md transition-all hover:scale-110"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Badges on Banner */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md border px-2.5 py-1 font-semibold uppercase backdrop-blur-md ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
              >
                {item.category}
              </span>
              <span
                className={`rounded-md border px-2 py-0.5 font-semibold backdrop-blur-md ${typeStyle.badge}`}
              >
                {typeStyle.label}
              </span>
            </div>
            <span className="flex items-center gap-1 text-slate-200">
              <Clock className="h-3.5 w-3.5" />
              {formatRelativeTime(item.publishedAt)}
            </span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">
          {/* Recommendation Metadata Details */}
          {item.type === 'recommendation' && item.recommendationMeta && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 p-3.5 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex items-center gap-1 font-bold text-sm">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span>{item.recommendationMeta.rating} / 10</span>
              </div>
              <span>•</span>
              <span className="font-semibold capitalize">
                {item.recommendationMeta.mediaType}
              </span>
              <span>•</span>
              <span>Released {item.recommendationMeta.year}</span>
              {item.recommendationMeta.duration && (
                <>
                  <span>•</span>
                  <span>{item.recommendationMeta.duration}</span>
                </>
              )}
              {item.recommendationMeta.directorOrArtist && (
                <>
                  <span>•</span>
                  <span>Created by {item.recommendationMeta.directorOrArtist}</span>
                </>
              )}
            </div>
          )}

          {/* Social Author Details */}
          {item.type === 'social' && item.author && (
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-3.5 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {item.author.avatarUrl && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-indigo-500/30">
                    <Image
                      src={item.author.avatarUrl}
                      alt={item.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.author.name}
                    </span>
                    {item.author.verified && (
                      <CheckCircle2 className="h-4 w-4 fill-blue-500 text-white" />
                    )}
                  </div>
                  {item.author.handle && (
                    <span className="text-xs text-slate-400">{item.author.handle}</span>
                  )}
                </div>
              </div>

              {item.socialMeta && (
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {item.socialMeta.repliesCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="h-4 w-4" />
                    {item.socialMeta.retweetsCount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <h2
            id="detail-modal-title"
            className="text-xl sm:text-2xl font-black leading-tight text-slate-900 dark:text-slate-100"
          >
            {item.title}
          </h2>

          {/* Lead Summary */}
          <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
            {item.description}
          </p>

          {/* Extended Content if present */}
          {item.content && item.content !== item.description && (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed space-y-2">
              <p>{item.content}</p>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors"
            >
              <Heart
                className={`h-4 w-4 ${
                  item.socialMeta?.isLiked
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-400'
                }`}
              />
              <span>
                {item.socialMeta?.likesCount ?? item.metrics?.likes ?? 0} Likes
              </span>
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isFavorite
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500'
              }`}
            >
              <Bookmark
                className={`h-4 w-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : ''}`}
              />
              <span>{isFavorite ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleShare}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 text-slate-500 hover:text-indigo-500 transition-colors"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Visit Source</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
