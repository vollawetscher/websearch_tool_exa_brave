import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Enhanced dotenv loading with multiple fallback paths
const envPaths = [
  '.env',
  '../.env',
  join(process.cwd(), '.env'),
  join(__dirname, '.env'),
  join(__dirname, '../.env')
];

console.log('🔍 Loading environment variables...');
console.log('Current working directory:', process.cwd());
console.log('Script directory:', __dirname);

let envLoaded = false;
for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    console.log(`📁 Found .env file at: ${envPath}`);
    const result = dotenv.config({ path: envPath });
    if (!result.error) {
      console.log('✅ Successfully loaded .env file');
      envLoaded = true;
      break;
    } else {
      console.log(`❌ Error loading ${envPath}:`, result.error.message);
    }
  }
}

if (!envLoaded) {
  console.log('⚠️  No .env file found or loaded. Checking for environment variables...');
}

// Debug environment variables
console.log('🔑 Environment Variables Status:');
console.log('BRAVE_API_KEY:', process.env.BRAVE_API_KEY ? `SET (${process.env.BRAVE_API_KEY.substring(0, 10)}...)` : 'NOT SET');
console.log('EXA_API_KEY:', process.env.EXA_API_KEY ? `SET (${process.env.EXA_API_KEY.substring(0, 10)}...)` : 'NOT SET');

const app = express();
const PORT = process.env.PORT || 3000;

// FIXED: Enhanced CORS configuration to allow frontend origin
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Add explicit preflight handling
app.options('*', cors());

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ElevenLabs Voice Search Tool API is running',
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']
    },
    env: {
      braveApiKey: !!process.env.BRAVE_API_KEY,
      exaApiKey: !!process.env.EXA_API_KEY,
      braveKeyPreview: process.env.BRAVE_API_KEY ? process.env.BRAVE_API_KEY.substring(0, 10) + '...' : 'NOT SET',
      exaKeyPreview: process.env.EXA_API_KEY ? process.env.EXA_API_KEY.substring(0, 10) + '...' : 'NOT SET'
    },
    debug: {
      cwd: process.cwd(),
      dirname: __dirname,
      nodeEnv: process.env.NODE_ENV || 'NOT SET'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API connection successful!',
    timestamp: new Date().toISOString(),
    cors: 'CORS headers should be working now'
  });
});

// Brave Search API endpoint
app.post('/api/search/brave', async (req, res) => {
  console.log('🔍 Brave Search Request:', req.body);
  console.log('🌐 Request Origin:', req.get('Origin'));
  
  try {
    const { query, type = 'web', count = 10, location = null } = req.body;
    
    if (!process.env.BRAVE_API_KEY) {
      console.error('❌ BRAVE_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('API')));
      return res.status(500).json({
        success: false,
        error: 'BRAVE_API_KEY not configured',
        ttsResponse: 'The Brave API key is not configured. Please check your environment variables.'
      });
    }
    
    const params = {
      q: query,
      count,
      search_lang: 'en',
      country: 'US',
      safesearch: 'moderate',
      freshness: type === 'news' ? 'pd' : undefined,
      result_filter: type === 'news' ? 'news' : undefined
    };

    if (location) {
      params.location = location;
    }

    console.log('📡 Making request to Brave API with params:', params);

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params,
      timeout: 10000 // 10 second timeout
    });

    console.log('✅ Brave API Response Status:', response.status);

    // Format response for TTS compatibility
    const results = response.data.web?.results || [];
    const formattedResults = results.slice(0, 5).map(result => ({
      title: result.title,
      snippet: result.description,
      url: result.url,
      published: result.age
    }));

    // Create TTS-friendly summary
    let ttsResponse = '';
    if (formattedResults.length > 0) {
      ttsResponse = `I found ${formattedResults.length} relevant results for "${query}". `;
      formattedResults.forEach((result, index) => {
        ttsResponse += `${index + 1}. ${result.title}. ${result.snippet}. `;
      });
    } else {
      ttsResponse = `I couldn't find any results for "${query}". You might want to try a different search term.`;
    }

    const responseData = {
      success: true,
      query,
      results: formattedResults,
      ttsResponse,
      totalResults: response.data.web?.totalResults || 0
    };

    console.log('📤 Sending response:', { ...responseData, results: `${formattedResults.length} results` });

    res.json(responseData);

  } catch (error) {
    console.error('❌ Brave Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      ttsResponse: `I encountered an error while searching with Brave. ${error.message}. Please try again.`
    });
  }
});

