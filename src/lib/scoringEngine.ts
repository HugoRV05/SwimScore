import type {
  Event,
  Result,
  ScoringConfig,
  ClubStanding,
  SwimmerStanding,
  ParsedEvent,
  Club,
  Swimmer,
  Meet,
} from '../types';
import { timeToSeconds } from './textParser';
import { getCategoryForSwimmer } from './scoringConfig';

// Main scoring function
export function calculateScores(
  meet: Meet,
  config: ScoringConfig,
  referenceYear: number = new Date().getFullYear()
): Meet {
  const scoredEvents = meet.events.map(event => 
    scoreEvent(event, config, referenceYear)
  );
  
  return {
    ...meet,
    events: scoredEvents,
  };
}

function scoreEvent(
  event: Event,
  config: ScoringConfig,
  referenceYear: number
): Event {
  // Sort results by time?
  // NO: Use PDF order which we've enforced with virtual times if needed.
  // The results array is already in PDF order.
  const sortedResults = [...event.results];
  
  // Determine point scale
  let pointScale: number[];
  if (event.isRelay) {
    const relayKey = `${event.relaySize || 4}x${event.distance / (event.relaySize || 4)}`;
    pointScale = config.specialRelayPoints?.[relayKey] || config.relayPoints;
  } else {
    pointScale = config.individualPoints;
  }
  
  // First pass: assign categories and Time-Based Positions
  let currentRank = 1;
  const resultsWithCategories = sortedResults.map((result, index) => {
    // Calculate rank based on time (handling ties)
    if (index > 0 && Math.abs(result.timeInSeconds - sortedResults[index - 1].timeInSeconds) > 0.005) {
      currentRank = index + 1;
    }
  
    let swimmerCategory: string | undefined;
    
    if (result.swimmer && !event.isRelay) {
      const category = getCategoryForSwimmer(
        result.swimmer.birthYear,
        referenceYear,
        config.categories
      );
      swimmerCategory = category?.id;
    }
    
    return {
      ...result,
      position: currentRank, // Override PDF position with calculated rank
      swimmerCategory,
    };
  });
  
  // Track club counts per category+gender (key: "clubId-category")
  // Club limit applies per CATEGORY, not globally
  const openClubCounts = new Map<string, number>();
  
  // Get distinct categories that can score separately
  const scoringCategories = new Set(config.categories.map(c => c.id));
  
  // Calculate Open ranking points first
  // Everyone can score in Open, with club limit per club in Open
  const scoredResults: Result[] = [];
  let openPointIndex = 0;
  
  for (const result of resultsWithCategories) {
    if (result.disqualified) {
      scoredResults.push({
        ...result,
        points: 0,
        openPoints: 0,
        categoryPoints: 0,
        bonusPoints: 0,
        scoringEligible: false,
        openEligible: false,
        categoryEligible: false,
      });
      continue;
    }
    
    // Check Open eligibility
    let openEligible = true;
    let openReason: 'ok' | 'time_limit' | 'club_limit' | 'dq' = 'ok';
    
    // 1. Check Qualifying Time (Minima)
    if (event.qualifyingTimes?.open) {
      if (result.timeInSeconds > event.qualifyingTimes.open) {
        
        // Exception: Sub20 (Age 19-20) can score in Open if they meet their Age QT
        let exceptionGranted = false;
        if (result.swimmer && result.swimmer.birthYear) {
          const age = referenceYear - result.swimmer.birthYear;
          if ((age === 19 || age === 20) && event.qualifyingTimes.byAge?.[age]) {
            if (result.timeInSeconds <= event.qualifyingTimes.byAge[age]) {
              exceptionGranted = true;
            }
          }
        }

        if (!exceptionGranted) {
           openEligible = false;
           openReason = 'time_limit';
        }
      }
    }

    // 2. Check Club Limit (applies per club in Open ranking)
    // Only check if still eligible
    if (openEligible) {
      const clubKey = `${result.club.id}-${event.gender}`;
      if (config.maxSwimmersPerClubPerEvent !== null) {
        const openCount = openClubCounts.get(clubKey) || 0;
        if (openCount >= config.maxSwimmersPerClubPerEvent) {
          openEligible = false;
          openReason = 'club_limit';
        } else {
          openClubCounts.set(clubKey, openCount + 1);
        }
      }
    }
    
    // Assign Open points
    let openPoints = 0;
    if (openEligible && openPointIndex < pointScale.length) {
      openPoints = pointScale[openPointIndex];
      openPointIndex++;
    }
    
    scoredResults.push({
      ...result,
      points: openPoints, // Legacy: total points = openPoints for now
      openPoints,
      categoryPoints: 0, // Will be calculated in second pass
      bonusPoints: 0,
      scoringEligible: openEligible,
      openEligible,
      openStatusReason: openReason,
      categoryEligible: false, // Will be set in second pass
    });
  }
  
  // Second pass: Calculate category-specific points
  // For each non-open category, calculate a separate ranking
  for (const categoryId of scoringCategories) {
    if (categoryId === 'open') continue; // Open already scored
    
    // Get all swimmers in this category
    const categoryResults = scoredResults.filter(r => r.swimmerCategory === categoryId);
    
    // Reset club counts for this category
    const catClubCounts = new Map<string, number>();
    let categoryPointIndex = 0;
    
    for (const result of categoryResults) {
      if (result.disqualified) continue;
      
      // Check category eligibility
      let categoryEligible = true;
      let categoryReason: 'ok' | 'time_limit' | 'club_limit' | 'dq' = 'ok';

      // 1. Check Qualifying Time (Minima) for Category
      if (result.swimmer && result.swimmer.birthYear && event.qualifyingTimes?.byAge) {
        const age = referenceYear - result.swimmer.birthYear;
        const ageQT = event.qualifyingTimes.byAge[age];
        if (ageQT && result.timeInSeconds > ageQT) {
          categoryEligible = false;
          categoryReason = 'time_limit';
        }
      }

      // 2. Check Club Limit (separate club limit per category)
      if (categoryEligible) {
        const clubKey = `${result.club.id}-${event.gender}`;
        // Re-construct key, was declared inside loop before?
        // Wait, clubKey is reusable?
        // Actually it's cleaner to re-declare or just use.
        
        if (config.maxSwimmersPerClubPerEvent !== null) {
          const catCount = catClubCounts.get(clubKey) || 0;
          if (catCount >= config.maxSwimmersPerClubPerEvent) {
            categoryEligible = false;
            categoryReason = 'club_limit';
          } else {
            catClubCounts.set(clubKey, catCount + 1);
          }
        }
      }
      
      // Update result with category status
      result.categoryStatusReason = categoryReason;
      
      // Assign category points
      
      // Assign category points
      if (categoryEligible && categoryPointIndex < pointScale.length) {
        result.categoryPoints = pointScale[categoryPointIndex];
        result.categoryEligible = true;
        categoryPointIndex++;
      }
    }
  }
  
  return {
    ...event,
    results: scoredResults,
  };
}

