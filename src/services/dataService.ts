
import type { FantasyData, Race, RaceInfo, Driver, Constructor, ApiFantasyResponse, SimpleFantasyData, TeamMappingItem } from '../types';
import { apiConfig } from '../config';

type DriverNameMapping = { [key: string]: { name: string; [key: string]: any } };
type ConstructorNameMapping = { [key: string]: string };

let driverNameMapping: DriverNameMapping | null = null;
let constructorNameMapping: ConstructorNameMapping | null = null;

const fetchMappings = async (): Promise<void> => {
  if (driverNameMapping && constructorNameMapping) return;

  try {
    const [driverRes, constructorRes] = await Promise.all([
      fetch(apiConfig.mappings.drivers),
      fetch(apiConfig.mappings.constructors)
    ]);

    if (!driverRes.ok) {
      throw new Error(`Failed to fetch driver mappings: ${driverRes.statusText}`);
    }
    if (!constructorRes.ok) {
      throw new Error(`Failed to fetch constructor mappings: ${constructorRes.statusText}`);
    }
    const drivers: DriverNameMapping = await driverRes.json();
    const constructors: TeamMappingItem[] | ConstructorNameMapping = await constructorRes.json();
    console.log("Fetched driver name mapping:", drivers);
    console.log("Fetched constructor name mapping:", constructors);
    driverNameMapping = drivers;
    if (Array.isArray(constructors)) {
      constructorNameMapping = constructors.reduce((acc: ConstructorNameMapping, team) => {
        acc[team.id] = team.name;
        return acc;
      }, {});
    } else {
      constructorNameMapping = constructors;
    }
  } catch (error) {
    console.error("Failed to fetch name mappings:", error);
    driverNameMapping = {};
    constructorNameMapping = {};
  }
};

const getDriverDisplayName = (id: string): string => {
  // The id can be in format 'FER_LEC' or just 'LEC'.
  // We need to handle both to get the abbreviation.
  const idParts = id.split('_');
  const abbr = idParts.length > 1 ? idParts[1] : id;

  return driverNameMapping?.[abbr]?.name || abbr;
};

const getConstructorDisplayName = (id: string): string => {
  return constructorNameMapping?.[id] || id;
};

const transformSimpleFantasyData = (simpleData: SimpleFantasyData): FantasyData | null => {
  if (!simpleData) return null;

  const driversMap: Map<string, Driver> = new Map();
  const raceRounds = Object.keys(simpleData).sort((a, b) => parseInt(a) - parseInt(b));

  for (const round of raceRounds) {
    const roundData = simpleData[round];
    for (const driverAbbr in roundData) {
      const driverData = roundData[driverAbbr];
      // The ID is not present, so we'll have to be creative or assume a convention.
      // Let's assume we can find a full ID from the driver mapping.
      // This part is tricky without a proper ID in the source.
      // For now, we'll use the abbreviation as a key part.
      const driverId = `UNKNOWN_${driverAbbr}`; // Placeholder ID
      const displayName = getDriverDisplayName(driverAbbr);
      const nameParts = displayName.split(' ');

      let driver = driversMap.get(driverId);
      if (!driver) {
        driver = {
          id: driverId,
          display_name: displayName,
          first_name: nameParts[0],
          last_name: nameParts.slice(1).join(' '),
          price: String(driverData.fantasy_cost),
          season_score: '0',
          scores_by_race: {},
        };
      }
      driver.season_score = String(Number(driver.season_score) + driverData.fantasy_score);
      driver.scores_by_race[round] = String(driverData.fantasy_score);
      driver.price = String(driverData.fantasy_cost);
      driversMap.set(driverId, driver);
    }
  }

  return {
    last_updated: new Date().toISOString(),
    season: new Date().getFullYear(), // Or get from somewhere else
    constructors: [], // This format doesn't have constructors
    drivers: Array.from(driversMap.values()),
  };
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
  await fetchMappings();
  try {
    const response = await fetch(apiConfig.fantasyData.url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const apiData: ApiFantasyResponse = await response.json();
    // Check if it's the detailed format or the simple one
    let data;
    if (apiData.seasonResult) {
      data = transformFantasyData(apiData);
    } else {
      data = transformSimpleFantasyData(apiData as unknown as SimpleFantasyData);
    }

    return { data, isStale: false };
  } catch (error) {
    console.error("Failed to fetch live fantasy data, falling back to local data:", error);
    try {
      const fallbackResponse = await fetch(apiConfig.fantasyData.fallbackUrl);
      const fallbackApiData: ApiFantasyResponse | SimpleFantasyData = await fallbackResponse.json();
      let data;
      if ((fallbackApiData as ApiFantasyResponse).seasonResult) {
        data = transformFantasyData(fallbackApiData as ApiFantasyResponse);
      } else {
        data = transformSimpleFantasyData(fallbackApiData as SimpleFantasyData);
      }
      return { data: data, isStale: true };
    } catch (fallbackError) {
      console.error("Failed to fetch fallback data:", fallbackError);
      return { data: null, isStale: true };
    }
  }
};

export const fetchRaceSchedule = async (): Promise<RaceInfo> => {
  try {
    const response = await fetch(apiConfig.raceSchedule.url);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    const scheduleData: { races: Race[] } = await response.json();
    console.log("Fetched race schedule data:", scheduleData);
    // The schedule API uses 'race_name' while other parts might use 'name'.
    // Let's normalize it to use 'name' for consistency within the app.
    const schedule = scheduleData.races.map(race => ({
      ...race,
      name: race.race_name || race.name,
    }));
    
    // Get the current date at midnight UTC to compare against race dates
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    let upcomingRace: Race | null = null;
    let lastRace: Race | null = null;

    schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const race of schedule) {
      const raceDate = new Date(race.date); // Assumes date is in 'YYYY-MM-DD' format, parsed as UTC
      if (raceDate >= today) {
        if (!upcomingRace) upcomingRace = race;
      } else {
        lastRace = race;
      }
    }

    return { currentRace: lastRace, upcomingRace };
  } catch (error) {
    console.error("Failed to fetch race schedule:", error);
    return { currentRace: null, upcomingRace: null };
  }
};
