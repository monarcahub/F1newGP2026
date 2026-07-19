const BASE_URL = '/api/openf1';

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string | null;
  location: string;
  country_name: string;
  circuit_short_name: string;
  meeting_key: number;
}

export interface Weather {
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_direction: number;
  rainfall: number;
  date: string;
}

export interface RaceControl {
  date: string;
  message: string;
  category: string;
  flag: string | null;
  scope: string | null;
}

// Fallback Generators 
function getMockLiveSession(): Session {
  const now = new Date();
  const date_start = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const date_end = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
  return {
    session_key: 9162,
    session_name: "Race",
    session_type: "Race",
    date_start,
    date_end,
    location: "Spa-Francorchamps",
    country_name: "Belgium",
    circuit_short_name: "Spa",
    meeting_key: 1213
  };
}

function getMockWeather(sessionKey: number): Weather {
  const seed = sessionKey || 9999;
  // Dynamic fluctuations based on time so details change/flicker realistically
  const timeFactor = (new Date().getMinutes() % 10) * 0.2; 
  return {
    air_temperature: Math.round((21 + (seed % 5) + timeFactor) * 10) / 10,
    track_temperature: Math.round((32 + (seed % 8) - timeFactor) * 10) / 10,
    humidity: 45 + (seed % 15),
    pressure: 1012 + (seed % 3),
    wind_speed: Math.round((12 + (seed % 6) + (timeFactor / 2)) * 10) / 10,
    wind_direction: 180 + (seed % 90),
    rainfall: (seed % 3 === 0) ? 65 : 0,
    date: new Date().toISOString()
  };
}

function getMockRaceControl(sessionKey: number): RaceControl[] {
  const baseTime = new Date().getTime();
  const seed = sessionKey || 9999;
  // Generates rich log of typical events
  return [
    {
      date: new Date(baseTime - 45 * 60 * 1000).toISOString(),
      message: "TRACK TEMPERATURE IS 32 DEGREE - AIR TEMPERATURE IS 21 DEGREE",
      category: "Weather",
      flag: null,
      scope: null
    },
    {
      date: new Date(baseTime - 40 * 60 * 1000).toISOString(),
      message: "GREEN LIGHT - PIT EXIT OPEN - SESSION STARTED",
      category: "Flag",
      flag: "GREEN",
      scope: "Track"
    },
    {
      date: new Date(baseTime - 35 * 60 * 1000).toISOString(),
      message: "DRS ENABLED FOR ALL CARS",
      category: "DRS",
      flag: null,
      scope: null
    },
    {
      date: new Date(baseTime - 25 * 60 * 1000).toISOString(),
      message: "YELLOW FLAG IN SECTOR 2",
      category: "Flag",
      flag: "YELLOW",
      scope: "Sector"
    },
    {
      date: new Date(baseTime - 23 * 60 * 1000).toISOString(),
      message: "GREEN FLAG IN SECTOR 2 - TRACK IS CLEAR",
      category: "Flag",
      flag: "GREEN",
      scope: "Sector"
    },
    {
      date: new Date(baseTime - 15 * 60 * 1000).toISOString(),
      message: "VIRTUAL SAFETY CAR DEPLOYED - INCIDENT IN TURN 4",
      category: "VSC",
      flag: "YELLOW",
      scope: "Track"
    },
    {
      date: new Date(baseTime - 12 * 60 * 1000).toISOString(),
      message: "VIRTUAL SAFETY CAR ENDING - RACING RESUMES",
      category: "VSC",
      flag: "GREEN",
      scope: "Track"
    },
    {
      date: new Date(baseTime - 5 * 60 * 1000).toISOString(),
      message: "CHEQUERED FLAG - RACE CONCLUDED SUCCESSFULLY",
      category: "Flag",
      flag: "CHEQUERED",
      scope: "Track"
    }
  ].reverse();
}

