# PulseFeed - Personalized Content Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.13-purple?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.64-red?style=for-the-badge&logo=playwright)](https://playwright.dev/)

An enterprise-grade, accessible, and reactive **Personalized Content Dashboard** built for tracking and interacting with multi-source data (breaking news, cinema/media recommendations, and real-time social discussions) in a dynamic, user-centric interface.

Developed for the **Software Development Engineer (SDE) Intern - Frontend Development Assignment**.

---

## 🌟 Key Features

### 1. Personalized Content Feed
- **Dynamic Preference Engine**: Multi-select content categories (*Technology, Business, Entertainment, Sports, Science, Health*) with instant stream re-curation.
- **Dual-Mode Multi-Source Ingestion**:
  - **News**: Latest breaking headlines with publisher badges, estimated reading time, and direct source links.
  - **Recommendations**: Curated movies, series, and podcasts with IMDB-style ratings, release year, runtime, and trailer links.
  - **Social Media**: Real-time social threads with verified author badges, engagement metrics (likes, retweets, replies), and hashtag navigation.
  - *Dual-mode architecture*: Integrates with real external APIs (`NEWS_API_KEY`, `TMDB_API_KEY`) when provided in `.env.local`, while offering high-fidelity, deterministic curated data out-of-the-box for **zero-configuration instant review**.
- **Infinite Scrolling & Pagination**: High-performance `IntersectionObserver` sentinel loading with animated skeleton loaders.

### 2. Smooth Drag-and-Drop Reordering
- Powered by **Framer Motion** `Reorder.Group` and `Reorder.Item`.
- Grab handles on each content card allow users to dynamically reorganize their feed layout on both desktop and mobile touch screens.
- Custom card order is automatically saved and persisted in **Redux + LocalStorage**, with a one-click **"Reset Order"** button to revert to chronological sorting.

