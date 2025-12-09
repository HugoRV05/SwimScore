import type { ParsedEvent, ParsedEntry, Stroke, Gender } from '../types';

// Time pattern that matches both mm:ss.cc and ss.cc formats
const TIME_PATTERN = /(\d{1,2}:\d{2}\.\d{2}|\d{2}\.\d{2})/;
const TIME_PATTERN_GLOBAL = /(\d{1,2}:\d{2}\.\d{2}|\d{2}\.\d{2})/g;

// Parse the full text from a Splash Meet Manager PDF
export function parseSwimmingResults(text: string): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  
  // Normalize whitespace but preserve structure markers
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split by "Prueba" to get each event section
  const eventSections = normalizedText.split(/(?=Prueba\s+\d+)/i);
  
  for (const section of eventSections) {
    if (!section.trim()) continue;
    
    // Parse event header
    const eventMatch = section.match(/^Prueba\s+(\d+)\s+(Masc\.|Fem\.|Mixto)?,?\s*(.+?)(?=Listado|Clasificación|$)/i);
    if (!eventMatch) continue;
    
    const eventNumber = parseInt(eventMatch[1]);
    const genderPart = eventMatch[2] || '';
    const eventDescription = eventMatch[3].trim();
    
    // Parse event details
    const eventInfo = parseEventDetails(eventDescription, genderPart);
    
    // Find classification section
    const classificationMatch = section.match(/Clasificación\s*(AN)?\s*([\s\S]+?)(?=Prueba\s+\d+|$)/i);
    if (!classificationMatch) continue;
    
    const classificationText = classificationMatch[2];
    
    // Parse entries based on event type
    const entries = eventInfo.isRelay 
      ? parseRelayEntries(classificationText)
      : parseIndividualEntries(classificationText);
    
    if (entries.length > 0) {
      events.push({
        eventNumber,
        eventName: `Prueba ${eventNumber} - ${eventInfo.distance}m ${eventInfo.stroke}`,
        ...eventInfo,
        entries,
      });
    }
  }
  
  return events;
}

function parseEventDetails(text: string, genderPart: string): {
  distance: number;
  stroke: string;
  gender: string;
  category: string;
  isRelay: boolean;
} {
  let distance = 0;
  let stroke = 'freestyle';
  let gender: Gender = 'mixed';
  let category = 'open';
  let isRelay = false;
  
  // Determine gender
  if (genderPart.toLowerCase().includes('masc')) {
    gender = 'male';
  } else if (genderPart.toLowerCase().includes('fem')) {
    gender = 'female';
  }
  
  // Check for relay: "4 x 50m" or "4x50"
  const relayMatch = text.match(/(\d+)\s*x\s*(\d+)\s*m?/i);
  if (relayMatch) {
    isRelay = true;
    distance = parseInt(relayMatch[1]) * parseInt(relayMatch[2]);
  } else {
    // Individual event: "800m" or "1500m" or "50m"
    const distanceMatch = text.match(/(\d+)\s*m/i);
    if (distanceMatch) {
      distance = parseInt(distanceMatch[1]);
    }
  }
  
  // Determine stroke
  const textLower = text.toLowerCase();
  if (textLower.includes('estilos') || textLower.includes('medley')) {
    stroke = 'medley';
  } else if (textLower.includes('espalda') || textLower.includes('backstroke')) {
    stroke = 'backstroke';
  } else if (textLower.includes('braza') || textLower.includes('breaststroke')) {
    stroke = 'breaststroke';
  } else if (textLower.includes('mariposa') || textLower.includes('butterfly')) {
    stroke = 'butterfly';
  } else if (textLower.includes('libre') || textLower.includes('freestyle')) {
    stroke = 'freestyle';
  }
  
  // Determine category
  if (textLower.includes('absoluto') || textLower.includes('senior')) {
    category = 'senior';
  } else if (textLower.includes('junior')) {
    category = 'junior';
  } else if (textLower.includes('infantil') || textLower.includes('14')) {
    category = 'infantil';
  }
  
  // Also check for gender in text if not found
  if (gender === 'mixed') {
    if (textLower.includes('masculino') || textLower.includes('male')) {
      gender = 'male';
    } else if (textLower.includes('femenino') || textLower.includes('female')) {
      gender = 'female';
    }
  }
  
  return { distance, stroke, gender, category, isRelay };
}