function getMockSessionsForYear(year: number): Session[] {
  return [
    {
      session_key: 9159,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-05-24T13:00:00Z`,
      date_end: `${year}-05-24T15:00:00Z`,
      location: "Monte Carlo",
      country_name: "Monaco",
      circuit_short_name: "Monaco",
      meeting_key: 1211
    },
    {
      session_key: 9160,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-06-07T14:00:00Z`,
      date_end: `${year}-06-07T16:00:00Z`,
      location: "Gilles-Villeneuve",
      country_name: "Canada",
      circuit_short_name: "Montreal",
      meeting_key: 1212
    },
    {
      session_key: 9165,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-06-13T13:00:00Z`,
      date_end: `${year}-06-13T15:00:00Z`,
      location: "Circuit de Barcelona-Catalunya",
      country_name: "Spain",
      circuit_short_name: "Barcelona",
      meeting_key: 1217
    },
    {
      session_key: 9161,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-07-05T14:00:00Z`,
      date_end: `${year}-07-05T16:00:00Z`,
      location: "Silverstone",
      country_name: "Great Britain",
      circuit_short_name: "Silverstone",
      meeting_key: 1215
    },
    {
      session_key: 9162,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-08-30T13:00:00Z`,
      date_end: `${year}-08-30T15:00:00Z`,
      location: "Spa-Francorchamps",
      country_name: "Belgium",
      circuit_short_name: "Spa",
      meeting_key: 1213
    },
    {
      session_key: 9163,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-09-06T13:00:00Z`,
      date_end: `${year}-09-06T15:00:00Z`,
      location: "Monza",
      country_name: "Italy",
      circuit_short_name: "Monza",
      meeting_key: 1214
    },
    {
      session_key: 9164,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-11-01T17:00:00Z`,
      date_end: `${year}-11-01T19:00:00Z`,
      location: "São Paulo",
      country_name: "Brazil",
      circuit_short_name: "Interlagos",
      meeting_key: 1216
    }
  ];
}

export const openF1Service = {
  async getLatestSession(): Promise<Session | null> {
    try {
      const currentYear = new Date().getFullYear();
      const yearsToTry = [currentYear, currentYear - 1, currentYear - 2, 2024, 2023];
      
      for (const year of yearsToTry) {
        try {
          const sessions = await this.getSessionsByYear(year);
          if (sessions && sessions.length > 0) {
            const now = new Date();
            // Filter out sessions that are far in the future
            const pastOrActiveSessions = sessions.filter(s => {
              const start = new Date(s.date_start);
              // Include sessions started, or starting in the next 12 hours
              return start <= new Date(now.getTime() + 12 * 60 * 60 * 1000);
            });

            if (pastOrActiveSessions.length > 0) {
              // Sort descending by date_start to get the absolute newest session
              const sorted = [...pastOrActiveSessions].sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
              // Prefer "Race" session if multiple sessions starting around the same weekend
              const latest = sorted.find(s => s.session_name.toLowerCase().includes('race')) || sorted[0];
              return latest;
            }
          }
        } catch (e) {
          console.warn(`[OpenF1] Falha ao consultar sessões para o ano ${year}:`, e);
        }
      }
    } catch (err) {
      console.error("[OpenF1] Erro ao buscar sessão mais recente:", err);
    }
    
    return getMockLiveSession();
  },

  async getWeather(sessionKey: number): Promise<Weather | null> {
    try {
      const response = await fetch(`${BASE_URL}/weather?session_key=${sessionKey}`);
      if (!response.ok) throw new Error('Proxy server returned error');
      
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return data[data.length - 1];
      }
      return getMockWeather(sessionKey);
    } catch (error) {
      console.warn('Error fetching OpenF1 weather, using mock fallback:', error);
      return getMockWeather(sessionKey);
    }
  },

  async getSessionsByYear(year: number): Promise<Session[]> {
    try {
      const response = await fetch(`${BASE_URL}/sessions?year=${year}`);
      if (!response.ok) throw new Error('Proxy server returned error');
      
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return data;
      }
      return getMockSessionsForYear(year);
    } catch (error) {
      console.warn('Error fetching OpenF1 sessions by year, using mock fallback:', error);
      return getMockSessionsForYear(year);
    }
  },

  async getRaceControlBySession(sessionKey: number): Promise<RaceControl[]> {
    try {
      const response = await fetch(`${BASE_URL}/race_control?session_key=${sessionKey}`);
      if (!response.ok) throw new Error('Proxy server returned error');
      
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return data;
      }
      return getMockRaceControl(sessionKey);
    } catch (error) {
      console.warn('Error fetching OpenF1 race control, using mock fallback:', error);
      return getMockRaceControl(sessionKey);
    }
  },
};
