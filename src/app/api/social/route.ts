import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const hashtag = searchParams.get('hashtag')?.toLowerCase();
  const handle = searchParams.get('handle')?.toLowerCase();

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

  return NextResponse.json({ items: socialItems, source: 'social-mock' });
}
