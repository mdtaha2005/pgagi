import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hashtag = searchParams.get('hashtag')?.toLowerCase().trim();
    const handle = searchParams.get('handle')?.toLowerCase().trim();

    let socialItems = MOCK_CONTENT_ITEMS.filter((item) => item.type === 'social');

    if (hashtag) {
      socialItems = socialItems.filter((item) =>
        item.socialMeta?.hashtags?.some((h) => h.toLowerCase().includes(hashtag))
      );
    }

    if (handle) {
      socialItems = socialItems.filter((item) =>
        item.author?.handle?.toLowerCase().includes(handle)
      );
    }

    return NextResponse.json({
      items: socialItems,
      total: socialItems.length,
      source: 'social-mock',
    });
  } catch (err: unknown) {
    console.error('[API /social] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch social posts', code: 'SOCIAL_ERROR' },
      { status: 500 }
    );
  }
}