function parseRelayEntries(text: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  
  // Clean up the text - remove non-result content
  let cleanText = text
    .replace(/Introducir conversión[^0-9]*/gi, '')
    .replace(/ESP:Conversion Spanish Rules/gi, '')
    .replace(/Comprometidos con la natación[^0-9]*/gi, '')
    .replace(/Splash Meet Manager[^0-9]*/gi, '')
    .replace(/Registered to[^0-9]*/gi, '')
    .replace(/\d{2}\/\d{2}\/\d{4}\s*-\s*\d{2}:\d{2}/g, '')
    .replace(/Página\s*\d+/gi, '')
    .trim();
  
  // For relays, match pattern:
  // Position ClubName TeamNum ClubName Time
  // Example: "1 C.P.N. La Roda 1 C.P.N. La Roda 1:43.19"
  // Time can be mm:ss.cc OR ss.cc for shorter relays
  const relayPattern = /(\d{1,3})\s+(.+?)\s+(\d)\s+(.+?)\s+(\d{1,2}:\d{2}\.\d{2}|\d{2}\.\d{2})/g;
  
  let match;
  while ((match = relayPattern.exec(cleanText)) !== null) {
    const position = parseInt(match[1]);
    const clubName = match[4].trim();
    const teamNumber = parseInt(match[3]);
    const time = match[5];
    
    // Validate: club name shouldn't contain another result or be too long
    if (clubName.match(TIME_PATTERN) || clubName.length > 50) {
      continue;
    }
    
    entries.push({
      position,
      clubName,
      teamNumber,
      time,
    });
  }
  
  return entries.sort((a, b) => a.position - b.position);
}

