import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentItem } from '@/types/content';
import { fetchLiveNews, deduplicateContent } from '@/lib/apiClients';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = (searchParams.get('category') || 'technology') as ContentCategory;

    let liveItems: ContentItem[] = [];
    const liveResult = await fetchLiveNews(category);
    if (liveResult && liveResult.length > 0) {
      liveItems = liveResult;
    }

    const mockNews = MOCK_CONTENT_ITEMS.filter(
      (item) => item.type === 'news' && (item.category === category || !category)
    );

    const combined = deduplicateContent([...liveItems, ...mockNews]);

    return NextResponse.json({
      items: combined,
      total: combined.length,
      source: liveItems.length > 0 ? 'live' : 'curated',
    });
  } catch (err: unknown) {
    console.error('[API /news] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch news', code: 'NEWS_FETCH_ERROR' },
      { status: 500 }
    );
  }
}
