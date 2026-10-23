import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentItem } from '@/types/content';
import { fetchLiveTMDB, deduplicateContent } from '@/lib/apiClients';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as ContentCategory | null;

    let recs: ContentItem[] = [];

    // Attempt live TMDB fetch
    const liveRecs = await fetchLiveTMDB(category || 'entertainment');
    if (liveRecs && liveRecs.length > 0) {
      recs = liveRecs;
    }

    // Curated fallback
    const mockRecs = MOCK_CONTENT_ITEMS.filter((item) => item.type === 'recommendation');
    const combined = deduplicateContent([...recs, ...mockRecs]);

    let finalItems = combined;
    if (category) {
      finalItems = finalItems.filter((item) => item.category === category);
    }

    return NextResponse.json({
      items: finalItems,
      total: finalItems.length,
      source: recs.length > 0 ? 'live' : 'curated',
    });
  } catch (err: unknown) {
    console.error('[API /recommendations] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', code: 'RECS_FETCH_ERROR' },
      { status: 500 }
    );
  }
}