// Handle ties: when multiple results have the same time
export function handleTies(results: Result[], pointScale: number[]): Result[] {
  const processedResults: Result[] = [];
  let i = 0;
  
  while (i < results.length) {
    const tiedGroup: Result[] = [results[i]];
    let j = i + 1;
    
    while (j < results.length && results[j].timeInSeconds === results[i].timeInSeconds) {
      tiedGroup.push(results[j]);
      j++;
    }
    
    if (tiedGroup.length > 1) {
      const eligibleInTie = tiedGroup.filter(r => r.openEligible);
      
      if (eligibleInTie.length > 1) {
        const startPos = results[i].position - 1;
        let totalPoints = 0;
        for (let k = 0; k < eligibleInTie.length; k++) {
          if (startPos + k < pointScale.length) {
            totalPoints += pointScale[startPos + k];
          }
        }
        
        const splitPoints = totalPoints / eligibleInTie.length;
        
        for (const result of tiedGroup) {
          if (result.openEligible) {
            processedResults.push({
              ...result,
              openPoints: splitPoints,
              points: splitPoints,
            });
          } else {
            processedResults.push(result);
          }
        }
      } else {
        processedResults.push(...tiedGroup);
      }
    } else {
      processedResults.push(results[i]);
    }
    
    i = j;
  }
  
  return processedResults;
}