function parseIndividualEntries(text: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];
  
  // Clean up the text - remove headers and non-result content
  let cleanText = text
    .replace(/Introducir conversión[^0-9]*/gi, '')
    .replace(/ESP:Conversion Spanish Rules/gi, '')
    .replace(/Comprometidos con la natación[^0-9]*/gi, '')
    .replace(/Splash Meet Manager[^0-9]*/gi, '')
    .replace(/Registered to[^0-9]*/gi, '')
    .replace(/Página\s*\d+/gi, '')
    .replace(/\d+\s+AÑOS\s+\d+:\s*[\d:\.]+\s*\/?\s*/g, '')
    .replace(/Absoluto Open:\s*[\d:\.]+/gi, '')
    .trim();
  
  // Also clean record lines that start with "r ", "rcto ", "mmi ", "mmj "
  cleanText = cleanText.replace(/\b(r|rcto|mmi\s*\d*|mmj\s*\d*)\s+[\d:\.]+\s+[A-ZÁÉÍÓÚÜÑ\s]+,\s*[A-Za-záéíóúüñ]+[^0-9]+\d{2}\/\d{2}\/\d{4}/gi, '');
  
  // Club name prefixes
  const clubPrefixes = 'C\\.N\\.|C\\.D\\.|C\\.P\\.N\\.|E\\.C\\.|Club|C\\.N\\.S\\.';
  
  // Pattern to match individual entries
  // Position + NAME, Name + 2-digit year + ClubName + Time (with or without minutes)
  const entryPattern = new RegExp(
    `(\\d{1,3})\\s+` +                           // Position
    `([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\\s\\-\\.]+,\\s*[A-Za-záéíóúüñ\\s\\-\\.]+)\\s+` +  // Name (LASTNAME, Firstname)
    `(\\d{2})\\s+` +                              // Birth year
    `((?:${clubPrefixes})[^0-9]+?)\\s+` +        // Club name
    `(\\d{1,2}:\\d{2}\\.\\d{2}|\\d{2}\\.\\d{2})\\s*` +  // Time (mm:ss.cc OR ss.cc)
    `([SL])?\\s*` +                               // Course type (optional)
    `(\\d{2}\\/\\d{2}\\/\\d{4})?`,                // Date (optional)
    'gi'
  );
  
  let match;
  while ((match = entryPattern.exec(cleanText)) !== null) {
    const position = parseInt(match[1]);
    const name = match[2].trim();
    let birthYear = parseInt(match[3]);
    birthYear = birthYear > 50 ? 1900 + birthYear : 2000 + birthYear;
    let clubName = match[4].trim();
    const time = match[5];
    const courseType = (match[6] as 'S' | 'L') || 'S';
    
    // Clean up club name
    clubName = clubName.replace(/\s+$/, '').trim();
    
    // Validate: club name shouldn't be too long or contain time
    if (clubName.length > 40 || clubName.match(TIME_PATTERN)) {
      continue;
    }
    
    entries.push({
      position,
      name,
      birthYear,
      clubName,
      time,
      courseType,
    });
  }
  
  // If main regex didn't find entries, try fallback
  if (entries.length === 0) {
    const times = [...cleanText.matchAll(TIME_PATTERN_GLOBAL)];
    
    for (const timeMatch of times) {
      const time = timeMatch[1];
      const timeIndex = timeMatch.index!;
      
      // Get text before this time (max 200 chars)
      const startIndex = Math.max(0, timeIndex - 200);
      const beforeTime = cleanText.substring(startIndex, timeIndex).trim();
      
      // Find the last position number
      const posMatches = [...beforeTime.matchAll(/(?:^|\s)(\d{1,3})\s+([A-ZÁÉÍÓÚÜÑ])/g)];
      if (posMatches.length === 0) continue;
      
      const lastPosMatch = posMatches[posMatches.length - 1];
      const position = parseInt(lastPosMatch[1]);
      
      const posIndex = beforeTime.lastIndexOf(lastPosMatch[0]);
      const entryText = beforeTime.substring(posIndex).trim();
      
      // Parse: Position NAME, Surname YY ClubName
      const simplePattern = /^(\d{1,3})\s+([A-ZÁÉÍÓÚÜÑ][^,]+,\s*[A-Za-záéíóúüñ]+)\s+(\d{2})\s+(.+)$/i;
      const simpleMatch = entryText.match(simplePattern);
      
      if (simpleMatch) {
        let year = parseInt(simpleMatch[3]);
        year = year > 50 ? 1900 + year : 2000 + year;
        
        entries.push({
          position: parseInt(simpleMatch[1]),
          name: simpleMatch[2].trim(),
          birthYear: year,
          clubName: simpleMatch[4].trim(),
          time,
          courseType: 'S',
        });
      }
    }
  }
  
  // Remove duplicates by position
  const seen = new Set<number>();
  const uniqueEntries = entries.filter(e => {
    if (seen.has(e.position)) return false;
    seen.add(e.position);
    return true;
  });
  
  return uniqueEntries.sort((a, b) => a.position - b.position);
}

// Convert time string to seconds
export function timeToSeconds(time: string): number {
  const parts = time.split(':');
  
  if (parts.length === 2) {
    const minutes = parseInt(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  } else {
    return parseFloat(time);
  }
}

// Format seconds back to time string
export function secondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(2);
  
  if (mins > 0) {
    return `${mins}:${secs.padStart(5, '0')}`;
  }
  return secs;
}

// Map stroke names to English
export function normalizeStroke(stroke: string): Stroke {
  const s = stroke.toLowerCase();
  if (s.includes('estilos') || s.includes('medley')) return 'medley';
  if (s.includes('espalda') || s.includes('backstroke')) return 'backstroke';
  if (s.includes('braza') || s.includes('breaststroke')) return 'breaststroke';
  if (s.includes('mariposa') || s.includes('butterfly')) return 'butterfly';
  return 'freestyle';
}
