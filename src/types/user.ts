import { ContentCategory } from './content';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  bio: string;
  joinedDate: string;
}

export interface UserPreferences {
  selectedCategories: ContentCategory[];
  realTimeEnabled: boolean;
  realTimeIntervalSeconds: number;
  density: 'comfortable' | 'compact';
  language: 'en' | 'es' | 'fr' | 'hi';
}
