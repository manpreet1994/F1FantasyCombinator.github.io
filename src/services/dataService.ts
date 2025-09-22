
import type { FantasyData, Race, RaceInfo, Driver, Constructor, ApiFantasyResponse } from '../types';

const API_URL = "http://localhost:3001/api/statistics/2025";
const FALLBACK_DATA_URL = "/data/fantasy-data.json";

// Name mappings to convert abbreviations to full names
const driverNameMapping: { [key: string]: string } = {
  DOO: "Jack Doohan", GAS: "Pierre Gasly", ALO: "Fernando Alonso", STR: "Lance Stroll",
  HAM: "Lewis Hamilton", LEC: "Charles Leclerc", BEA: "Oliver Bearman", OCO: "Esteban Ocon",
  BOR: "Gabriel Bortoleto", HUL: "Nico Hülkenberg", NOR: "Lando Norris", PIA: "Oscar Piastri",
  ANT: "Andrea Kimi Antonelli", RUS: "George Russell", LAW: "Liam Lawson", VER: "Max Verstappen",
  HAD: "Isack Hadjar", TSU: "Yuki Tsunoda", ALB: "Alexander Albon", SAI: "Carlos Sainz",
  COL: "Franco Colapinto"
};

const constructorNameMapping: { [key: string]: string } = {
  ALP: "Alpine", AST: "Aston Martin", FER: "Ferrari", HAA: "Haas F1 Team",
  KCK: "Kick Sauber", MCL: "McLaren", MER: "Mercedes", RED: "Red Bull Racing",
  VRB: "RB", WIL: "Williams"
};

const getDriverDisplayName = (id: string): string => {
  const abbr = id.split('_')[1];
  return driverNameMapping[abbr] || id;
};

const getConstructorDisplayName = (id: string): string => {
  return constructorNameMapping[id] || id;
};

const transformFantasyData = (apiData: ApiFantasyResponse): FantasyData | null => {
  if (!apiData || !apiData.seasonResult) return null;

  const driversMap: Map<string, Driver> = new Map();
  const constructorsMap: Map<string, Constructor> = new Map();

  const raceResults = apiData.seasonResult.raceResults;
  const raceRounds = Object.keys(raceResults).sort((a, b) => parseInt(a) - parseInt(b));
  
  for (const round of raceRounds) {
    const race = raceResults[round];
    if (!race || (!race.drivers && !race.constructors)) continue;

    // Process drivers for the round
    if (race.drivers) {
      for (const apiDriver of race.drivers) {
        if (!apiDriver.isActive) continue;
        
        const displayName = getDriverDisplayName(apiDriver.id);
        const nameParts = displayName.split(' ');

        let driver = driversMap.get(apiDriver.id);
        if (!driver) {
          driver = {
            id: apiDriver.id,
            display_name: displayName,
            first_name: nameParts[0],
            last_name: nameParts.slice(1).join(' '),
            price: String(apiDriver.price),
            season_score: '0',
            scores_by_race: {},
          };
        }
        driver.season_score = String(Number(driver.season_score) + apiDriver.totalPoints);
        driver.scores_by_race[round] = String(apiDriver.totalPoints);
        driver.price = String(apiDriver.price);
        driversMap.set(apiDriver.id, driver);
      }
    }

    // Process constructors for the round
    if (race.constructors) {
      for (const apiConstructor of race.constructors) {
        let constructor = constructorsMap.get(apiConstructor.id);
        if (!constructor) {
          constructor = {
            id: apiConstructor.id,
            display_name: getConstructorDisplayName(apiConstructor.id),
            price: String(apiConstructor.price),
            season_score: '0',
            scores_by_race: {},
          };
        }
        constructor.season_score = String(Number(constructor.season_score) + apiConstructor.totalPoints);
        constructor.scores_by_race[round] = String(apiConstructor.totalPoints);
        constructor.price = String(apiConstructor.price);
        constructorsMap.set(apiConstructor.id, constructor);
      }
    }
  }

  return {
    last_updated: new Date().toISOString(),
    season: apiData.seasonResult.season,
    constructors: Array.from(constructorsMap.values()),
    drivers: Array.from(driversMap.values()),
  };
};

export const fetchFantasyData = async (): Promise<{ data: FantasyData | null, isStale: boolean }> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const apiData: ApiFantasyResponse = await response.json();
    const data = transformFantasyData(apiData);
    return { data, isStale: false };
  } catch (error) {
    console.error("Failed to fetch live fantasy data, falling back to local data:", error);
    try {
      const fallbackResponse = await fetch(FALLBACK_DATA_URL);
      const fallbackApiData: ApiFantasyResponse = await fallbackResponse.json();
      const data = transformFantasyData(fallbackApiData);
      return { data: data, isStale: true };
    } catch (fallbackError) {
      console.error("Failed to fetch fallback data:", fallbackError);
      return { data: null, isStale: true };
    }
  }
};

export const fetchRaceSchedule = async (): Promise<RaceInfo> => {
  try {
    const response = await fetch('/data/races.json');
    const schedule: Race[] = await response.json();
    
    const now = new Date();
    // To get the date part only, ignoring time
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let currentRace: Race | null = null;
    let upcomingRace: Race | null = null;

    // Sort races by date just in case they are not in order
    schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const race of schedule) {
      const raceDate = new Date(race.date + 'T23:59:59Z'); // Consider end of day for comparison
      if (raceDate >= today) {
        if (!upcomingRace) {
          upcomingRace = race;
        }
      } else {
        currentRace = race;
      }
    }

    return { currentRace, upcomingRace };
  } catch (error) {
    console.error("Failed to fetch race schedule:", error);
    return { currentRace: null, upcomingRace: null };
  }
};
