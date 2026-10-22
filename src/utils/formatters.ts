import { ContentCategory, ContentType } from '@/types/content';

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function getCategoryBadgeStyle(category: ContentCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'technology':
      return {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-600 dark:text-indigo-400',
        border: 'border-indigo-500/30',
      };
    case 'business':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/30',
      };
    case 'entertainment':
      return {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-500/30',
      };
    case 'sports':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/30',
      };
    case 'science':
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/30',
      };
    case 'health':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/30',
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/30',
      };
  }
}

export function getTypeBadgeStyle(type: ContentType): {
  label: string;
  badge: string;
} {
  switch (type) {
    case 'news':
      return {
        label: 'News',
        badge: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      };
    case 'recommendation':
      return {
        label: 'Picks',
        badge: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
      };
    case 'social':
      return {
        label: 'Social',
        badge: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      };
  }
}

export const I18N_STRINGS = {
  en: {
    dashboardTitle: 'Personalized Content Dashboard',
    feed: 'My Feed',
    trending: 'Trending',
    favorites: 'Favorites',
    settings: 'Preferences',
    searchPlaceholder: 'Search news, movies, social posts...',
    categoriesTitle: 'Content Categories',
    all: 'All',
    news: 'News',
    recommendations: 'Recommendations',
    social: 'Social',
    readMore: 'Read Article',
    watchNow: 'View Media',
    viewPost: 'View Thread',
    realTimeActive: 'Live Feed Active',
    realTimePaused: 'Live Feed Paused',
    dragHint: 'Drag cards to customize order',
    resetOrder: 'Reset Order',
    emptyFavorites: 'No favorites saved yet. Click the bookmark icon on any card to save it here!',
    noResults: 'No content found matching your criteria.',
    savePreferences: 'Save Preferences',
    density: 'Display Density',
    comfortable: 'Comfortable',
    compact: 'Compact',
    language: 'Language',
  },
  es: {
    dashboardTitle: 'Panel de Contenido Personalizado',
    feed: 'Mi Feed',
    trending: 'Tendencias',
    favorites: 'Favoritos',
    settings: 'Preferencias',
    searchPlaceholder: 'Buscar noticias, películas, publicaciones...',
    categoriesTitle: 'Categorías de Contenido',
    all: 'Todo',
    news: 'Noticias',
    recommendations: 'Recomendaciones',
    social: 'Social',
    readMore: 'Leer Artículo',
    watchNow: 'Ver Contenido',
    viewPost: 'Ver Hilo',
    realTimeActive: 'En Vivo Activo',
    realTimePaused: 'En Vivo Pausado',
    dragHint: 'Arrastra tarjetas para personalizar el orden',
    resetOrder: 'Restablecer Orden',
    emptyFavorites: 'No hay favoritos guardados. ¡Haz clic en el marcador para guardar!',
    noResults: 'No se encontró contenido con esos criterios.',
    savePreferences: 'Guardar Preferencias',
    density: 'Densidad Visual',
    comfortable: 'Cómodo',
    compact: 'Compacto',
    language: 'Idioma',
  },
  fr: {
    dashboardTitle: 'Tableau de Bord Personnalisé',
    feed: 'Mon Flux',
    trending: 'Tendances',
    favorites: 'Favoris',
    settings: 'Préférences',
    searchPlaceholder: 'Rechercher actualités, films, publications...',
    categoriesTitle: 'Catégories de Contenu',
    all: 'Tout',
    news: 'Actualités',
    recommendations: 'Recommandations',
    social: 'Social',
    readMore: 'Lire l\'Article',
    watchNow: 'Voir le Média',
    viewPost: 'Voir la Publication',
    realTimeActive: 'Flux en Direct Actif',
    realTimePaused: 'Flux en Direct Suspendu',
    dragHint: 'Glissez les cartes pour réorganiser',
    resetOrder: 'Réinitialiser',
    emptyFavorites: 'Aucun favori enregistré pour le moment.',
    noResults: 'Aucun contenu trouvé.',
    savePreferences: 'Enregistrer les Préférences',
    density: 'Densité d\'Affichage',
    comfortable: 'Confortable',
    compact: 'Compact',
    language: 'Langue',
  },
  hi: {
    dashboardTitle: 'व्यक्तिगत सामग्री डैशबोर्ड',
    feed: 'मेरा फ़ीड',
    trending: 'ट्रेंडिंग',
    favorites: 'पसंदीदा',
    settings: 'प्राथमिकताएं',
    searchPlaceholder: 'समाचार, फिल्में, सोशल पोस्ट खोजें...',
    categoriesTitle: 'सामग्री श्रेणियां',
    all: 'सभी',
    news: 'समाचार',
    recommendations: 'सिफारिशें',
    social: 'सोशल',
    readMore: 'लेख पढ़ें',
    watchNow: 'मीडिया देखें',
    viewPost: 'पोस्ट देखें',
    realTimeActive: 'लाइव फ़ीड सक्रिय',
    realTimePaused: 'लाइव फ़ीड रुकी हुई',
    dragHint: 'क्रम बदलने के लिए कार्ड खींचें',
    resetOrder: 'क्रम रीसेट करें',
    emptyFavorites: 'अभी तक कोई पसंदीदा सहेजा नहीं गया है।',
    noResults: 'कोई सामग्री नहीं मिली।',
    savePreferences: 'प्राथमिकताएं सहेजें',
    density: 'प्रदर्शन घनत्व',
    comfortable: 'आरामदायक',
    compact: 'सघन',
    language: 'भाषा',
  },
} as const;
