import { NextRequest, NextResponse } from 'next/server';
import { ContentCategory, ContentItem } from '@/types/content';

const LIVE_TEMPLATES: Record<ContentCategory, Array<{ title: string; desc: string; source: string; author: string; handle: string; tag: string }>> = {
  technology: [
    {
      title: 'Open-weights Reasoning Model Breaks Symbolic Math Benchmark Record',
      desc: 'Independent benchmarks confirm 94.2% accuracy on Olympiad-level mathematical reasoning using test-time compute scaling.',
      source: 'AI Research Wire',
      author: 'Kai Chen',
      handle: '@kaichen_ai',
      tag: 'Reasoning',
    },
    {
      title: 'Browser Standard Group Approves Native Local LLM Execution Spec',
      desc: 'WebGPU 2.0 introduces direct tensor core bindings for instant, zero-latency in-browser client inference.',
      source: 'Web Standards Direct',
      author: 'Liam O\'Connor',
      handle: '@liam_web',
      tag: 'WebGPU',
    },
  ],
  business: [
    {
      title: 'Central Banks Pilot Multi-Currency Distributed Settlement Ledger',
      desc: 'Cross-border transaction fees drop by 80% as real-time liquidity pools replace correspondent banking delays.',
      source: 'Financial Times Live',
      author: 'Claire Dufresne',
      handle: '@claire_fx',
      tag: 'Fintech',
    },
  ],
  entertainment: [
    {
      title: 'Cannes Film Festival Announces Surprise Screening of Mystery Sci-Fi Odyssey',
      desc: 'Critics praise the unannounced midnight screening as the most audacious visual experience since 2001: A Space Odyssey.',
      source: 'Screen Daily',
      author: 'Mateo Rossi',
      handle: '@mateorossi_film',
      tag: 'Cannes2026',
    },
  ],
  sports: [
    {
      title: 'Breakthrough Hydration Sensors Adopted Across Olympic Decathlon Teams',
      desc: 'Continuous interstitial sweat biomarkers provide coaches with sub-minute cramping warnings during world championships.',
      source: 'SportsTech Journal',
      author: 'Marcus Vance',
      handle: '@vance_sports',
      tag: 'Olympics',
    },
  ],
  science: [
    {
      title: 'Laser Fusion Reactor Achieves Sustained Net Positive Q-Factor for 180 Seconds',
      desc: 'High-repetition magnetic confinement facility reports unprecedented plasma stability and continuous deuterium tritium burn.',
      source: 'Nuclear Physics Weekly',
      author: 'Dr. Sarah Al-Sayed',
      handle: '@sarah_fusion',
      tag: 'FusionEnergy',
    },
  ],
  health: [
    {
      title: 'Targeted Microbiome Transplant Reverses Severe Autoimmune Biomarkers in Phase 2b',
      desc: 'Synthetic bacterial consortia deliver durable remission in clinical gut-barrier trials across 450 patients.',
      source: 'Nature Medicine Bulletin',
      author: 'Dr. Emily Vance',
      handle: '@emily_microbiome',
      tag: 'Microbiome',
    },
  ],
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = (searchParams.get('category') || 'technology') as ContentCategory;

  const templates = LIVE_TEMPLATES[category] || LIVE_TEMPLATES.technology;
  const selected = templates[Math.floor(Math.random() * templates.length)];
  const isSocial = Math.random() > 0.4;

  const now = new Date();
  const id = `live-${category}-${Date.now()}`;

  const liveItem: ContentItem = {
    id,
    type: isSocial ? 'social' : 'news',
    category,
    title: selected.title,
    description: selected.desc,
    content: `${selected.desc} Full analysis and breaking commentary are actively developing. Updates are arriving in real-time.`,
    url: 'https://news.ycombinator.com',
    imageUrl: isSocial
      ? 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'
      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    publishedAt: now.toISOString(),
    source: { name: selected.source },
    author: {
      name: selected.author,
      handle: selected.handle,
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
    metrics: {
      likes: Math.floor(Math.random() * 200) + 15,
      views: Math.floor(Math.random() * 1200) + 200,
      comments: Math.floor(Math.random() * 40) + 5,
    },
    tags: [category, selected.tag, 'Breaking'],
    socialMeta: isSocial
      ? {
          handle: selected.handle,
          hashtags: [category, selected.tag, 'BreakingNews'],
          repliesCount: Math.floor(Math.random() * 30) + 4,
          retweetsCount: Math.floor(Math.random() * 70) + 12,
          likesCount: Math.floor(Math.random() * 200) + 25,
          isLiked: false,
        }
      : undefined,
  };

  return NextResponse.json(liveItem);
}
