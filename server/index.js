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

// ADDED: Helper function to clean text for TTS
function cleanTextForTTS(text) {
  if (!text) return '';
  
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove extra whitespace and normalize spaces
    .replace(/\s+/g, ' ')
    // Remove special characters that don't sound good in TTS
    .replace(/[•·]/g, '')
    // Replace common abbreviations with full words
    .replace(/\bw\//g, 'with ')
    .replace(/\b&\b/g, 'and ')
    .replace(/\bvs\b/g, 'versus ')
    .replace(/\be\.g\./g, 'for example')
    .replace(/\bi\.e\./g, 'that is')
    // Remove URLs (they sound terrible in TTS)
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove email addresses
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    // Clean up punctuation for better speech flow
    .replace(/\.\.\./g, '.')
    .replace(/--/g, ' - ')
    // Remove excessive punctuation
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    // Trim and clean up
    .trim()
    // Ensure sentences end properly
    .replace(/([a-zA-Z])$/, '$1.');
}

// ADDED: Helper function to check if a result is a listing/directory page
function isListingPage(title, description, url) {
  const listingKeywords = [
    'best restaurants', 'top restaurants', 'tripadvisor', 'yelp', 'opentable',
    'restaurant guide', 'dining guide', 'restaurant list', 'find restaurants',
    'restaurant directory', 'restaurant reviews', 'book a table', 'reservation',
    'restaurants in', 'updated 2024', 'updated 2025'
  ];
  
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  const urlLower = url.toLowerCase();
  
  return listingKeywords.some(keyword => 
    titleLower.includes(keyword) || 
    descLower.includes(keyword) ||
    urlLower.includes('tripadvisor') ||
    urlLower.includes('yelp') ||
    urlLower.includes('opentable')
  );
}

// ADDED: Helper function to extract actual restaurant names and info
function extractRestaurantInfo(results) {
  const restaurants = [];
  
  for (const result of results) {
    const title = result.title || '';
    const description = result.description || '';
    const url = result.url || '';
    
    // Skip obvious listing pages
    if (isListingPage(title, description, url)) {
      continue;
    }
    
    // Look for actual restaurant names and information
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Check if this looks like an actual restaurant
    const restaurantIndicators = [
      'restaurant', 'bistro', 'cafe', 'taverna', 'trattoria', 'pizzeria',
      'steakhouse', 'grill', 'bar', 'kitchen', 'house', 'place'
    ];
    
    const hasRestaurantIndicator = restaurantIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );
    
    // Check for menu, location, or contact info (signs of actual restaurant)
    const hasRestaurantInfo = descLower.includes('menu') || 
                             descLower.includes('address') || 
                             descLower.includes('phone') ||
                             descLower.includes('hours') ||
                             descLower.includes('cuisine') ||
                             descLower.includes('dishes') ||
                             descLower.includes('food');
    
    if (hasRestaurantIndicator || hasRestaurantInfo) {
      restaurants.push({
        title: cleanTextForTTS(title),
        snippet: cleanTextForTTS(description),
        url: url,
        isActualRestaurant: true
      });
    }
  }
  
  return restaurants;
}

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
      title: cleanTextForTTS(result.title),
      snippet: cleanTextForTTS(result.description),
      url: result.url,
      published: result.age
    }));

    // Create TTS-friendly summary
    let ttsResponse = '';
    if (formattedResults.length > 0) {
      ttsResponse = `I found ${formattedResults.length} relevant results for "${query}". `;
      formattedResults.forEach((result, index) => {
        const cleanTitle = cleanTextForTTS(result.title);
        const cleanSnippet = cleanTextForTTS(result.snippet);
        ttsResponse += `${index + 1}. ${cleanTitle}. ${cleanSnippet}. `;
      });
    } else {
      ttsResponse = `I couldn't find any results for "${query}". You might want to try a different search term.`;
    }

    // Final cleanup of the entire TTS response
    ttsResponse = cleanTextForTTS(ttsResponse);

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

