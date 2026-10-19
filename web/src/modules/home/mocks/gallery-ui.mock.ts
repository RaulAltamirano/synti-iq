/**
 * Static gallery tiles for the /gallery UI (no network — design / UX preview only).
 */
export type GalleryUiCategory = 'Workspace' | 'Retail' | 'Team' | 'Brand';

export interface GalleryUiMockItem {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly category: GalleryUiCategory;
  /** Tailwind `bg-gradient-to-br` color stops */
  readonly gradientClass: string;
}

export const GALLERY_UI_CATEGORIES: readonly GalleryUiCategory[] = [
  'Workspace',
  'Retail',
  'Team',
  'Brand',
] as const;

export const GALLERY_UI_MOCK_ITEMS: readonly GalleryUiMockItem[] = [
  {
    id: 'g1',
    title: 'Open workspace',
    subtitle: 'Natural light & focus zones',
    category: 'Workspace',
    gradientClass: 'from-sky-400 via-blue-500 to-indigo-700',
  },
  {
    id: 'g2',
    title: 'Checkout flow',
    subtitle: 'Fast lane retail',
    category: 'Retail',
    gradientClass: 'from-amber-400 via-orange-500 to-rose-600',
  },
  {
    id: 'g3',
    title: 'Team huddle',
    subtitle: 'Daily alignment',
    category: 'Team',
    gradientClass: 'from-violet-400 via-purple-600 to-fuchsia-700',
  },
  {
    id: 'g4',
    title: 'Brand wall',
    subtitle: 'In-store storytelling',
    category: 'Brand',
    gradientClass: 'from-emerald-400 via-teal-500 to-cyan-700',
  },
  {
    id: 'g5',
    title: 'Stock room',
    subtitle: 'Organized back office',
    category: 'Retail',
    gradientClass: 'from-slate-500 via-gray-600 to-zinc-800',
  },
  {
    id: 'g6',
    title: 'Focus desk',
    subtitle: 'Deep work setup',
    category: 'Workspace',
    gradientClass: 'from-blue-300 via-primary-500 to-blue-900',
  },
  {
    id: 'g7',
    title: 'Training day',
    subtitle: 'Onboarding session',
    category: 'Team',
    gradientClass: 'from-pink-400 via-rose-500 to-red-700',
  },
  {
    id: 'g8',
    title: 'Window display',
    subtitle: 'Seasonal campaign',
    category: 'Brand',
    gradientClass: 'from-yellow-300 via-amber-500 to-orange-700',
  },
  {
    id: 'g9',
    title: 'Service counter',
    subtitle: 'Customer-first layout',
    category: 'Retail',
    gradientClass: 'from-cyan-400 via-blue-500 to-blue-800',
  },
  {
    id: 'g10',
    title: 'Quiet booth',
    subtitle: 'Calls & reviews',
    category: 'Workspace',
    gradientClass: 'from-indigo-400 via-violet-600 to-purple-900',
  },
  {
    id: 'g11',
    title: 'All-hands',
    subtitle: 'Company milestones',
    category: 'Team',
    gradientClass: 'from-green-400 via-emerald-600 to-green-900',
  },
  {
    id: 'g12',
    title: 'Packaging bar',
    subtitle: 'Premium unboxing',
    category: 'Brand',
    gradientClass: 'from-fuchsia-400 via-purple-600 to-indigo-800',
  },
];
