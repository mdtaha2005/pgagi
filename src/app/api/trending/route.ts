import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory } from '@/types/content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as ContentCategory | 'all' | null;

  let items = [...MOCK_CONTENT_ITEMS];

  if (category && category !== 'all') {
    items = items.filter((item) => item.category === category);
  }

  // Rank by combined engagement metrics (likes + views / 10 + rating * 100)
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

  return NextResponse.json({ items: rankedItems });
}
