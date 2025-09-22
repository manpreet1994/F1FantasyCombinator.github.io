
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
  name: string;
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
