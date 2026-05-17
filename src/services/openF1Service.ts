const BASE_URL = 'https://api.openf1.org/v1';

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

export const openF1Service = {
  async getLatestSession(): Promise<Session | null> {
    try {
      const now = new Date();
      // Get sessions from the last 2 days to catch current or very recent ones
      const past2Days = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString().split('.')[0];
      
      const response = await fetch(`${BASE_URL}/sessions?date_start=>=${past2Days}`);
      const data = await response.json();

      if (data && data.length > 0) {
        // Find the most recent session
        const sessions: Session[] = data;
        // Sort by date_start descending
        sessions.sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime());
        return sessions[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching OpenF1 session:', error);
      return null;
    }
  },

  async getWeather(sessionKey: number): Promise<Weather | null> {
    try {
      const response = await fetch(`${BASE_URL}/weather?session_key=${sessionKey}`);
      const data = await response.json();
      if (data && data.length > 0) {
        // Get the latest weather entry
        return data[data.length - 1];
      }
      return null;
    } catch (error) {
      console.error('Error fetching OpenF1 weather:', error);
      return null;
    }
  },

  async getSessionsByYear(year: number): Promise<Session[]> {
    try {
      const response = await fetch(`${BASE_URL}/sessions?year=${year}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching OpenF1 sessions by year:', error);
      return [];
    }
  },

  async getRaceControlBySession(sessionKey: number): Promise<RaceControl[]> {
    try {
      const response = await fetch(`${BASE_URL}/race_control?session_key=${sessionKey}`);
      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('Error fetching OpenF1 race control by session:', error);
      return [];
    }
  },
};
