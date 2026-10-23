'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  Bookmark,
  Share2,
  ExternalLink,
  Star,
  GripVertical,
  Clock,
  CheckCircle2,
  MessageCircle,
  Repeat2,
  Sparkles,
} from 'lucide-react';
import { ContentItem } from '@/types/content';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleFavorite } from '@/store/slices/favoritesSlice';
import { likeItem } from '@/store/slices/feedSlice';
import { setActiveItemModal, showToast } from '@/store/slices/uiSlice';
import {
  formatRelativeTime,
  getCategoryBadgeStyle,
  getTypeBadgeStyle,
  I18N_STRINGS,
} from '@/utils/formatters';

interface ContentCardProps {
  item: ContentItem;
  dragControls?: any;
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
}

export function ContentCard({
  item,
  dragControls,
  dragHandleProps,
  isDragging,
}: ContentCardProps) {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites.items);
  const { density, language } = useAppSelector((state) => state.preferences);
  const isFavorite = favorites.some((fav) => fav.id === item.id);
  const [imageError, setImageError] = useState(false);

  const t = I18N_STRINGS[language] || I18N_STRINGS.en;
  const categoryStyle = getCategoryBadgeStyle(item.category);
  const typeStyle = getTypeBadgeStyle(item.type);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFavorite(item));
    dispatch(
      showToast(
        isFavorite
          ? `Removed "${item.title.slice(0, 30)}..." from favorites`
          : `Saved "${item.title.slice(0, 30)}..." to favorites`
      )
    );
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(likeItem(item.id));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(item.url || window.location.href);
      dispatch(showToast('Link copied to clipboard!'));
    }
  };

  const handleOpenDetail = () => {
    dispatch(setActiveItemModal(item));
  };

  const isCompact = density === 'compact';

  return (
    <article
      onClick={handleOpenDetail}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragging
          ? 'shadow-2xl scale-[1.02] border-indigo-500 ring-2 ring-indigo-500/30 bg-slate-900 z-50'
          : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-indigo-500/10 hover:-translate-y-0.5'
      }`}
      style={{ minHeight: isCompact ? '280px' : '370px' }}
      aria-label={item.title}
    >
      {/* Top Banner & Image */}
      <div className="relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div className={`relative w-full ${isCompact ? 'h-36' : 'h-48'}`}>
          {item.imageUrl && !imageError ? (
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-400">
              <Sparkles className="h-8 w-8 text-indigo-400" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Drag Handle with pointer controls */}
          <div
            {...dragHandleProps}
            onPointerDown={(e) => {
              if (dragControls) {
                dragControls.start(e);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-white/80 backdrop-blur-md opacity-70 transition-all hover:opacity-100 hover:scale-105 cursor-grab active:cursor-grabbing hover:bg-black/80 shadow-md"
            title="Drag to reorder card"
            aria-label="Drag card to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Badges on Top Right */}
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5 z-10">
            {item.trendingRank && (
              <span className="flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                🔥 #{item.trendingRank}
              </span>
            )}
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold backdrop-blur-md ${typeStyle.badge}`}
            >
              {typeStyle.label}
            </span>
          </div>

          {/* Category & Time at bottom of image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-white/90 z-10">
            <span
              className={`rounded-md border px-2.5 py-0.5 font-medium capitalize backdrop-blur-md shadow-sm ${categoryStyle.bg} ${categoryStyle.text} ${categoryStyle.border}`}
            >
              {item.category}
            </span>
            <span className="flex items-center gap-1 text-slate-200 drop-shadow">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(item.publishedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className={`flex flex-1 flex-col justify-between ${isCompact ? 'p-3.5' : 'p-4'}`}>
        <div>
          {/* Recommendation Metadata Bar */}
          {item.type === 'recommendation' && item.recommendationMeta && (
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-500" />
                {item.recommendationMeta.rating}
              </span>
              <span>•</span>
              <span className="capitalize">{item.recommendationMeta.mediaType}</span>
              <span>•</span>
              <span>{item.recommendationMeta.year}</span>
              {item.recommendationMeta.duration && (
                <>
                  <span>•</span>
                  <span>{item.recommendationMeta.duration}</span>
                </>
              )}
            </div>
          )}

          {/* Social Author Bar */}
          {item.type === 'social' && item.author && (
            <div className="mb-2 flex items-center gap-2">
              {item.author.avatarUrl ? (
                <div className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-slate-300 dark:ring-slate-700">
                  <Image
                    src={item.author.avatarUrl}
                    alt={item.author.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {item.author.name}
                </span>
                {item.author.verified && (
                  <CheckCircle2 className="h-3.5 w-3.5 fill-blue-500 text-white" />
                )}
                {item.author.handle && (
                  <span className="text-slate-400 dark:text-slate-500">
                    {item.author.handle}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <h3
            className={`font-bold leading-snug tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
              isCompact ? 'line-clamp-2 text-sm' : 'line-clamp-2 text-base'
            }`}
          >
            {item.title}
          </h3>

          {/* Description */}
          <p
            className={`mt-1.5 text-slate-600 dark:text-slate-400 leading-relaxed ${
              isCompact ? 'line-clamp-2 text-xs' : 'line-clamp-3 text-xs'
            }`}
          >
            {item.description}
          </p>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && !isCompact && (
            <div className="mt-2.5 flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-3">
          {/* Source / Publisher */}
          <span className="truncate text-xs font-semibold text-slate-500 dark:text-slate-400 max-w-[120px]">
            {item.source.name}
          </span>

          {/* Interactive Action Buttons */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Likes */}
            <button
              onClick={handleLike}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-500"
              aria-label="Like content"
            >
              <Heart
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  item.socialMeta?.isLiked
                    ? 'fill-rose-500 text-rose-500'
                    : 'text-slate-400 hover:text-rose-500'
                }`}
              />
              <span className="font-medium">
                {item.socialMeta?.likesCount ?? item.metrics?.likes ?? 0}
              </span>
            </button>

            {/* Social Comments / Retweets if available */}
            {item.type === 'social' && item.socialMeta && (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {item.socialMeta.repliesCount}
                </span>
                <span className="flex items-center gap-0.5">
                  <Repeat2 className="h-3.5 w-3.5" />
                  {item.socialMeta.retweetsCount}
                </span>
              </div>
            )}

            {/* Bookmark Favorite */}
            <button
              onClick={handleToggleFavorite}
              className={`rounded-lg p-1.5 transition-all ${
                isFavorite
                  ? 'bg-amber-500/15 text-amber-500 dark:bg-amber-500/20'
                  : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-amber-500'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Bookmark
                className={`h-4 w-4 transition-transform active:scale-125 ${
                  isFavorite ? 'fill-amber-500 text-amber-500' : ''
                }`}
              />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500"
              title="Share"
              aria-label="Share content"
            >
              <Share2 className="h-4 w-4" />
            </button>

            {/* External Direct Link */}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-500"
                title={t.readMore}
                aria-label={t.readMore}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
