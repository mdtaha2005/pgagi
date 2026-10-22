import { NextRequest, NextResponse } from 'next/server';
import { MOCK_CONTENT_ITEMS } from '@/data/mockData';
import { ContentCategory, ContentItem } from '@/types/content';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category') as ContentCategory | null;

  let recs = MOCK_CONTENT_ITEMS.filter((item) => item.type === 'recommendation');

  if (category) {
    recs = recs.filter((item) => item.category === category);
  }

  // Support TMDB API key if present
  const tmdbKey = process.env.TMDB_API_KEY;
  if (tmdbKey) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/trending/all/week?api_key=${tmdbKey}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          const liveRecs: ContentItem[] = data.results.slice(0, 8).map((media: any) => ({
            id: `tmdb-${media.id}`,
            type: 'recommendation',
            category: 'entertainment',
            title: media.title || media.name || 'Featured Title',
            description: media.overview || 'Must-watch recommendation.',
            url: `https://www.themoviedb.org/${media.media_type || 'movie'}/${media.id}`,
            imageUrl: media.poster_path
              ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
              : 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
            publishedAt: new Date().toISOString(),
            source: { name: 'TMDB Trending' },
            metrics: {
              likes: Math.round((media.vote_count || 100) / 2),
              rating: Math.round((media.vote_average || 8) * 10) / 10,
            },
            recommendationMeta: {
              mediaType: media.media_type === 'tv' ? 'series' : 'movie',
              rating: Math.round((media.vote_average || 8) * 10) / 10,
              year: parseInt(
                (media.release_date || media.first_air_date || '2024').slice(0, 4),
                10
              ),
            },
          }));
          return NextResponse.json({ items: liveRecs, source: 'live' });
        }
      }
    } catch {
      // Fallback to mock
    }
  }

  return NextResponse.json({ items: recs, source: 'curated' });
}
