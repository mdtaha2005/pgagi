export type ContentCategory =
  | 'technology'
  | 'business'
  | 'entertainment'
  | 'sports'
  | 'science'
  | 'health';

export type ContentType = 'news' | 'recommendation' | 'social';

export type ContentSourceType = 'live' | 'curated' | 'mock';

export interface Author {
  name: string;
  handle?: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface RecommendationMeta {
  mediaType: 'movie' | 'music' | 'podcast' | 'series';
  rating: number;
  year: number;
  duration?: string;
  directorOrArtist?: string;
  trailerUrl?: string;
}

export interface SocialMeta {
  handle: string;
  hashtags?: string[];
  repliesCount: number;
  retweetsCount: number;
  likesCount: number;
  isLiked?: boolean;
}

export interface ContentSource {
  id?: string;
  name: string;
  avatarUrl?: string;
  isMock?: boolean;
  sourceType?: ContentSourceType;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  category: ContentCategory;
  title: string;
  description: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  source: ContentSource;
  metrics?: {
    likes?: number;
    views?: number;
    shares?: number;
    comments?: number;
    rating?: number;
  };
  tags?: string[];
  author?: Author;
  recommendationMeta?: RecommendationMeta;
  socialMeta?: SocialMeta;
  isTrending?: boolean;
  trendingRank?: number;
  isLiked?: boolean;
}