### 3. Dedicated Dashboard Sections
- 🧭 **My Feed**: The unified, personalized aggregator blending all preferred categories with quick filter pills (`All`, `News`, `Recommendations`, `Social`).
- 🔥 **Trending Leaderboard**: Real-time viral index highlighting top-ranked content across categories with Gold (#1), Silver (#2), and Bronze (#3) achievement badges.
- ⭐ **Favorites Section**: Dedicated bookmark manager with in-memory search, content type filtering, one-click removal, and **JSON export**.

### 4. Search with 300ms Performance Debounce
- Global search bar with 300ms debouncing to minimize redundant computations.
- Real-time dropdown preview displaying matching titles, types, categories, and direct-to-detail navigation.
- Multi-field search matching titles, descriptions, extended content, tags, authors, and source publishers.

### 5. Advanced UI/UX & Design System
- **Dark Mode / Light Mode**: Seamless theme toggle powered by Tailwind CSS and CSS custom properties, synchronized with system preferences and persisted in `localStorage`.
- **Display Density**: Switch between *Comfortable* (full imagery, tags, and metrics) and *Compact* (streamlined cards for power users).
- **Interactive Modals**:
  - **Content Detail Modal**: Full reading mode with high-resolution imagery, rich metadata, and direct social sharing.
  - **Preferences Drawer**: Real-time category selector, density picker, live update interval, and language options.
  - **User Profile Modal**: Editable profile (name, username, bio, custom avatar picker with curated presets).

### 6. Bonus Features Included
- ⚡ **Real-Time Live Feed Simulator**: Simulates WebSockets / Server-Sent Events (SSE). Incoming breaking news and viral tweets arrive dynamically with a pulsing green indicator and floating toast notifications.
- 🌐 **Multi-Language Support (i18n)**: Switch on the fly between English (`en`), Spanish (`es`), French (`fr`), and Hindi (`hi`).
- 🔔 **Toast Notification System**: Animated micro-interactions for favorite updates, link copies, preference saves, and live news flashes.

---

## 🏗️ Architecture & State Management

The application leverages **Redux Toolkit** with modular slice separation and custom `localStorage` hydration middleware designed to prevent Next.js SSR hydration mismatches:

```
src/
├── app/                        # Next.js App Router
│   ├── api/                    # Server-side API Route Handlers
│   │   ├── feed/route.ts       # Unified feed aggregator with pagination
│   │   ├── news/route.ts       # News endpoint (dual-mode: NewsAPI / curated)
│   │   ├── recommendations/    # Recommendations endpoint (TMDB / curated)
│   │   ├── social/route.ts     # Social media endpoint
│   │   ├── trending/route.ts   # Viral score leaderboard endpoint
│   │   ├── search/route.ts     # Multi-field full-text search endpoint
│   │   └── realtime/route.ts   # Live simulation updates generator
│   ├── layout.tsx              # Root layout with StoreProvider & Modals
│   ├── page.tsx                # Main Dashboard page
│   └── globals.css             # Tailwind CSS v4 & custom variables
├── components/
│   ├── layout/                 # Navbar, Sidebar
│   ├── feed/                   # ContentCard, FeedList (with Drag-and-Drop)
│   ├── trending/               # TrendingView
│   ├── favorites/              # FavoritesView
│   ├── modals/                 # PreferencesModal, ProfileModal, DetailModal
│   └── ui/                     # Toast
├── data/                       # Curated high-fidelity mock dataset
├── store/                      # Redux Toolkit Architecture
│   ├── index.ts                # Root store configuration
│   ├── hooks.ts                # Typed useAppDispatch & useAppSelector
│   ├── provider.tsx            # Client Provider & Live Sync Manager
│   ├── localStorage.ts         # Safe SSR-compliant browser storage
│   └── slices/
│       ├── preferencesSlice.ts # Categories, density, language, real-time toggle
│       ├── feedSlice.ts        # Feed items, drag-drop custom order, pagination
│       ├── favoritesSlice.ts   # Bookmarked items, filter, search
│       ├── trendingSlice.ts    # Trending items & category filter
│       ├── searchSlice.ts      # Debounced search query, results, history
│       ├── uiSlice.ts          # Theme (dark/light), modals, active section
│       └── authSlice.ts        # User profile & avatar customization
├── types/                      # TypeScript definitions (content, user)
├── utils/                      # Formatters, category styles, i18n dictionaries
└── test/                       # Vitest unit & integration test suite
```

---

## 🧪 Testing Suite

The repository features comprehensive automated testing across unit, integration, and End-to-End (E2E) layers:

### Test Summary
- **Unit Tests**:
  - `preferencesSlice.test.ts`: Verifies category toggling, category constraint enforcement (minimum 1), density changes, real-time toggling, and reset defaults.
  - `favoritesSlice.test.ts`: Verifies bookmark additions, removal, clearing, and search filtering.
  - `feedSlice.test.ts`: Verifies drag-and-drop reordering, custom order persistence, chronological reset, and optimistic likes.
  - `searchSlice.test.ts`: Verifies debouncing state and search history deduplication.
- **Integration Tests**:
  - `ContentCard.test.tsx`: Verifies polymorphic card rendering, bookmarking action dispatch, reaction increments, and detail modal triggers.
  - `FavoritesView.test.tsx`: Verifies empty state handling, saved card rendering, and in-memory search filtering.
- **E2E Tests (Playwright)**:
  - `e2e/dashboard.spec.ts`: End-to-end user journeys for Debounced Search, Drag-and-Drop Reordering, Favorites Bookmarking, Theme Switching, and Preferences Configuration.

### Running Tests

```bash
# Run all Vitest unit and integration tests
npm test

# Run tests in watch mode
npm run test:watch

# Run Playwright E2E tests
npm run test:e2e
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd pgagi
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **(Optional) Configure API Keys**:
   Copy `.env.example` to `.env.local` if you wish to use real external API keys:
   ```bash
   cp .env.example .env.local
   ```
   > *Note*: If left empty, the application runs seamlessly out-of-the-box using the built-in curated data layer.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

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
  - Next.js Turbopack compilation.
  - 300ms debouncing for all search inputs.
  - Client-side pagination with non-blocking `IntersectionObserver`.
  - Next.js Image component optimization for external CDNs.
  - Zero hydration mismatch guarantees.

---

## 📄 License
This project is developed as part of an engineering assessment and is licensed under the MIT License.
