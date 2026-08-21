const API_DIRECT_URL = 'https://api.openf1.org/v1';
const PROXY_URL = '/api/openf1';

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
    session_key: 9574,
    session_name: "Race",
    session_type: "Race",
    date_start,
    date_end,
    location: "Spa-Francorchamps",
    country_name: "Belgium",
    circuit_short_name: "Spa-Francorchamps",
    meeting_key: 1242
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
      session_key: 9523,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-05-26T13:00:00Z`,
      date_end: `${year}-05-26T15:00:00Z`,
      location: "Monaco",
      country_name: "Monaco",
      circuit_short_name: "Monte Carlo",
      meeting_key: 1236
    },
    {
      session_key: 9531,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-06-09T18:00:00Z`,
      date_end: `${year}-06-09T20:00:00Z`,
      location: "Montreal",
      country_name: "Canada",
      circuit_short_name: "Montreal",
      meeting_key: 1237
    },
    {
      session_key: 9539,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-06-23T13:00:00Z`,
      date_end: `${year}-06-23T15:00:00Z`,
      location: "Barcelona",
      country_name: "Spain",
      circuit_short_name: "Catalunya",
      meeting_key: 1238
    },
    {
      session_key: 9550,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-06-30T13:00:00Z`,
      date_end: `${year}-06-30T15:00:00Z`,
      location: "Spielberg",
      country_name: "Austria",
      circuit_short_name: "Spielberg",
      meeting_key: 1239
    },
    {
      session_key: 9558,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-07-07T14:00:00Z`,
      date_end: `${year}-07-07T16:00:00Z`,
      location: "Silverstone",
      country_name: "Great Britain",
      circuit_short_name: "Silverstone",
      meeting_key: 1240
    },
    {
      session_key: 9566,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-07-21T13:00:00Z`,
      date_end: `${year}-07-21T15:00:00Z`,
      location: "Budapest",
      country_name: "Hungary",
      circuit_short_name: "Hungaroring",
      meeting_key: 1241
    },
    {
      session_key: 9574,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-07-28T13:00:00Z`,
      date_end: `${year}-07-28T15:00:00Z`,
      location: "Spa-Francorchamps",
      country_name: "Belgium",
      circuit_short_name: "Spa-Francorchamps",
      meeting_key: 1242
    },
    {
      session_key: 9582,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-08-25T13:00:00Z`,
      date_end: `${year}-08-25T15:00:00Z`,
      location: "Zandvoort",
      country_name: "Netherlands",
      circuit_short_name: "Zandvoort",
      meeting_key: 1243
    },
    {
      session_key: 9590,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-09-01T13:00:00Z`,
      date_end: `${year}-09-01T15:00:00Z`,
      location: "Monza",
      country_name: "Italy",
      circuit_short_name: "Monza",
      meeting_key: 1244
    },
    {
      session_key: 9636,
      session_name: "Race",
      session_type: "Race",
      date_start: `${year}-11-03T15:30:00Z`,
      date_end: `${year}-11-03T17:30:00Z`,
      location: "São Paulo",
      country_name: "Brazil",
      circuit_short_name: "Interlagos",
      meeting_key: 1249
    }
  ];
}

async function requestOpenF1<T>(path: string): Promise<T | null> {
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Try proxy first
  try {
    const proxyRes = await fetch(`${PROXY_URL}/${cleanPath}`);
    if (proxyRes.ok) {
      const ct = proxyRes.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await proxyRes.json();
        return data as T;
      }
    }
  } catch (_) {
    // Proxy failed, try direct fetch
  }

  // Direct fetch fallback
  try {
    const directRes = await fetch(`${API_DIRECT_URL}/${cleanPath}`);
    if (directRes.ok) {
      const ct = directRes.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await directRes.json();
        return data as T;
      }
    }
  } catch (_) {
    // Direct fetch failed
  }

  return null;
}

export const openF1Service = {
  async getLatestSession(): Promise<Session | null> {
    try {
      // 1. Try fetching the official latest session endpoint
      const latestData = await requestOpenF1<Session[]>('sessions?session_key=latest');
      if (latestData && latestData.length > 0) {
        return latestData[0];
      }

      // 2. Try fetching recent sessions for the current year
      const currentYear = new Date().getFullYear();
      const yearsToTry = [currentYear, 2024, 2023];
      
      for (const year of yearsToTry) {
        try {
          const sessions = await this.getSessionsByYear(year);
          if (sessions && sessions.length > 0) {
            const now = new Date();
            const pastOrActiveSessions = sessions.filter(s => {
              const start = new Date(s.date_start);
              return start <= new Date(now.getTime() + 12 * 60 * 60 * 1000);
            });

            if (pastOrActiveSessions.length > 0) {
              const sorted = [...pastOrActiveSessions].sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
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
      const data = await requestOpenF1<Weather[]>(`weather?session_key=${sessionKey}`);
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
      const data = await requestOpenF1<Session[]>(`sessions?year=${year}`);
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
      const data = await requestOpenF1<RaceControl[]>(`race_control?session_key=${sessionKey}`);
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

