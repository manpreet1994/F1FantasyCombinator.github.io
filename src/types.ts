
export interface ScoresByRace {
  [round: string]: string;
}

export interface Driver {
  id: string;
  display_name: string;
  first_name: string;
  last_name: string;
  price: string;
  season_score: string;
  scores_by_race: ScoresByRace;
}

export interface Constructor {
  id: string;
  display_name: string;
  price: string;
  season_score: string;
  scores_by_race: ScoresByRace;
}

export interface FantasyData {
  last_updated: string;
  season: number;
  constructors: Constructor[];
  drivers: Driver[];
}

export interface Race {
  round: number;
  name?: string; // Keep for compatibility
  race_name?: string; // Corrected property from the schedule API
  date: string;
}

export interface RaceInfo {
  currentRace: Race | null;
  upcomingRace: Race | null;
}

export type View = 'EXPLORATION' | 'COMPARISON' | 'PREDICTION';

// Interfaces for the new API data structure
interface ApiPoints {
  points: number;
  text: string;
  nnPoints: number;
}

interface ApiRaceResultDetail {
  positionPoints: ApiPoints;
  notClassifiedPoints: ApiPoints;
  disqualifiedPoints: ApiPoints;
  totalPoints: ApiPoints;
  teamworkPoints?: ApiPoints;
  fastestLapPoints?: ApiPoints;
  overtakes?: ApiPoints;
  positionsGained?: ApiPoints;
  dotdPoints?: ApiPoints;
}

interface ApiEventResult {
  Q?: ApiRaceResultDetail;
  R?: ApiRaceResultDetail;
  S?: ApiRaceResultDetail;
}

interface ApiBasePlayer {
  id: string;
  abbreviation: string;
  type: 'driver' | 'constructor';
  price: number;
  totalPoints: number;
  raceResult: ApiEventResult;
}

export interface ApiDriver extends ApiBasePlayer {
  type: 'driver';
  isActive: boolean;
  constructorId: string;
}

export interface ApiConstructor extends ApiBasePlayer {
  type: 'constructor';
}

export interface ApiRaceData {
  drivers: ApiDriver[];
  constructors: ApiConstructor[];
}

export interface ApiSeasonResult {
  season: number;
  raceResults: { [round: string]: ApiRaceData };
}

export interface ApiFantasyResponse {
  seasonResult: ApiSeasonResult;
  races: any[];
}

// Interfaces for the simple/alternative fantasy data structure
export interface SimpleDriverRaceData {
  fantasy_cost: number;
  fantasy_score: number;
  [key: string]: any; // for other properties like fp1_position etc.
}

export interface SimpleFantasyData {
  [round: string]: { [driverAbbr: string]: SimpleDriverRaceData };
}

export interface TeamMappingItem {
  id: string;
  name: string;
}
