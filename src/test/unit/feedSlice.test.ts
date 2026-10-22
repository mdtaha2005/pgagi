import { describe, it, expect } from 'vitest';
import feedReducer, {
  reorderFeedItems,
  resetFeedOrder,
  setActiveFilter,
  likeItem,
  prependLiveItem,
} from '@/store/slices/feedSlice';
import { ContentItem } from '@/types/content';

describe('feedSlice Reducer & Drag-and-Drop Reordering', () => {
  const itemA: ContentItem = {
    id: 'item-a',
    type: 'news',
    category: 'technology',
    title: 'Alpha',
    description: 'Desc A',
    url: 'https://example.com/a',
    publishedAt: '2026-10-22T10:00:00Z',
    source: { name: 'Source A' },
    metrics: { likes: 10 },
  };

  const itemB: ContentItem = {
    id: 'item-b',
    type: 'recommendation',
    category: 'entertainment',
    title: 'Beta',
    description: 'Desc B',
    url: 'https://example.com/b',
    publishedAt: '2026-10-22T09:00:00Z',
    source: { name: 'Source B' },
    metrics: { likes: 5 },
  };

  const initialState = {
    items: [itemA, itemB],
    customOrder: [],
    status: 'idle' as const,
    error: null,
    page: 1,
    hasMore: true,
    activeFilter: 'all' as const,
    liveNewCount: 0,
  };

  it('should reorder items and track customOrder on drag-and-drop', () => {
    // User drags itemB above itemA
    const reordered = [itemB, itemA];
    const state = feedReducer(initialState, reorderFeedItems(reordered));

    expect(state.items[0].id).toBe('item-b');
    expect(state.items[1].id).toBe('item-a');
    expect(state.customOrder).toEqual(['item-b', 'item-a']);
  });

  it('should reset custom order back to chronological sort', () => {
    const customState = {
      ...initialState,
      items: [itemB, itemA],
      customOrder: ['item-b', 'item-a'],
    };

    const state = feedReducer(customState, resetFeedOrder());
    expect(state.customOrder).toHaveLength(0);
    // Chronologically itemA was published at 10:00:00Z and itemB at 09:00:00Z
    expect(state.items[0].id).toBe('item-a');
    expect(state.items[1].id).toBe('item-b');
  });

  it('should optimistically like an item', () => {
    const state = feedReducer(initialState, likeItem('item-a'));
    expect(state.items[0].metrics?.likes).toBe(11);
  });

  it('should prepend live incoming items and increment liveNewCount', () => {
    const liveItem: ContentItem = {
      id: 'item-live',
      type: 'news',
      category: 'technology',
      title: 'Live Breaking News',
      description: 'Incoming live payload',
      url: 'https://example.com/live',
      publishedAt: '2026-10-22T11:00:00Z',
      source: { name: 'Live Stream' },
    };

    const state = feedReducer(initialState, prependLiveItem(liveItem));
    expect(state.items[0].id).toBe('item-live');
    expect(state.liveNewCount).toBe(1);
  });

  it('should update active type filter', () => {
    const state = feedReducer(initialState, setActiveFilter('social'));
    expect(state.activeFilter).toBe('social');
  });
});
