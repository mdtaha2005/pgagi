import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory } from '@/types/content';
import { TrendingResponse } from '@/types/api';
import { deduplicateContent } from '@/lib/apiClients';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') as ContentCategory | 'all' | null;

    let items = deduplicateContent([...MOCK_CONTENT_ITEMS]);

    if (category && category !== 'all') {
      items = items.filter((item) => item.category === category);
    }

    // Rank by composite engagement score
    items.sort((a, b) => {
      const scoreA =
        (a.metrics?.likes || 0) +
        (a.metrics?.views || 0) / 10 +
        (a.recommendationMeta?.rating || 0) * 100;
      const scoreB =
        (b.metrics?.likes || 0) +
        (b.metrics?.views || 0) / 10 +
        (b.recommendationMeta?.rating || 0) * 100;
      return scoreB - scoreA;
    });

    const rankedItems = items.map((item, index) => ({
      ...item,
      isTrending: true,
      trendingRank: index + 1,
    }));

    const response: TrendingResponse = {
      items: rankedItems,
      total: rankedItems.length,
      category: category || 'all',
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('[API /trending] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch trending items', code: 'TRENDING_ERROR' },
      { status: 500 }
    );
  }
}
