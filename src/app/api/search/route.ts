import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentType, ContentItem } from '@/types/content';
import { SearchResponse } from '@/types/api';
import { deduplicateContent } from '@/lib/apiClients';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawQ = searchParams.get('q');
    const q = (rawQ || '').toLowerCase().trim();
    const type = searchParams.get('type') as ContentType | 'all' | null;
    const category = searchParams.get('category') as ContentCategory | 'all' | null;

    if (!q) {
      const emptyResponse: SearchResponse = { items: [], total: 0, query: '' };
      return NextResponse.json(emptyResponse);
    }

    let items: ContentItem[] = deduplicateContent([...MOCK_CONTENT_ITEMS]);

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

    const response: SearchResponse = {
      items: matched,
      total: matched.length,
      query: q,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error('[API /search] Error:', err);
    return NextResponse.json(
      { error: 'Search failed', code: 'SEARCH_ERROR' },
      { status: 500 }
    );
  }
}