// Exa.ai Search API endpoint
app.post('/api/search/exa', async (req, res) => {
  console.log('🧠 Exa Search Request:', req.body);
  console.log('🌐 Request Origin:', req.get('Origin'));
  
  try {
    const { query, type = 'neural', numResults = 10, includeDomains = null } = req.body;
    
    if (!process.env.EXA_API_KEY) {
      console.error('❌ EXA_API_KEY not found in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('API')));
      return res.status(500).json({
        success: false,
        error: 'EXA_API_KEY not configured',
        ttsResponse: 'The Exa API key is not configured. Please check your environment variables.'
      });
    }
    
    const searchData = {
      query,
      type,
      numResults,
      contents: {
        text: true,
        highlights: true,
        summary: true
      }
    };

    if (includeDomains) {
      searchData.includeDomains = includeDomains;
    }

    console.log('📡 Making request to Exa API with data:', searchData);

    const response = await axios.post('https://api.exa.ai/search', searchData, {
      headers: {
        'x-api-key': process.env.EXA_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('✅ Exa API Response Status:', response.status);

    const results = response.data.results || [];
    const formattedResults = results.slice(0, 5).map(result => ({
      title: result.title,
      snippet: result.summary || result.text?.substring(0, 200) + '...',
      url: result.url,
      score: result.score,
      publishedDate: result.publishedDate
    }));

    // Create TTS-friendly summary
    let ttsResponse = '';
    if (formattedResults.length > 0) {
      ttsResponse = `Using advanced AI search, I found ${formattedResults.length} highly relevant results for "${query}". `;
      formattedResults.forEach((result, index) => {
        ttsResponse += `${index + 1}. ${result.title}. ${result.snippet}. `;
      });
    } else {
      ttsResponse = `I couldn't find any results for "${query}" using AI search. You might want to try a different approach.`;
    }

    const responseData = {
      success: true,
      query,
      results: formattedResults,
      ttsResponse,
      totalResults: results.length
    };

    console.log('📤 Sending response:', { ...responseData, results: `${formattedResults.length} results` });

    res.json(responseData);

  } catch (error) {
    console.error('❌ Exa Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'AI search failed',
      ttsResponse: `I encountered an error while performing AI search with Exa. ${error.message}. Please try again.`
    });
  }
});

// Specialized search endpoints
app.post('/api/search/crypto', async (req, res) => {
  console.log('💰 Crypto Search Request:', req.body);
  console.log('🌐 Request Origin:', req.get('Origin'));
  
  try {
    const { symbol } = req.body;
    const query = `${symbol} cryptocurrency price current market cap`;
    
    if (!process.env.BRAVE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'BRAVE_API_KEY not configured',
        ttsResponse: 'The Brave API key is not configured for crypto search.'
      });
    }
    
    // Use Brave search for crypto data
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: query,
        count: 5,
        freshness: 'pd'
      },
      timeout: 10000
    });

    const results = response.data.web?.results || [];
    const cryptoInfo = results.find(r => 
      r.title.toLowerCase().includes(symbol.toLowerCase()) && 
      (r.title.toLowerCase().includes('price') || r.description.toLowerCase().includes('price'))
    );

    let ttsResponse = '';
    if (cryptoInfo) {
      ttsResponse = `Here's the latest information on ${symbol}: ${cryptoInfo.description}`;
    } else if (results.length > 0) {
      ttsResponse = `I found some information about ${symbol}: ${results[0].description}`;
    } else {
      ttsResponse = `I couldn't find current price information for ${symbol}. The cryptocurrency market data might be temporarily unavailable.`;
    }

    res.json({
      success: true,
      query: `${symbol} crypto price`,
      results: results.slice(0, 3),
      ttsResponse
    });

  } catch (error) {
    console.error('❌ Crypto Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Crypto search failed',
      ttsResponse: `I encountered an error while searching for ${req.body.symbol} cryptocurrency information. ${error.message}.`
    });
  }
});

app.post('/api/search/restaurants', async (req, res) => {
  console.log('🍽️ Restaurant Search Request:', req.body);
  console.log('🌐 Request Origin:', req.get('Origin'));
  
  try {
    const { location, cuisine = '', query = 'restaurants' } = req.body;
    const searchQuery = `${cuisine} ${query} near ${location} reviews ratings`;
    
    if (!process.env.BRAVE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'BRAVE_API_KEY not configured',
        ttsResponse: 'The Brave API key is not configured for restaurant search.'
      });
    }
    
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: searchQuery,
        count: 8,
        location: location
      },
      timeout: 10000
    });

    const results = response.data.web?.results || [];
    const restaurants = results.filter(r => 
      r.title.toLowerCase().includes('restaurant') || 
      r.description.toLowerCase().includes('restaurant') ||
      r.description.toLowerCase().includes('dining')
    ).slice(0, 5);

    let ttsResponse = '';
    if (restaurants.length > 0) {
      ttsResponse = `I found ${restaurants.length} great ${cuisine} restaurant options near ${location}. `;
      restaurants.forEach((restaurant, index) => {
        ttsResponse += `${index + 1}. ${restaurant.title}. ${restaurant.description}. `;
      });
    } else {
      ttsResponse = `I couldn't find specific restaurant information for ${cuisine} cuisine near ${location}. You might want to try a broader search.`;
    }

    res.json({
      success: true,
      query: searchQuery,
      results: restaurants,
      ttsResponse
    });

  } catch (error) {
    console.error('❌ Restaurant Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Restaurant search failed',
      ttsResponse: `I encountered an error while searching for restaurants near ${req.body.location}. ${error.message}.`
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ElevenLabs Voice Search Tool server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔑 API Keys configured: Brave=${!!process.env.BRAVE_API_KEY}, Exa=${!!process.env.EXA_API_KEY}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ CORS configured for origins: http://localhost:5173, http://localhost:5174`);
});
