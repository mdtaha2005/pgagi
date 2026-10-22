import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentItem } from '@/types/content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as ContentCategory | null;

  let newsItems = MOCK_CONTENT_ITEMS.filter((item) => item.type === 'news');

  if (category) {
    newsItems = newsItems.filter((item) => item.category === category);
  }

  // Check for external API Key if available
  const apiKey = process.env.NEWS_API_KEY;
  if (apiKey) {
    try {
      const q = category || 'technology';
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${q}&pageSize=10&apiKey=${apiKey}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.articles) {
          const live: ContentItem[] = data.articles.map((art: any, i: number) => ({
            id: `newsapi-${i}-${Date.now()}`,
            type: 'news',
            category: (category || 'technology') as ContentCategory,
            title: art.title || 'Breaking News',
            description: art.description || '',
            url: art.url || '',
            imageUrl: art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
            publishedAt: art.publishedAt || new Date().toISOString(),
            source: { name: art.source?.name || 'News Source' },
            author: { name: art.author || 'Staff' },
            metrics: { likes: 120, views: 2400 },
          }));
          return NextResponse.json({ items: live, source: 'live' });
        }
      }
    } catch {
      // Fallback to mock
    }
  }

  return NextResponse.json({ items: newsItems, source: 'curated' });
}
