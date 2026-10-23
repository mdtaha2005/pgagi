import { ContentItem } from './content';

export interface FeedResponse {
  items: ContentItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  providers: {
    news: { live: boolean; count: number };
    recommendations: { live: boolean; count: number };
    social: { mock: boolean; count: number };
  };
}

export interface SearchResponse {
  items: ContentItem[];
  total: number;
  query: string;
}

export interface TrendingResponse {
  items: ContentItem[];
  total: number;
  category: string;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  details?: unknown;
}
