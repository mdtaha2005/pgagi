# PulseFeed — Personalized Content Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.13-purple?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.64-red?style=for-the-badge&logo=playwright)](https://playwright.dev/)

An enterprise-grade, accessible, and reactive **Personalized Content Dashboard** built for tracking and interacting with multi-source data (breaking news, cinema/media recommendations, and real-time social discussions) in a dynamic, user-centric interface.

Developed for the **Software Development Engineer (SDE) Intern - Frontend Development Assignment**.

Repository: [https://github.com/mdtaha2005/pgagi.git](https://github.com/mdtaha2005/pgagi.git)

---

## 🌟 Key Features & Assignment Compliance

### 1. Personalized Content Feed
- **User Preference Engine**: Users configure category preferences (*Technology, Business, Entertainment, Sports, Science, Health*) with instant stream re-curation. Enforces a minimum of 1 category selected to prevent empty feeds.
- **Dual-Mode API Ingestion Architecture**:
  - **Live News (NewsAPI)**: When `NEWS_API_KEY` is provided, fetches live headlines filtered by category. When absent or rate-limited, gracefully falls back to deterministic, curated articles.
  - **Live Recommendations (TMDB)**: When `TMDB_API_KEY` is provided, queries live trending movies and series with metadata (poster, ratings, release year). When absent, seamlessly falls back to curated media picks.
  - **Social Media Stream (Documented Mock)**: Explicitly supported mock social posts with verified authors, engagement counters (likes, retweets, replies), and hashtag navigation without requiring third-party OAuth.
- **Transparent Provenance Badges**: Every card clearly indicates whether it comes from a `● Live API`, `Curated`, or `Mock` source.
- **Deduplication & Normalization**: Deduplicates items across multiple providers by unique ID and normalized title.
- **Infinite Scrolling & Pagination**: Non-blocking `IntersectionObserver` sentinel loading with animated skeleton loaders.

### 2. Smooth Drag-and-Drop Reordering
- Powered by **Framer Motion** `Reorder.Group` and `Reorder.Item`.
- Dedicated grip handles (`dragListener={false}`) prevent accidental drags during button clicks or text selection.
- Custom card order is persisted via **Redux listener middleware** to `localStorage`.
- Includes a **"Reset Order"** control to return to chronological sort anytime.

### 3. Dedicated Dashboard Sections
- 🧭 **My Feed**: The unified aggregator blending all preferred categories with quick filter pills (`All`, `News`, `Recommendations`, `Social`).
- 🔥 **Trending Leaderboard**: Real-time viral index highlighting top-ranked content across categories with Gold (#1), Silver (#2), and Bronze (#3) achievement badges.
- ⭐ **Favorites Section**: Dedicated bookmark manager with in-memory search, category filtering, one-click removal, and JSON export.

### 4. Search with 300ms Performance Debounce
- Global search bar with 300ms debouncing and active request cancellation (`AbortController` / request ID tracking) to prevent race conditions.
- Real-time dropdown preview displaying matching titles, types, categories, and direct-to-detail navigation.
- Searches across news, recommendations, and social content.

### 5. Advanced UI/UX & Design System
- **Dark Mode / Light Mode**: Seamless theme toggle powered by Tailwind CSS and CSS custom properties, synchronized with client-side effect hooks and persisted in `localStorage`.
- **Display Density**: Switch between *Comfortable* (full imagery, tags, and metrics) and *Compact* (streamlined cards for power users).
- **Interactive Modals**:
  - **Content Detail Modal**: Full reading mode with high-resolution imagery, rich metadata, and direct social sharing.
  - **Preferences Modal**: Real-time category selector, density picker, live update interval, and language options.
  - **User Profile Modal**: Editable profile (name, username, bio, custom avatar picker with curated presets).

### 6. Bonus Features Included
- ⚡ **Real-Time Live Feed Simulator**: Simulates WebSockets / Server-Sent Events (SSE). Incoming breaking news and viral tweets arrive dynamically with a pulsing green indicator and floating toast notifications.
- 🌐 **Multi-Language Support (i18n)**: Switch on the fly between English (`en`), Spanish (`es`), French (`fr`), and Hindi (`hi`).
- 🔔 **Toast Notification System**: Animated micro-interactions for favorite updates, link copies, preference saves, and live news flashes.

---

## 🏗️ Architecture & State Management

The application adheres to clean architecture principles:

1. **Pure Redux Reducers**: Slices (`feedSlice`, `favoritesSlice`, `preferencesSlice`, `trendingSlice`, `searchSlice`, `uiSlice`, `authSlice`) contain 100% pure state transitions with zero `localStorage` calls or direct DOM mutations.
2. **Persistence Middleware**: Redux `createListenerMiddleware` captures state changes asynchronously and persists them to `localStorage` safely without side effects inside reducers.
3. **Cross-Slice State Synchronization**: Shared action `likeItem` synchronizes likes and reaction counts across Feed, Favorites, Trending, and Search simultaneously without contradictory copies.
4. **Resilient LocalStorage**: Custom schema validators (`validatePreferences`, `validateFavorites`, `validateTheme`, `validateFeedOrder`, `validateProfile`) safely handle corrupted JSON, missing properties, or invalid values and gracefully fall back to defaults.

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # Server-side API Route Handlers
│   │   ├── feed/route.ts       # Unified feed aggregator (NewsAPI + TMDB + Mock Social)
│   │   ├── news/route.ts       # News endpoint (dual-mode: NewsAPI / curated)
│   │   ├── recommendations/    # Recommendations endpoint (dual-mode: TMDB / curated)
│   │   ├── social/route.ts     # Mock social media endpoint
│   │   ├── trending/route.ts   # Viral score leaderboard endpoint
│   │   ├── search/route.ts     # Multi-field full-text search endpoint
│   │   └── realtime/route.ts   # Live simulation updates generator
│   ├── layout.tsx              # Root layout with StoreProvider & Modals
│   ├── page.tsx                # Main Dashboard page
│   └── globals.css             # Tailwind CSS & custom variables
├── components/
│   ├── layout/                 # Navbar, Sidebar
│   ├── feed/                   # ContentCard, FeedList (with Drag-and-Drop)
│   ├── trending/               # TrendingView
│   ├── favorites/              # FavoritesView
│   ├── modals/                 # PreferencesModal, ProfileModal, DetailModal
│   └── ui/                     # Toast
├── data/                       # Curated high-fidelity fallback dataset
├── lib/                        # Server API clients (fetchLiveNews, fetchLiveTMDB, deduplication)
├── store/                      # Redux Toolkit Architecture
│   ├── index.ts                # Root store configuration with persistence middleware
│   ├── hooks.ts                # Typed useAppDispatch & useAppSelector
│   ├── provider.tsx            # Client Provider, DOM theme synchronization, and Hydration
│   ├── localStorage.ts         # Schema validators and safe storage utilities
│   ├── sharedActions.ts        # Cross-slice synchronization actions (likeItem, toggleFavorite)
│   ├── middleware/             # RTK listener middleware for safe persistence
│   └── slices/                 # Modular Redux slices
├── types/                      # TypeScript definitions (content, api, user)
├── utils/                      # Formatters, category styles, i18n dictionaries
└── test/                       # Unit and integration test suite
```

---

## 🧪 Testing Suite

### 1. Unit & Integration Tests (Vitest)
69 comprehensive tests across 12 test suites:
- **Redux Pure Reducers**:
  - `preferencesSlice.test.ts`: Category toggle, minimum 1 category constraint, density change, language, real-time toggle, reset.
  - `favoritesSlice.test.ts`: Add, remove, clear, filter, search, like synchronization.
  - `feedSlice.test.ts`: Drag-and-drop reorder, chronological reset, optimistic likes, live item prepending.
  - `searchSlice.test.ts`: Query updates, debouncing, history deduplication, clear search.
  - `crossSliceSync.test.ts`: Synchronous cross-slice state propagation on `likeItem` and `toggleFavorite`.
- **Storage & Ingestion**:
  - `localStorage.test.ts`: Schema validation for corrupted data, invalid JSON, missing fields, category fallback, quota exception handling.
  - `apiClients.test.ts`: Content deduplication by ID and title, live NewsAPI transformation, live TMDB transformation, network timeout recovery.
- **Component Integration**:
  - `ContentCard.test.tsx`: Polymorphic card rendering, provenance badges, CTA buttons, like reactions, bookmark toggle, keyboard activation.
  - `FavoritesView.test.tsx`: Empty state handling, saved card rendering, search filtering.
  - `FeedStates.test.tsx`: Loading skeletons, empty state, error banner with retry button, type filter tabs.
  - `NavbarSearch.test.tsx`: Debounced input handling, results dropdown, zero-result message, clear button.

### 2. End-to-End Tests (Playwright)
10 critical user journeys verified in `e2e/dashboard.spec.ts`:
1. Open dashboard, verify layout and initial cards.
2. Global debounced search and detail modal inspection.
3. Bookmark card to Favorites and verify navigation.
4. Remove favorite and verify empty state.
5. Update category preferences and verify persistence across reload.
6. Toggle dark mode and verify theme persistence across reload.
7. Reorder drag controls and banner verification.
8. Infinite scroll sentinel and load more trigger.
9. Search empty state and clear button.
10. Responsive layout on mobile viewport and navigation drawer.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mdtaha2005/pgagi.git
   cd pgagi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Configure API Keys**:
   Copy `.env.example` to `.env.local` to enable live external data:
   ```bash
   cp .env.example .env.local
   ```
   Configure your keys:
   ```env
   NEWS_API_KEY=your_newsapi_key_here
   TMDB_API_KEY=your_tmdb_api_key_here
   ```
   > **Note**: If left blank, PulseFeed operates seamlessly out-of-the-box using the built-in curated data layer.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
# Run all Vitest unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run Playwright E2E tests
npm run test:e2e
```

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

---

## ♿ Accessibility & Performance

- **WCAG 2.1 AA Compliant**: Semantic HTML landmarks (`<header>`, `<aside>`, `<main>`, `<article>`), explicit ARIA attributes, keyboard-navigable dialogs, and high-contrast color ratios.
- **Performance Optimized**:
  - Next.js compilation with PostCSS and Tailwind CSS.
  - 300ms debouncing for all search inputs with cancellation.
  - Client-side pagination with non-blocking `IntersectionObserver`.
  - Next.js Image component optimization for external CDNs.
  - Zero hydration mismatch guarantees.

---

## 📄 License
This project is developed as part of an engineering assessment and is licensed under the MIT License.
