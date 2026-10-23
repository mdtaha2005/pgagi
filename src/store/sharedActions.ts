import { createAction } from '@reduxjs/toolkit';
import { ContentItem } from '@/types/content';

/**
 * Shared action dispatched when a user likes or unlikes any content item.
 * Handled synchronously across all slices (feed, favorites, trending, search, ui modal)
 * to prevent contradictory state copies.
 */
export const likeItem = createAction<string>('content/likeItem');

/**
 * Shared action to toggle favorite bookmark on an item.
 */
export const toggleFavorite = createAction<ContentItem>('content/toggleFavorite');
