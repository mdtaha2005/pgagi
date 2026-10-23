import { ContentCategory, ContentItem } from '@/types/content';

interface NewsApiArticle {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
  source?: { id?: string; name?: string };
  author?: string;
}

interface TmdbMediaResult {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  poster_path?: string;
  backdrop_path?: string;
}

/**
 * Fetch live news from NewsAPI if NEWS_API_KEY is configured.
 * Handles timeouts, rate limits, and network errors gracefully.
 */
export async function fetchLiveNews(category: ContentCategory): Promise<ContentItem[] | null> {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    // NewsAPI top headlines
    const url = `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(category)}&pageSize=6&apiKey=${apiKey.trim()}`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[NewsAPI] Received HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data.articles || !Array.isArray(data.articles)) {
      return null;
    }

    return (data.articles as NewsApiArticle[])
      .filter((art) => art.title && art.title !== '[Removed]')
      .map((art, idx: number): ContentItem => ({
        id: `newsapi-${category}-${idx}-${encodeURIComponent(art.url || idx)}`,
        type: 'news',
        category,
        title: art.title || 'Breaking News',
        description: art.description || art.content || 'Latest news update from source.',
        content: art.content || art.description || undefined,
        url: art.url || 'https://news.google.com',
        imageUrl: art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
        publishedAt: art.publishedAt || new Date().toISOString(),
        source: {
          id: art.source?.id || 'newsapi',
          name: art.source?.name || 'NewsAPI',
          isMock: false,
          sourceType: 'live',
        },
        author: {
          name: art.author || art.source?.name || 'Live News Wire',
          verified: true,
        },
        metrics: {
          likes: Math.floor(Math.random() * 200) + 20,
          views: 3500,
        },
        tags: [category, 'LiveNews'],
        isLiked: false,
      }));
  } catch (err: unknown) {
    console.warn('[NewsAPI] Request failed or timed out:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Fetch live movie/series recommendations from TMDB if TMDB_API_KEY is configured.
 * Handles timeouts and rate limits gracefully.
 */
export async function fetchLiveTMDB(category?: ContentCategory): Promise<ContentItem[] | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const url = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey.trim()}`;
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[TMDB] Received HTTP ${res.status}: ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    if (!data.results || !Array.isArray(data.results)) {
      return null;
    }

    return (data.results as TmdbMediaResult[]).slice(0, 8).map((media): ContentItem => {
      const isTv = media.media_type === 'tv';
      const title = media.title || media.name || 'Featured Recommendation';
      const yearStr = media.release_date || media.first_air_date || '2024';
      const year = parseInt(yearStr.slice(0, 4), 10) || 2024;
      const rating = Math.round((media.vote_average || 8) * 10) / 10;

      return {
        id: `tmdb-${media.id}`,
        type: 'recommendation',
        category: category || 'entertainment',
        title,
        description: media.overview || 'Critically acclaimed media recommendation.',
        url: `https://www.themoviedb.org/${isTv ? 'tv' : 'movie'}/${media.id}`,
        imageUrl: media.poster_path
          ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
          : media.backdrop_path
          ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
          : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
        publishedAt: new Date().toISOString(),
        source: {
          id: 'tmdb',
          name: 'TMDB (Live API)',
          isMock: false,
          sourceType: 'live',
        },
        metrics: {
          likes: Math.round((media.vote_count || 100) / 2),
          rating,
        },
        recommendationMeta: {
          mediaType: isTv ? 'series' : 'movie',
          rating,
          year,
        },
        tags: ['Trending', isTv ? 'TV' : 'Movie', 'Cinema'],
        isLiked: false,
      };
    });
  } catch (err: unknown) {
    console.warn('[TMDB] Request failed or timed out:', err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Deduplicates content items by unique ID and title.
 */
export function deduplicateContent(items: ContentItem[]): ContentItem[] {
  const seenIds = new Set<string>();
  const seenTitles = new Set<string>();
  const result: ContentItem[] = [];

  for (const item of items) {
    const normalizedTitle = item.title.trim().toLowerCase();
    if (!seenIds.has(item.id) && !seenTitles.has(normalizedTitle)) {
      seenIds.add(item.id);
      seenTitles.add(normalizedTitle);
      result.push(item);
    }
  }

  return result;
}