// Calculate club standings from scored meet
export function calculateClubStandings(meet: Meet): ClubStanding[] {
  const clubMap = new Map<string, ClubStanding>();
  
  for (const event of meet.events) {
    for (const result of event.results) {
      const clubId = result.club.id;
      
      if (!clubMap.has(clubId)) {
        clubMap.set(clubId, {
          club: result.club,
          totalPoints: 0,
          individualPoints: 0,
          relayPoints: 0,
          bonusPoints: 0,
          goldMedals: 0,
          silverMedals: 0,
          bronzeMedals: 0,
          swimmerCount: 0,
          eventCount: 0,
        });
      }
      
      const standing = clubMap.get(clubId)!;
      
      let pointsToAdd = 0;
      let hasScored = false;

      // Count Open points
      if (result.openEligible && result.openPoints > 0) {
        pointsToAdd += result.openPoints;
        hasScored = true;

        // Medals (based on Open scoring position)
        const openScoringPosition = event.results
          .filter(r => r.openEligible)
          .findIndex(r => r === result) + 1;
        
        if (openScoringPosition === 1) standing.goldMedals++;
        else if (openScoringPosition === 2) standing.silverMedals++;
        else if (openScoringPosition === 3) standing.bronzeMedals++;
      }

      // Count Category points
      if (result.categoryEligible && result.categoryPoints > 0) {
        pointsToAdd += result.categoryPoints;
        hasScored = true;
      }

      // Count Bonus points
      if ((result.openEligible || result.categoryEligible) && result.bonusPoints > 0) {
        pointsToAdd += result.bonusPoints;
        standing.bonusPoints += result.bonusPoints;
      }

      if (pointsToAdd > 0 || hasScored) {
        standing.totalPoints += pointsToAdd;
        if (event.isRelay) {
          standing.relayPoints += pointsToAdd;
        } else {
          standing.individualPoints += pointsToAdd;
        }
        standing.eventCount++;
      }
    }
  }
  
  // Count unique swimmers per club
  const swimmersByClub = new Map<string, Set<string>>();
  for (const event of meet.events) {
    if (!event.isRelay) {
      for (const result of event.results) {
        if (result.swimmer) {
          if (!swimmersByClub.has(result.club.id)) {
            swimmersByClub.set(result.club.id, new Set());
          }
          swimmersByClub.get(result.club.id)!.add(result.swimmer.id);
        }
      }
    }
  }
  
  for (const [clubId, swimmers] of swimmersByClub) {
    if (clubMap.has(clubId)) {
      clubMap.get(clubId)!.swimmerCount = swimmers.size;
    }
  }
  
  return Array.from(clubMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
}

// Calculate swimmer standings
export function calculateSwimmerStandings(meet: Meet): SwimmerStanding[] {
  const swimmerMap = new Map<string, SwimmerStanding>();
  
  for (const event of meet.events) {
    if (event.isRelay) continue;
    
    for (const result of event.results) {
      if (!result.swimmer) continue;
      
      const swimmerId = result.swimmer.id;
      
      if (!swimmerMap.has(swimmerId)) {
        swimmerMap.set(swimmerId, {
          swimmer: result.swimmer,
          club: result.club,
          category: result.swimmerCategory,
          totalPoints: 0,
          openPoints: 0,
          categoryPoints: 0,
          bonusPoints: 0,
          goldMedals: 0,
          silverMedals: 0,
          bronzeMedals: 0,
          eventCount: 0,
          averagePosition: 0,
          events: [],
        });
      }
      
      const standing = swimmerMap.get(swimmerId)!;
      
      // Update category if not set (e.g. from first event)
      if (!standing.category && result.swimmerCategory) {
        standing.category = result.swimmerCategory;
      }
      
      // Count total points (Open + Category)
      standing.totalPoints += result.openPoints + result.categoryPoints + result.bonusPoints;
      standing.openPoints += result.openPoints;
      standing.categoryPoints += result.categoryPoints;
      standing.bonusPoints += result.bonusPoints;
      standing.eventCount++;
      
      standing.events.push({
        eventId: event.id,
        eventName: `${event.distance}m ${event.stroke}`,
        position: result.position,
        points: result.openPoints + result.categoryPoints,
        time: result.time,
      });
      
      // Medals based on position
      if (result.openEligible || result.categoryEligible) {
        if (result.position === 1) standing.goldMedals++;
        else if (result.position === 2) standing.silverMedals++;
        else if (result.position === 3) standing.bronzeMedals++;
      }
    }
  }
  
  for (const standing of swimmerMap.values()) {
    if (standing.eventCount > 0) {
      const totalPosition = standing.events.reduce((sum: number, e: { position: number }) => sum + e.position, 0);
      standing.averagePosition = totalPosition / standing.eventCount;
    }
  }
  
  return Array.from(swimmerMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
}

// Convert parsed events to proper Event objects
export function convertParsedEvents(
  parsedEvents: ParsedEvent[],
  referenceYear: number
): { events: Event[]; clubs: Map<string, Club>; swimmers: Map<string, Swimmer> } {
  const clubs = new Map<string, Club>();
  const swimmers = new Map<string, Swimmer>();
  const events: Event[] = [];
  
  for (const parsed of parsedEvents) {
    const results: Result[] = [];
    
    for (const entry of parsed.entries) {
      // Get or create club
      const clubId = entry.clubName.toLowerCase().replace(/\s+/g, '-');
      if (!clubs.has(clubId)) {
        clubs.set(clubId, {
          id: clubId,
          name: entry.clubName,
          shortName: entry.clubName.split(' ').slice(0, 4).join(' '),
        });
      }
      
      // Get or create swimmer (for individual events)
      let swimmer: Swimmer | undefined;
      if (entry.name && !parsed.isRelay) {
        const swimmerId = `${entry.name.toLowerCase().replace(/\s+/g, '-')}-${entry.birthYear || 0}`;
        if (!swimmers.has(swimmerId)) {
          const nameParts = entry.name.split(',');
          swimmers.set(swimmerId, {
            id: swimmerId,
            name: entry.name,
            lastName: nameParts[0]?.trim() || '',
            firstName: nameParts[1]?.trim() || '',
            birthYear: entry.birthYear || referenceYear - 20,
            gender: parsed.gender === 'male' ? 'male' : 'female',
            clubId,
          });
        }
        swimmer = swimmers.get(swimmerId);
      }
      
      results.push({
        position: entry.position,
        originalPosition: entry.position,
        swimmer,
        relayTeamNumber: entry.teamNumber,
        club: clubs.get(clubId)!,
        time: entry.time,
        timeInSeconds: timeToSeconds(entry.time),
        points: 0,
        openPoints: 0,
        categoryPoints: 0,
        bonusPoints: 0,
        scoringEligible: true,
        openEligible: true,
        categoryEligible: true,
        disqualified: false,
        courseType: entry.courseType || 'S',
      });
    }

    // Virtual Time Adjustment (Bottom-Up)
    // Ensure numeric time order matches PDF order (handling Mixed Course sorting)
    // If a higher-ranked swimmer (lower index) has a slower time than the one below,
    // adjust their numeric time to be slightly faster than the one below.
    for (let i = results.length - 2; i >= 0; i--) {
      const current = results[i];
      const next = results[i + 1];
      
      // If current is slower than next (but ranked higher/same in PDF), adjust current
      if (current.timeInSeconds > next.timeInSeconds) {
        // console.log(`Adjusting time for ${current.swimmer?.name || 'Swimmer'} (${current.time}) to be faster than ${next.time}`);
        current.timeInSeconds = next.timeInSeconds - 0.01;
      }
    }
    
    events.push({
      id: `event-${parsed.eventNumber}`,
      number: parsed.eventNumber,
      distance: parsed.distance,
      stroke: parsed.stroke as Event['stroke'],
      gender: parsed.gender as Event['gender'],
      category: parsed.category,
      isRelay: parsed.isRelay,
      relaySize: parsed.isRelay ? 4 : undefined,
      qualifyingTimes: parsed.qualifyingTimes,
      results,
    });
  }
  
  return { events, clubs, swimmers };
}
