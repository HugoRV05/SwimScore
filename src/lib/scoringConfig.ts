import type { ScoringConfig, CategoryConfig, CategoryScoringRule } from '../types';

// CLM Regional 2026 Categories:
// - U14 (Infantil): Born 2012-2011 (ages 13-14 in 2025)
// - Junior: Born 2010-2008 (ages 15-17 in 2025)
// - Open: Everyone (no age limit)
const clm2026Categories: CategoryConfig[] = [
  { 
    id: 'u14', 
    name: 'u14', 
    displayName: 'U14 (Infantil)', 
    minAge: 13, 
    maxAge: 14, 
    birthYearStart: 2012, 
    birthYearEnd: 2011 
  },
  { 
    id: 'junior', 
    name: 'junior', 
    displayName: 'Junior (15-17)', 
    minAge: 15, 
    maxAge: 17, 
    birthYearStart: 2010, 
    birthYearEnd: 2008 
  },
  { 
    id: 'open', 
    name: 'open', 
    displayName: 'Open (Absoluto)', 
    minAge: null, 
    maxAge: null, 
    birthYearStart: null, 
    birthYearEnd: null 
  },
];

// CLM 2026 Scoring Rules:
// - Everyone scores in Open ranking
// - U14 swimmers also score in the U14 separate ranking
// - Junior swimmers also score in the Junior separate ranking
const clm2026ScoringRules: CategoryScoringRule[] = [
  { categoryId: 'u14', canScoreIn: ['u14', 'open'] },
  { categoryId: 'junior', canScoreIn: ['junior', 'open'] },
  { categoryId: 'open', canScoreIn: ['open'] },
];

// Point system for all categories: 19, 16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
const standardPoints = [19, 16, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
const standardRelayPoints = [38, 32, 28, 26, 24, 22, 20, 18, 16, 14, 12, 10, 8, 6, 4, 2];

// Preset scoring configurations
export const scoringPresets: Record<string, ScoringConfig> = {
  'clm-regional-2026': {
    id: 'clm-regional-2026',
    name: 'CLM Regional 2026',
    description: 'Castilla-La Mancha Regional Championship 2025/26 rules. Three categories (U14, Junior, Open) with 19,16,14... scoring.',
    individualPoints: standardPoints,
    relayPoints: standardRelayPoints,
    specialRelayPoints: {
      '4x200': [7, 6, 5, 4, 3, 2, 1],
    },
    maxSwimmersPerClubPerEvent: 2,
    redistributeExcessPoints: true,
    categories: clm2026Categories,
    categoryScoring: clm2026ScoringRules,
    bonusPoints: {
      enabled: true,
      regionalBest: 5,
      championshipRecord: 10,
      absoluteRegional: 15,
      nationalBest: 25,
    },
  },
  
  'open-scoring': {
    id: 'open-scoring',
    name: 'Open Scoring',
    description: 'No categories, no age restrictions, just positions',
    individualPoints: standardPoints,
    relayPoints: standardRelayPoints,
    maxSwimmersPerClubPerEvent: 2,
    redistributeExcessPoints: true,
    categories: [
      { id: 'open', name: 'open', displayName: 'Open', minAge: null, maxAge: null, birthYearStart: null, birthYearEnd: null },
    ],
    categoryScoring: [
      { categoryId: 'open', canScoreIn: ['open'] },
    ],
    bonusPoints: {
      enabled: false,
      regionalBest: 0,
      championshipRecord: 0,
      absoluteRegional: 0,
      nationalBest: 0,
    },
  },
  
  'no-club-limits': {
    id: 'no-club-limits',
    name: 'No Club Limits',
    description: 'All swimmers score regardless of club count',
    individualPoints: standardPoints,
    relayPoints: standardRelayPoints,
    maxSwimmersPerClubPerEvent: null, // No limit
    redistributeExcessPoints: false,
    categories: clm2026Categories,
    categoryScoring: clm2026ScoringRules,
    bonusPoints: {
      enabled: true,
      regionalBest: 5,
      championshipRecord: 10,
      absoluteRegional: 15,
      nationalBest: 25,
    },
  },
};

// Default config
export const defaultScoringConfig = scoringPresets['clm-regional-2026'];

// Get category for a swimmer based on birth year
export function getCategoryForSwimmer(
  birthYear: number,
  referenceYear: number,
  categories: CategoryConfig[]
): CategoryConfig | null {
  const age = referenceYear - birthYear;
  
  // First try by birth year range
  for (const category of categories) {
    if (category.birthYearStart !== null && category.birthYearEnd !== null) {
      // birthYearStart is the youngest year, birthYearEnd is the oldest year
      if (birthYear <= category.birthYearStart && birthYear >= category.birthYearEnd) {
        return category;
      }
    }
  }
  
  // Then try by age range
  for (const category of categories) {
    const minOk = category.minAge === null || age >= category.minAge;
    const maxOk = category.maxAge === null || age <= category.maxAge;
    if (minOk && maxOk) {
      return category;
    }
  }
  
  // Default to open if no specific category found
  const openCategory = categories.find(c => c.id === 'open');
  return openCategory || null;
}

// Check if a swimmer can score in a given event category
export function canSwimmerScoreInCategory(
  swimmerCategoryId: string,
  eventCategoryId: string,
  rules: CategoryScoringRule[]
): boolean {
  // Open events - everyone can score
  if (eventCategoryId === 'open' || eventCategoryId === 'absoluto') {
    return true;
  }
  
  const rule = rules.find(r => r.categoryId === swimmerCategoryId);
  if (!rule) return false;
  
  return rule.canScoreIn.includes(eventCategoryId);
}

// Create a custom scoring config
export function createCustomConfig(base: ScoringConfig, overrides: Partial<ScoringConfig>): ScoringConfig {
  return {
    ...base,
    ...overrides,
    id: 'custom',
    name: overrides.name || 'Custom Configuration',
  };
}

// Save/load config from localStorage
const STORAGE_KEY = 'swimming-scorer-config';

export function saveConfig(config: ScoringConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function loadConfig(): ScoringConfig {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultScoringConfig;
    }
  }
  return defaultScoringConfig;
}

export function resetConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}
