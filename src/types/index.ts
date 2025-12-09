// Core type definitions for Swimming Point Scorer

export interface Meet {
  id: string;
  name: string;
  date: string;
  location?: string;
  events: Event[];
  scoringConfigId: string;
}

export interface Event {
  id: string;
  number: number;
  distance: number;
  stroke: Stroke;
  gender: Gender;
  category: string; // Category name from config
  isRelay: boolean;
  relaySize?: number; // 4 for 4x50, 4x100, etc.
  results: Result[];
  records?: EventRecords;
  qualifyingTimes?: {
    open?: number; // Time in seconds
    byAge?: Record<number, number>; // Age -> Time in seconds
  };
}

export interface EventRecords {
  regional?: string;
  championship?: string;
  national?: string;
  bestTimes?: Record<string, string>; // by age group
}

export interface Result {
  position: number;
  originalPosition: number; // Position before club rule applied
  swimmer?: Swimmer; // For individual events
  relayTeamNumber?: number; // For relay events (team 1, 2, etc.)
  club: Club;
  time: string; // "1:43.19" format
  timeInSeconds: number;
  points: number; // Total points (legacy, can be removed later)
  openPoints: number; // Points in Open ranking
  categoryPoints: number; // Points in swimmer's own category ranking
  swimmerCategory?: string; // Swimmer's category ID (u14, junior, etc.)
  bonusPoints: number;
  scoringEligible: boolean; // Whether this result counts for scoring
  openEligible: boolean; // Eligible for open scoring
  categoryEligible: boolean; // Eligible for category scoring

  disqualified: boolean;
  openStatusReason?: 'ok' | 'time_limit' | 'club_limit' | 'dq';
  categoryStatusReason?: 'ok' | 'time_limit' | 'club_limit' | 'dq';
  courseType: 'S' | 'L'; // Short (25m) or Long (50m) course
}

export interface Swimmer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  birthYear: number;
  gender: Gender;
  clubId: string;
}

export interface Club {
  id: string;
  name: string;
  shortName?: string;
}

export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley';
export type Gender = 'male' | 'female' | 'mixed';

// Scoring Configuration - Fully Customizable

export interface ScoringConfig {
  id: string;
  name: string;
  description?: string;
  
  // Point scales
  individualPoints: number[];
  relayPoints: number[];
  specialRelayPoints?: Record<string, number[]>; // e.g., "4x200": [7,6,5,4,3,2,1]
  
  // Club limits
  maxSwimmersPerClubPerEvent: number | null; // null = no limit
  redistributeExcessPoints: boolean; // If true, points go to next eligible
  
  // Category settings
  categories: CategoryConfig[];
  categoryScoring: CategoryScoringRule[];
  
  // Bonus points
  bonusPoints: BonusPointConfig;
}

export interface CategoryConfig {
  id: string;
  name: string;
  displayName: string;
  minAge: number | null; // null = no minimum
  maxAge: number | null; // null = no maximum
  birthYearStart: number | null; // Alternative: by birth year
  birthYearEnd: number | null;
}

export interface CategoryScoringRule {
  categoryId: string; // Category this rule applies to
  canScoreIn: string[]; // List of category IDs this category can score in
  // e.g., Junior can score in ['junior', 'senior'], but 14u only in ['14u']
}

export interface BonusPointConfig {
  enabled: boolean;
  regionalBest: number;
  championshipRecord: number;
  absoluteRegional: number;
  nationalBest: number;
}

// Statistics Types

export interface ClubStanding {
  club: Club;
  totalPoints: number;
  individualPoints: number;
  relayPoints: number;
  bonusPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  swimmerCount: number;
  eventCount: number;
}
export interface SwimmerStanding {
  swimmer: Swimmer;
  club: Club;
  category?: string;
  totalPoints: number;
  openPoints: number;
  categoryPoints: number;
  bonusPoints: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  eventCount: number;
  averagePosition: number;
  events: {
    eventId: string;
    eventName: string;
    position: number;
    points: number;
    time: string;
  }[];
}

export interface CategoryStanding {
  category: CategoryConfig;
  clubs: ClubStanding[];
  swimmers: SwimmerStanding[];
}

// Parsed PDF Data (intermediate format)

export interface ParsedEvent {
  eventNumber: number;
  eventName: string;
  distance: number;
  stroke: string;
  gender: string;
  category: string;
  isRelay: boolean;
  qualifyingTimes?: {
    open?: number; // Time in seconds
    byAge?: Record<number, number>;
  };
  entries: ParsedEntry[];
}

export interface ParsedEntry {
  position: number;
  name?: string;
  birthYear?: number;
  clubName: string;
  time: string;
  courseType?: 'S' | 'L';
  date?: string;
  location?: string;
  teamNumber?: number; // For relays
}
