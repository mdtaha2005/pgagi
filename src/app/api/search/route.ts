import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentType } from '@/types/content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').toLowerCase().trim();
  const type = searchParams.get('type') as ContentType | 'all' | null;
  const category = searchParams.get('category') as ContentCategory | 'all' | null;

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  let items = [...MOCK_CONTENT_ITEMS];

  if (type && type !== 'all') {
    items = items.filter((i) => i.type === type);
  }

  if (category && category !== 'all') {
    items = items.filter((i) => i.category === category);
  }

  const queryTerms = q.split(/\s+/).filter(Boolean);

  const matched = items.filter((item) => {
    const haystack = [
      item.title,
      item.description,
      item.content || '',
      item.category,
      item.source.name,
      item.author?.name || '',
      item.author?.handle || '',
      ...(item.tags || []),
      ...(item.socialMeta?.hashtags || []),
    ]
      .join(' ')
      .toLowerCase();

    return queryTerms.every((term) => haystack.includes(term));
  });

  return NextResponse.json({
    items: matched,
    total: matched.length,
    query: q,
  });
}
