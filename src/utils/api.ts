const API_BASE_URL = 'http://localhost:3000'; // Make sure this matches your backend

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
      const url = `${API_BASE_URL}/api/search/brave`;
      const body = { query, type, location };
      
      console.log('🔍 Frontend making request to:', url);
      console.log('📤 Request body:', body);
      console.log('🌐 Full request details:', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch Error Details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // More specific error handling
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          query,
          results: [],
          ttsResponse: `Connection failed: Cannot reach backend server at ${API_BASE_URL}. Please ensure the backend is running on port 3000 and check for CORS issues.`,
          error: 'Connection failed - check backend server and CORS configuration'
        };
      }
      
      return {
        success: false,
        query,
        results: [],
        ttsResponse: `Network error: ${error.message}. Error type: ${error.name}`,
        error: error.message
      };
    }
  },

  exa: async (query: string, type: string = 'neural', includeDomains?: string[]): Promise<SearchResponse> => {
    try {
      const url = `${API_BASE_URL}/api/search/exa`;
      const body = { query, type, includeDomains };
      
      console.log('🧠 Frontend making Exa request to:', url);
      console.log('📤 Request body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('📡 Exa Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Exa Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Exa Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Exa API Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          query,
          results: [],
          ttsResponse: `Connection failed: Cannot reach backend server at ${API_BASE_URL}. Please ensure the backend is running on port 3000.`,
          error: 'Connection failed'
        };
      }
      
      return {
        success: false,
        query,
        results: [],
        ttsResponse: `Network error: ${error.message}`,
        error: error.message
      };
    }
  },

  crypto: async (symbol: string): Promise<SearchResponse> => {
    try {
      const url = `${API_BASE_URL}/api/search/crypto`;
      const body = { symbol };
      
      console.log('💰 Frontend making crypto request to:', url);
      console.log('📤 Request body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('📡 Crypto Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Crypto Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Crypto Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Crypto API Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          query: `${symbol} crypto`,
          results: [],
          ttsResponse: `Connection failed: Cannot reach backend server at ${API_BASE_URL}. Please ensure the backend is running on port 3000.`,
          error: 'Connection failed'
        };
      }
      
      return {
        success: false,
        query: `${symbol} crypto`,
        results: [],
        ttsResponse: `Network error: ${error.message}`,
        error: error.message
      };
    }
  },

  restaurants: async (location: string, cuisine?: string, query?: string): Promise<SearchResponse> => {
    try {
      const url = `${API_BASE_URL}/api/search/restaurants`;
      const body = { location, cuisine, query };
      
      console.log('🍽️ Frontend making restaurant request to:', url);
      console.log('📤 Request body:', body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      console.log('📡 Restaurant Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Restaurant Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ Restaurant Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ Restaurant API Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          query: query || 'restaurants',
          results: [],
          ttsResponse: `Connection failed: Cannot reach backend server at ${API_BASE_URL}. Please ensure the backend is running on port 3000.`,
          error: 'Connection failed'
        };
      }
      
      return {
        success: false,
        query: query || 'restaurants',
        results: [],
        ttsResponse: `Network error: ${error.message}`,
        error: error.message
      };
    }
  },
};
