import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentItem, ContentType } from '@/types/content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const rawCategories = searchParams.get('categories');
  const typeFilter = searchParams.get('type') as ContentType | null;
  const query = (searchParams.get('q') || '').toLowerCase().trim();

  const selectedCategories: ContentCategory[] = rawCategories
    ? (rawCategories.split(',').filter(Boolean) as ContentCategory[])
    : ['technology', 'business', 'entertainment', 'sports', 'science', 'health'];

  // Start with mock dataset
  let allItems: ContentItem[] = [...MOCK_CONTENT_ITEMS];

  // Optional: Attempt external NewsAPI integration if key is provided
  const newsApiKey = process.env.NEWS_API_KEY;
  if (newsApiKey && (!typeFilter || typeFilter === 'news')) {
    try {
      const topCategory = selectedCategories[0] || 'technology';
      const newsApiUrl = `https://newsapi.org/v2/top-headlines?category=${topCategory}&pageSize=5&apiKey=${newsApiKey}`;
      const res = await fetch(newsApiUrl, { next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        if (data.articles && Array.isArray(data.articles)) {
          const liveNews: ContentItem[] = data.articles.map((art: any, idx: number) => ({
            id: `live-news-${idx}-${art.publishedAt || Date.now()}`,
            type: 'news',
            category: topCategory,
            title: art.title || 'Breaking News',
            description: art.description || art.content || 'Latest development',
            content: art.content || art.description,
            url: art.url || 'https://news.google.com',
            imageUrl: art.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
            publishedAt: art.publishedAt || new Date().toISOString(),
            source: { name: art.source?.name || 'NewsAPI' },
            author: { name: art.author || art.source?.name || 'Staff' },
            metrics: { likes: Math.floor(Math.random() * 400) + 50, views: 5000 },
            tags: [topCategory, 'Breaking'],
          }));
          allItems = [...liveNews, ...allItems];
        }
      }
    } catch (e) {
      // Graceful fallback to rich mock data
    }
  }

  // Filter by category preferences
  let filtered = allItems.filter((item) =>
    selectedCategories.includes(item.category)
  );

  // Filter by content type if specified
  if (typeFilter && ['news', 'recommendation', 'social'].includes(typeFilter)) {
    filtered = filtered.filter((item) => item.type === typeFilter);
  }

  // Filter by search query if specified
  if (query) {
    filtered = filtered.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(query);
      const inDesc = item.description.toLowerCase().includes(query);
      const inTags = item.tags?.some((t) => t.toLowerCase().includes(query));
      const inAuthor = item.author?.name.toLowerCase().includes(query);
      return inTitle || inDesc || inTags || inAuthor;
    });
  }

  // Sort chronologically by publishedAt descending
  filtered.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < filtered.length;

  return NextResponse.json({
    items: paginatedItems,
    total: filtered.length,
    page,
    limit,
    hasMore,
  });
}
