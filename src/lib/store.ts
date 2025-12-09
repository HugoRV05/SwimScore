import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Meet, Event, ScoringConfig, ClubStanding, SwimmerStanding } from '../types';
import { loadConfig, saveConfig, scoringPresets } from './scoringConfig';
import { calculateScores, calculateClubStandings, calculateSwimmerStandings, convertParsedEvents } from './scoringEngine';
import { extractTextFromPDF } from './pdfParser';
import { parseSwimmingResults } from './textParser';

interface AppState {
  // Meet data
  meet: Meet | null;
  rawText: string;
  parseError: string | null;
  isLoading: boolean;
  
  // Scoring config
  scoringConfig: ScoringConfig;
  availablePresets: Record<string, ScoringConfig>;
  
  // Calculated standings
  clubStandings: ClubStanding[];
  swimmerStandings: SwimmerStanding[];
  
  // Actions
  loadPDF: (file: File) => Promise<void>;
  clearMeet: () => void;
  setScoringConfig: (config: ScoringConfig) => void;
  setPreset: (presetId: string) => void;
  recalculateScores: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      meet: null,
      rawText: '',
      parseError: null,
      isLoading: false,
      scoringConfig: loadConfig(),
      availablePresets: scoringPresets,
      clubStandings: [],
      swimmerStandings: [],
      
      // Load and parse PDF
      loadPDF: async (file: File) => {
        set({ isLoading: true, parseError: null });
        
        try {
          // Extract text from PDF
          const pdfResult = await extractTextFromPDF(file);
          set({ rawText: pdfResult.text });
          
          // Parse the text
          const parsedEvents = parseSwimmingResults(pdfResult.text);
          
          if (parsedEvents.length === 0) {
            throw new Error('No events found in the PDF. Please check the format.');
          }
          
          // Convert to proper model objects
          const referenceYear = new Date().getFullYear();
          const { events, clubs, swimmers } = convertParsedEvents(parsedEvents, referenceYear);
          
          // Create meet object
          const meet: Meet = {
            id: `meet-${Date.now()}`,
            name: file.name.replace('.pdf', ''),
            date: new Date().toISOString().split('T')[0],
            events,
            scoringConfigId: get().scoringConfig.id,
          };
          
          // Calculate scores
          const scoredMeet = calculateScores(meet, get().scoringConfig, referenceYear);
          
          // Calculate standings
          const clubStandings = calculateClubStandings(scoredMeet);
          const swimmerStandings = calculateSwimmerStandings(scoredMeet);
          
          set({
            meet: scoredMeet,
            clubStandings,
            swimmerStandings,
            isLoading: false,
          });
        } catch (error) {
          set({
            parseError: error instanceof Error ? error.message : 'Unknown error parsing PDF',
            isLoading: false,
          });
        }
      },
      
      // Clear current meet
      clearMeet: () => {
        set({
          meet: null,
          rawText: '',
          parseError: null,
          clubStandings: [],
          swimmerStandings: [],
        });
      },
      
      // Update scoring configuration
      setScoringConfig: (config: ScoringConfig) => {
        saveConfig(config);
        set({ scoringConfig: config });
        
        // Recalculate if meet is loaded
        const { meet } = get();
        if (meet) {
          get().recalculateScores();
        }
      },
      
      // Apply a preset
      setPreset: (presetId: string) => {
        const preset = get().availablePresets[presetId];
        if (preset) {
          get().setScoringConfig(preset);
        }
      },
      
      // Recalculate scores with current config
      recalculateScores: () => {
        const { meet, scoringConfig } = get();
        if (!meet) return;
        
        const referenceYear = new Date().getFullYear();
        const scoredMeet = calculateScores(meet, scoringConfig, referenceYear);
        const clubStandings = calculateClubStandings(scoredMeet);
        const swimmerStandings = calculateSwimmerStandings(scoredMeet);
        
        set({
          meet: scoredMeet,
          clubStandings,
          swimmerStandings,
        });
      },
    }),
    {
      name: 'swimming-scorer-storage',
      partialize: (state) => ({
        scoringConfig: state.scoringConfig,
      }),
    }
  )
);
