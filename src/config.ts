const F1_FANTASY_YEAR = 2025;

export const apiConfig = {
  fantasyData: {
    url: `https://manpreet1994.pythonanywhere.com/fantasy_scores/${F1_FANTASY_YEAR}`,
    fallbackUrl: "/data/fantasy-data.json",
  },
  raceSchedule: {
    url: `https://manpreet1994.pythonanywhere.com/schedule/${F1_FANTASY_YEAR}`,
  },
  mappings: {
    drivers: `https://manpreet1994.pythonanywhere.com/driver_mapping/${F1_FANTASY_YEAR}`,
    constructors: `https://manpreet1994.pythonanywhere.com/team_mapping/${F1_FANTASY_YEAR}`,
  }
};