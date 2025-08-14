const API_BASE_URL = 'http://localhost:3000';

export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  published?: string;
  score?: number;
  publishedDate?: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  ttsResponse: string;
  totalResults?: number;
  error?: string;
}

export const searchAPI = {
  brave: async (query: string, type: string = 'web', location?: string): Promise<SearchResponse> => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/api/search/brave`);
      console.log('Request body:', { query, type, location });
      
      const response = await fetch(`${API_BASE_URL}/api/search/brave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type, location }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        query,
        results: [],
        ttsResponse: `Network error: ${error.message}. Please check if the backend server is running on port 3000.`,
        error: error.message
      };
    }
  },

  exa: async (query: string, type: string = 'neural', includeDomains?: string[]): Promise<SearchResponse> => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/api/search/exa`);
      console.log('Request body:', { query, type, includeDomains });
      
      const response = await fetch(`${API_BASE_URL}/api/search/exa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type, includeDomains }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        query,
        results: [],
        ttsResponse: `Network error: ${error.message}. Please check if the backend server is running on port 3000.`,
        error: error.message
      };
    }
  },

  crypto: async (symbol: string): Promise<SearchResponse> => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/api/search/crypto`);
      console.log('Request body:', { symbol });
      
      const response = await fetch(`${API_BASE_URL}/api/search/crypto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        query: `${symbol} crypto`,
        results: [],
        ttsResponse: `Network error: ${error.message}. Please check if the backend server is running on port 3000.`,
        error: error.message
      };
    }
  },

  restaurants: async (location: string, cuisine?: string, query?: string): Promise<SearchResponse> => {
    try {
      console.log('Making request to:', `${API_BASE_URL}/api/search/restaurants`);
      console.log('Request body:', { location, cuisine, query });
      
      const response = await fetch(`${API_BASE_URL}/api/search/restaurants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location, cuisine, query }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        query: query || 'restaurants',
        results: [],
        ttsResponse: `Network error: ${error.message}. Please check if the backend server is running on port 3000.`,
        error: error.message
      };
    }
  },
};
