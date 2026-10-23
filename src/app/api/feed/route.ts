import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentItem, ContentType } from '@/types/content';
import { FeedResponse } from '@/types/api';
import { fetchLiveNews, fetchLiveTMDB, deduplicateContent } from '@/lib/apiClients';

const VALID_CATEGORIES: ContentCategory[] = [
  'technology',
  'business',
  'entertainment',
  'sports',
  'science',
  'health',
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Validate page & limit
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

    const rawLimit = parseInt(searchParams.get('limit') || '12', 10);
    const limit = isNaN(rawLimit) || rawLimit < 1 ? 12 : Math.min(rawLimit, 50);

    const rawCategories = searchParams.get('categories');
    const typeFilter = searchParams.get('type') as ContentType | 'all' | null;
    const query = (searchParams.get('q') || '').toLowerCase().trim();

    // Parse categories
    let selectedCategories: ContentCategory[] = VALID_CATEGORIES;
    if (rawCategories) {
      const parsed = rawCategories
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter((c): c is ContentCategory =>
          VALID_CATEGORIES.includes(c as ContentCategory)
        );
      if (parsed.length > 0) {
        selectedCategories = parsed;
      }
    }

    // Provider tracking
    let liveNewsCount = 0;
    let liveTmdbCount = 0;
    const liveItems: ContentItem[] = [];

    // 1. Live NewsAPI Ingestion (if key present and type allows)
    if (!typeFilter || typeFilter === 'all' || typeFilter === 'news') {
      const topCat = selectedCategories[0] || 'technology';
      const newsResult = await fetchLiveNews(topCat);
      if (newsResult && newsResult.length > 0) {
        liveItems.push(...newsResult);
        liveNewsCount = newsResult.length;
      }
    }

    // 2. Live TMDB Recommendations Ingestion (if key present and entertainment/all is requested)
    if (
      (!typeFilter || typeFilter === 'all' || typeFilter === 'recommendation') &&
      selectedCategories.includes('entertainment')
    ) {
      const tmdbResult = await fetchLiveTMDB('entertainment');
      if (tmdbResult && tmdbResult.length > 0) {
        liveItems.push(...tmdbResult);
        liveTmdbCount = tmdbResult.length;
      }
    }

    // 3. Combine with curated fallback dataset
    const combined = deduplicateContent([...liveItems, ...MOCK_CONTENT_ITEMS]);

    // 4. Filter by categories
    let filtered = combined.filter((item) =>
      selectedCategories.includes(item.category)
    );

    // 5. Filter by content type
    if (typeFilter && typeFilter !== 'all' && ['news', 'recommendation', 'social'].includes(typeFilter)) {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // 6. Filter by query if supplied
    if (query) {
      filtered = filtered.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const tagMatch = item.tags?.some((t) => t.toLowerCase().includes(query));
        const authorMatch = item.author?.name.toLowerCase().includes(query);
        return titleMatch || descMatch || tagMatch || authorMatch;
      });
    }

    // 7. Sort chronologically
    filtered.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // 8. Pagination
    const startIndex = (page - 1) * limit;
    const paginatedItems = filtered.slice(startIndex, startIndex + limit);
    const hasMore = startIndex + limit < filtered.length;

    const response: FeedResponse = {
      items: paginatedItems,
      total: filtered.length,
      page,
      limit,
      hasMore,
      providers: {
        news: { live: liveNewsCount > 0, count: liveNewsCount },
        recommendations: { live: liveTmdbCount > 0, count: liveTmdbCount },
        social: { mock: true, count: filtered.filter((i) => i.type === 'social').length },
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('[API /feed] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error while fetching feed', code: 'FEED_FETCH_ERROR' },
      { status: 500 }
    );
  }
}