// FIXED: Exa.ai Search API endpoint with correct request format
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
    
    // FIXED: Correct Exa API request format
    const searchData = {
      query: query,
      numResults: Math.min(numResults, 10), // Exa has limits
      contents: {
        text: true,
        highlights: true,
        summary: true
      },
      useAutoprompt: true, // Let Exa optimize the query
      type: type === 'neural' ? 'neural' : 'keyword'
    };

    // Only add includeDomains if provided and is an array
    if (includeDomains && Array.isArray(includeDomains) && includeDomains.length > 0) {
      searchData.includeDomains = includeDomains;
    }

    console.log('📡 Making request to Exa API with data:', JSON.stringify(searchData, null, 2));
    console.log('🔑 Using API key:', process.env.EXA_API_KEY ? `${process.env.EXA_API_KEY.substring(0, 10)}...` : 'NOT SET');

    const response = await axios.post('https://api.exa.ai/search', searchData, {
      headers: {
        'x-api-key': process.env.EXA_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000 // 15 second timeout for AI search
    });

    console.log('✅ Exa API Response Status:', response.status);
    console.log('📊 Exa API Response Data Keys:', Object.keys(response.data));

    const results = response.data.results || [];
    console.log(`📋 Found ${results.length} results from Exa`);

    const formattedResults = results.slice(0, 5).map(result => ({
      title: cleanTextForTTS(result.title || 'Untitled'),
      snippet: cleanTextForTTS(result.summary || result.text?.substring(0, 200) + '...' || result.highlights?.join(' ') || 'No description available'),
      url: result.url,
      score: result.score,
      publishedDate: result.publishedDate
    }));

    // Create TTS-friendly summary
    let ttsResponse = '';
    if (formattedResults.length > 0) {
      ttsResponse = `Using advanced AI search, I found ${formattedResults.length} highly relevant results for "${query}". `;
      formattedResults.forEach((result, index) => {
        const cleanTitle = cleanTextForTTS(result.title);
        const cleanSnippet = cleanTextForTTS(result.snippet);
        ttsResponse += `${index + 1}. ${cleanTitle}. ${cleanSnippet}. `;
      });
    } else {
      ttsResponse = `I couldn't find any results for "${query}" using AI search. You might want to try a different approach.`;
    }

    // Final cleanup of the entire TTS response
    ttsResponse = cleanTextForTTS(ttsResponse);

    const responseData = {
      success: true,
      query,
      results: formattedResults,
      ttsResponse,
      totalResults: results.length
    };

    console.log('📤 Sending Exa response:', { ...responseData, results: `${formattedResults.length} results` });

    res.json(responseData);

  } catch (error) {
    console.error('❌ Exa Search Error Details:');
    console.error('Error message:', error.message);
    console.error('Error response status:', error.response?.status);
    console.error('Error response data:', error.response?.data);
    console.error('Error response headers:', error.response?.headers);
    
    // More specific error handling for Exa API
    let errorMessage = 'AI search failed';
    let ttsMessage = `I encountered an error while performing AI search with Exa. ${error.message}. Please try again.`;
    
    if (error.response?.status === 400) {
      errorMessage = 'Invalid request to Exa API';
      ttsMessage = 'The AI search request was invalid. This might be due to API key issues or request format problems.';
    } else if (error.response?.status === 401) {
      errorMessage = 'Exa API authentication failed';
      ttsMessage = 'The Exa API key is invalid or expired. Please check your API key configuration.';
    } else if (error.response?.status === 429) {
      errorMessage = 'Exa API rate limit exceeded';
      ttsMessage = 'The AI search service is currently rate limited. Please try again in a moment.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      ttsResponse: ttsMessage,
      debug: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      }
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
      const cleanDescription = cleanTextForTTS(cryptoInfo.description);
      ttsResponse = `Here's the latest information on ${symbol}: ${cleanDescription}`;
    } else if (results.length > 0) {
      const cleanDescription = cleanTextForTTS(results[0].description);
      ttsResponse = `I found some information about ${symbol}: ${cleanDescription}`;
    } else {
      ttsResponse = `I couldn't find current price information for ${symbol}. The cryptocurrency market data might be temporarily unavailable.`;
    }

    // Clean the final TTS response
    ttsResponse = cleanTextForTTS(ttsResponse);

    res.json({
      success: true,
      query: `${symbol} crypto price`,
      results: results.slice(0, 3).map(result => ({
        ...result,
        title: cleanTextForTTS(result.title),
        description: cleanTextForTTS(result.description)
      })),
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

// IMPROVED: Restaurant search with better filtering and multiple search strategies
app.post('/api/search/restaurants', async (req, res) => {
  console.log('🍽️ Restaurant Search Request:', req.body);
  console.log('🌐 Request Origin:', req.get('Origin'));
  
  try {
    const { location, cuisine = '', query = 'restaurants' } = req.body;
    
    if (!process.env.BRAVE_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'BRAVE_API_KEY not configured',
        ttsResponse: 'The Brave API key is not configured for restaurant search.'
      });
    }
    
    // Try multiple search strategies to get actual restaurants
    const searchStrategies = [
      // Strategy 1: Specific restaurant names with cuisine and location
      `"${cuisine}" restaurant "${location}" menu address phone`,
      // Strategy 2: Local restaurant names
      `${cuisine} restaurant ${location} -tripadvisor -yelp -opentable -"best restaurants"`,
      // Strategy 3: Restaurant names with reviews but exclude listing sites
      `${cuisine} ${location} restaurant review -"top 10" -"best restaurants" -directory`
    ];
    
    let allResults = [];
    let bestResults = [];
    
    // Try each search strategy
    for (let i = 0; i < searchStrategies.length && bestResults.length < 5; i++) {
      const searchQuery = searchStrategies[i];
      console.log(`🔍 Trying search strategy ${i + 1}: ${searchQuery}`);
      
      try {
        const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
          headers: {
            'X-Subscription-Token': process.env.BRAVE_API_KEY,
            'Accept': 'application/json'
          },
          params: {
            q: searchQuery,
            count: 10,
            location: location
          },
          timeout: 10000
        });

        const results = response.data.web?.results || [];
        allResults = allResults.concat(results);
        
        // Extract actual restaurants from this batch
        const restaurants = extractRestaurantInfo(results);
        bestResults = bestResults.concat(restaurants);
        
        console.log(`📋 Strategy ${i + 1} found ${restaurants.length} actual restaurants`);
        
      } catch (error) {
        console.log(`⚠️ Strategy ${i + 1} failed:`, error.message);
        continue;
      }
    }
    
    // Remove duplicates based on title similarity
    const uniqueRestaurants = [];
    const seenTitles = new Set();
    
    for (const restaurant of bestResults) {
      const titleKey = restaurant.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!seenTitles.has(titleKey) && uniqueRestaurants.length < 5) {
        seenTitles.add(titleKey);
        uniqueRestaurants.push(restaurant);
      }
    }
    
    console.log(`🎯 Final result: ${uniqueRestaurants.length} unique restaurants found`);
    
    // Create TTS response
    let ttsResponse = '';
    if (uniqueRestaurants.length > 0) {
      const cuisineText = cuisine ? `${cuisine} ` : '';
      ttsResponse = `I found ${uniqueRestaurants.length} ${cuisineText}restaurant recommendations in ${location}. `;
      
      uniqueRestaurants.forEach((restaurant, index) => {
        // Extract just the restaurant name from the title (remove extra text)
        let restaurantName = restaurant.title;
        // Remove common suffixes that aren't part of the name
        restaurantName = restaurantName.replace(/ - Restaurant.*$/i, '');
        restaurantName = restaurantName.replace(/ Restaurant.*$/i, '');
        restaurantName = restaurantName.replace(/ \| .*$/i, '');
        
        ttsResponse += `${index + 1}. ${restaurantName}. ${restaurant.snippet}. `;
      });
    } else {
      // Fallback: provide general guidance
      const cuisineText = cuisine ? `${cuisine} ` : '';
      ttsResponse = `I couldn't find specific ${cuisineText}restaurant recommendations in ${location} right now. I suggest checking local dining guides or asking locals for their favorite ${cuisineText}restaurants in the area.`;
    }

    // Final cleanup of the entire TTS response
    ttsResponse = cleanTextForTTS(ttsResponse);

    res.json({
      success: true,
      query: `${cuisine} restaurants in ${location}`,
      results: uniqueRestaurants.slice(0, 5),
      ttsResponse,
      debug: {
        totalResultsFound: allResults.length,
        actualRestaurantsFound: bestResults.length,
        uniqueRestaurants: uniqueRestaurants.length
      }
    });

  } catch (error) {
    console.error('❌ Restaurant Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Restaurant search failed',
      ttsResponse: `I encountered an error while searching for restaurants in ${req.body.location}. ${error.message}.`
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
