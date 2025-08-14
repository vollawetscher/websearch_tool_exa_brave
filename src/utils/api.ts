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
    const response = await fetch(`${API_BASE_URL}/api/search/brave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, type, location }),
    });
    return response.json();
  },

  exa: async (query: string, type: string = 'neural', includeDomains?: string[]): Promise<SearchResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/search/exa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, type, includeDomains }),
    });
    return response.json();
  },

  crypto: async (symbol: string): Promise<SearchResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/search/crypto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });
    return response.json();
  },

  restaurants: async (location: string, cuisine?: string, query?: string): Promise<SearchResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/search/restaurants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location, cuisine, query }),
    });
    return response.json();
  },
};
