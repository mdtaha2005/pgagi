import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { deduplicateContent, fetchLiveNews, fetchLiveTMDB } from '@/lib/apiClients';
import { ContentItem } from '@/types/content';

describe('apiClients & deduplicateContent', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('deduplicateContent', () => {
    const item1: ContentItem = {
      id: 'item-1',
      type: 'news',
      category: 'technology',
      title: 'Unique Title 1',
      description: 'Desc 1',
      url: 'https://example.com/1',
      publishedAt: '2026-10-22T00:00:00Z',
      source: { name: 'Source 1' },
    };

    const item2: ContentItem = {
      id: 'item-2',
      type: 'news',
      category: 'technology',
      title: 'Unique Title 2',
      description: 'Desc 2',
      url: 'https://example.com/2',
      publishedAt: '2026-10-22T00:00:00Z',
      source: { name: 'Source 2' },
    };

    it('should return all items when all IDs and titles are unique', () => {
      const result = deduplicateContent([item1, item2]);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('item-1');
      expect(result[1].id).toBe('item-2');
    });

    it('should remove items with duplicate IDs', () => {
      const duplicateIdItem: ContentItem = {
        ...item2,
        id: 'item-1', // same ID as item1
        title: 'Different Title',
      };
      const result = deduplicateContent([item1, duplicateIdItem]);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Unique Title 1');
    });

    it('should remove items with duplicate titles regardless of casing or whitespace', () => {
      const duplicateTitleItem: ContentItem = {
        ...item2,
        id: 'item-distinct-3',
        title: '  unique title 1   ', // same normalized title
      };
      const result = deduplicateContent([item1, duplicateTitleItem]);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('item-1');
    });

    it('should handle empty array', () => {
      expect(deduplicateContent([])).toEqual([]);
    });
  });

  describe('fetchLiveNews', () => {
    it('should return null when NEWS_API_KEY is not set or empty', async () => {
      delete process.env.NEWS_API_KEY;
      const result = await fetchLiveNews('technology');
      expect(result).toBeNull();

      process.env.NEWS_API_KEY = '   ';
      const resultEmpty = await fetchLiveNews('technology');
      expect(resultEmpty).toBeNull();
    });

    it('should fetch and transform articles when NEWS_API_KEY is set and API responds 200', async () => {
      process.env.NEWS_API_KEY = 'mock-key-123';
      const mockArticles = [
        {
          title: 'Breakthrough in AI Agentic Systems',
          description: 'New autonomous capabilities deployed.',
          content: 'Detailed article content.',
          url: 'https://example.com/ai-breakthrough',
          urlToImage: 'https://example.com/img.jpg',
          publishedAt: '2026-10-22T10:00:00Z',
          source: { id: 'techcrunch', name: 'TechCrunch' },
          author: 'Jane Doe',
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ articles: mockArticles }),
      });

      const result = await fetchLiveNews('technology');
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].title).toBe('Breakthrough in AI Agentic Systems');
      expect(result![0].source.sourceType).toBe('live');
      expect(result![0].source.isMock).toBe(false);
      expect(result![0].source.name).toBe('TechCrunch');
    });

    it('should handle API HTTP errors gracefully and return null', async () => {
      process.env.NEWS_API_KEY = 'mock-key-123';
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = await fetchLiveNews('technology');
      expect(result).toBeNull();
    });

    it('should handle network timeouts or fetch rejections gracefully', async () => {
      process.env.NEWS_API_KEY = 'mock-key-123';
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network connection timeout'));

      const result = await fetchLiveNews('technology');
      expect(result).toBeNull();
    });
  });

  describe('fetchLiveTMDB', () => {
    it('should return null when TMDB_API_KEY is not set or empty', async () => {
      delete process.env.TMDB_API_KEY;
      const result = await fetchLiveTMDB('entertainment');
      expect(result).toBeNull();
    });

    it('should fetch and transform recommendations when TMDB_API_KEY is configured', async () => {
      process.env.TMDB_API_KEY = 'tmdb-mock-key';
      const mockResults = [
        {
          id: 550,
          title: 'Fight Club',
          overview: 'An insomniac office worker...',
          poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
          release_date: '1999-10-15',
          vote_average: 8.4,
          vote_count: 26000,
          media_type: 'movie',
        },
      ];

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockResults }),
      });

      const result = await fetchLiveTMDB('entertainment');
      expect(result).not.toBeNull();
      expect(result).toHaveLength(1);
      expect(result![0].id).toBe('tmdb-550');
      expect(result![0].title).toBe('Fight Club');
      expect(result![0].type).toBe('recommendation');
      expect(result![0].source.sourceType).toBe('live');
      expect(result![0].recommendationMeta?.mediaType).toBe('movie');
    });

    it('should handle TMDB network errors gracefully without crashing', async () => {
      process.env.TMDB_API_KEY = 'tmdb-mock-key';
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Fetch failed'));

      const result = await fetchLiveTMDB('entertainment');
      expect(result).toBeNull();
    });
  });
});
