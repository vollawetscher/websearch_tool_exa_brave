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

// Enhanced CORS configuration
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
  optionsSuccessStatus: 200
}));

app.options('*', cors());
app.use(express.json());

// Helper function to clean text for TTS
function cleanTextForTTS(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[•·]/g, '')
    .replace(/\bw\//g, 'with ')
    .replace(/\b&\b/g, 'and ')
    .replace(/\bvs\b/g, 'versus ')
    .replace(/\be\.g\./g, 'for example')
    .replace(/\bi\.e\./g, 'that is')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/\.\.\./g, '.')
    .replace(/--/g, ' - ')
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    .trim()
    .replace(/([a-zA-Z])$/, '$1.');
}

// INTELLIGENT QUERY ANALYSIS: Detect search intent and parameters from natural language
function analyzeSearchQuery(query) {
  const queryLower = query.toLowerCase();
  
  // Cryptocurrency detection - simplified and efficient
  const cryptoKeywords = [
    'bitcoin', 'btc', 'ethereum', 'eth', 'dogecoin', 'doge', 'cardano', 'ada',
    'solana', 'sol', 'polkadot', 'dot', 'chainlink', 'link', 'litecoin', 'ltc',
    'ripple', 'xrp', 'avalanche', 'avax', 'polygon', 'matic', 'shiba', 'shib',
    'crypto', 'cryptocurrency', 'coin', 'token', 'price', 'market cap', 'trading'
  ];
  
  const isCrypto = cryptoKeywords.some(keyword => queryLower.includes(keyword));
  
  // Restaurant detection - simplified
  const restaurantKeywords = [
    'restaurant', 'food', 'dining', 'eat', 'pizza', 'burger', 'sushi', 'italian',
    'chinese', 'mexican', 'thai', 'indian', 'cafe', 'coffee', 'breakfast', 'lunch',
    'dinner', 'takeout', 'delivery', 'bistro', 'bar', 'grill', 'kitchen'
  ];
  
  const isRestaurant = restaurantKeywords.some(keyword => queryLower.includes(keyword)) ||
                     /\b(near me|nearby|close|around)\b.*\b(food|eat|restaurant|dining)\b/i.test(queryLower) ||
                     /\b(food|eat|restaurant|dining)\b.*\b(near me|nearby|close|around)\b/i.test(queryLower);
  
  // News detection - simplified
  const newsKeywords = [
    'news', 'breaking', 'latest', 'today', 'yesterday', 'current events', 'headlines',
    'updates', 'reports', 'story', 'article', 'politics', 'election', 'government',
    'what happened', 'what\'s happening', 'tell me about', 'update on'
  ];
  
  const isNews = newsKeywords.some(keyword => queryLower.includes(keyword));
  
  // Location extraction - simplified patterns
  const locationPatterns = [
    { pattern: /\b(near me|close to me|around me|nearby)\b/i, isNearMe: true },
    { pattern: /\bin\s+([a-zA-Z\s,]+?)(?:\s+(?:please|thanks|thank you)|$)/i, location: 1 },
    { pattern: /\b(?:around|near)\s+([a-zA-Z\s,]+?)(?:\s+(?:please|thanks|thank you)|$)/i, location: 1 },
    { pattern: /\b([a-zA-Z\s,]+?)\s+area\b/i, location: 1 }
  ];
  
  // Major US cities - simplified list
  const majorCities = [
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
    'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis',
    'seattle', 'denver', 'washington', 'boston', 'el paso', 'detroit', 'nashville',
    'portland', 'memphis', 'oklahoma city', 'las vegas', 'louisville', 'baltimore',
    'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'mesa',
    'kansas city', 'atlanta', 'long beach', 'colorado springs', 'raleigh', 'miami',
    'virginia beach', 'omaha', 'oakland', 'minneapolis', 'tulsa', 'cleveland',
    'wichita', 'arlington', 'new orleans', 'bakersfield', 'tampa', 'honolulu',
    'aurora', 'anaheim', 'santa ana', 'st louis', 'riverside', 'corpus christi',
    'lexington', 'pittsburgh', 'anchorage', 'stockton', 'cincinnati', 'saint paul',
    'toledo', 'newark', 'greensboro', 'plano', 'henderson', 'lincoln', 'buffalo',
    'jersey city', 'chula vista', 'fort wayne', 'orlando', 'st petersburg',
    'chandler', 'laredo', 'norfolk', 'durham', 'madison', 'lubbock', 'irvine',
    'winston salem', 'glendale', 'garland', 'hialeah', 'reno', 'chesapeake',
    'gilbert', 'baton rouge', 'irving', 'scottsdale', 'north las vegas', 'fremont',
    'boise', 'richmond', 'san bernardino', 'birmingham', 'spokane', 'rochester',
    'des moines', 'modesto', 'fayetteville', 'tacoma', 'oxnard', 'fontana',
    'montgomery', 'moreno valley', 'shreveport', 'yonkers', 'akron', 'huntington beach',
    'little rock', 'augusta', 'amarillo', 'mobile', 'grand rapids', 'salt lake city',
    'tallahassee', 'huntsville', 'grand prairie', 'knoxville', 'worcester'
  ];
  
  // US states - simplified
  const states = [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
    'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
    'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
    'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada',
    'new hampshire', 'new jersey', 'new mexico', 'new york', 'north carolina',
    'north dakota', 'ohio', 'oklahoma', 'oregon', 'pennsylvania', 'rhode island',
    'south carolina', 'south dakota', 'tennessee', 'texas', 'utah', 'vermont',
    'virginia', 'washington', 'west virginia', 'wisconsin', 'wyoming'
  ];
  
  let extractedLocation = { location: null, isNearMe: false, originalQuery: query };
  
  // Check for "near me" patterns
  for (const { pattern, isNearMe, location } of locationPatterns) {
    const match = queryLower.match(pattern);
    if (match) {
      if (isNearMe) {
        extractedLocation = { location: null, isNearMe: true, originalQuery: query };
        break;
      } else if (location && match[location]) {
        const locationText = match[location].trim();
        const cleanLocation = locationText
          .replace(/\b(restaurants?|food|dining|eat|pizza|burger|coffee|cafe)\b/gi, '')
          .trim();
        
        if (cleanLocation.length > 2) {
          extractedLocation = { location: cleanLocation, isNearMe: false, originalQuery: query };
          break;
        }
      }
    }
  }
  
  // Check for major cities and states
  if (!extractedLocation.location && !extractedLocation.isNearMe) {
    for (const city of majorCities) {
      if (queryLower.includes(city)) {
        extractedLocation = { location: city, isNearMe: false, originalQuery: query };
        break;
      }
    }
    
    if (!extractedLocation.location) {
      for (const state of states) {
        if (queryLower.includes(state)) {
          extractedLocation = { location: state, isNearMe: false, originalQuery: query };
          break;
        }
      }
    }
  }
  
  // Determine search strategy
  let searchStrategy = 'web';
  let searchEngine = 'brave';
  
  if (isCrypto) {
    searchStrategy = 'crypto';
  } else if (isRestaurant) {
    searchStrategy = 'restaurants';
  } else if (isNews) {
    searchStrategy = 'news';
  } else {
    // For complex queries, use Exa AI
    const complexKeywords = [
      'how does', 'how do', 'explain', 'what is', 'what are', 'why', 'research',
      'analysis', 'study', 'academic', 'scientific', 'technical', 'detailed',
      'comprehensive', 'compare', 'comparison', 'versus', 'vs', 'difference between',
      'pros and cons', 'advantages', 'disadvantages', 'benefits', 'drawbacks',
      'theory', 'concept', 'principle', 'mechanism', 'process', 'method', 'approach'
    ];
    
    const isComplex = complexKeywords.some(keyword => queryLower.includes(keyword));
    
    if (isComplex) {
      searchEngine = 'exa';
    }
  }
  
  return {
    searchStrategy,
    searchEngine,
    extractedLocation,
    isCrypto,
    isRestaurant,
    isNews,
    isComplex: searchEngine === 'exa'
  };
}

// Helper function to check if a result is a listing/directory page
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

// Helper function to extract actual restaurant names and info
function extractRestaurantInfo(results) {
  const restaurants = [];
  
  for (const result of results) {
    const title = result.title || '';
    const description = result.description || '';
    const url = result.url || '';
    
    if (isListingPage(title, description, url)) {
      continue;
    }
    
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    const restaurantIndicators = [
      'restaurant', 'bistro', 'cafe', 'taverna', 'trattoria', 'pizzeria',
      'steakhouse', 'grill', 'bar', 'kitchen', 'house', 'place'
    ];
    
    const hasRestaurantIndicator = restaurantIndicators.some(indicator => 
      titleLower.includes(indicator) || descLower.includes(indicator)
    );
    
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

// UNIVERSAL SEARCH ENDPOINT: Intelligently routes to appropriate search strategy
app.post('/api/search/brave', async (req, res) => {
  console.log('🔍 Universal Search Request:', req.body);
  console.log('🌐 Request Origin:', req.get('Origin'));
  
  try {
    const { query } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
        ttsResponse: 'Please provide a search query.'
      });
    }
    
    // INTELLIGENT ANALYSIS: Determine search strategy and parameters
    const analysis = analyzeSearchQuery(query);
    console.log('🧠 Query Analysis:', analysis);
    
    // Handle "near me" queries
    if (analysis.extractedLocation.isNearMe) {
      return res.json({
        success: true,
        query: query,
        results: [],
        ttsResponse: 'I heard you say "near me" but I need to know your location first. Could you please tell me what city or area you\'re in?',
        needsLocation: true,
        extractedLocation: analysis.extractedLocation,
        analysis: analysis
      });
    }
    
    // Route to appropriate search strategy
    let searchResult;
    
    if (analysis.isCrypto) {
      // Extract crypto symbol from query
      const cryptoSymbols = ['bitcoin', 'btc', 'ethereum', 'eth', 'dogecoin', 'doge', 'cardano', 'ada', 'solana', 'sol'];
      const foundSymbol = cryptoSymbols.find(symbol => query.toLowerCase().includes(symbol));
      const symbol = foundSymbol || query.split(' ')[0];
      searchResult = await performCryptoSearch(symbol);
    } else if (analysis.isRestaurant) {
      searchResult = await performRestaurantSearch(query, analysis.extractedLocation.location);
    } else if (analysis.searchEngine === 'exa') {
      searchResult = await performExaSearch(query, analysis.extractedLocation.location);
    } else {
      searchResult = await performBraveSearch(query, analysis.searchStrategy, analysis.extractedLocation.location);
    }
    
    // Add analysis metadata to response
    searchResult.analysis = analysis;
    searchResult.originalQuery = query;
    
    console.log('📤 Sending universal search response:', { 
      ...searchResult, 
      results: `${searchResult.results?.length || 0} results`,
      strategy: analysis.searchStrategy,
      engine: analysis.searchEngine
    });
    
    res.json(searchResult);
    
  } catch (error) {
    console.error('❌ Universal Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      ttsResponse: `I encountered an error while searching. ${error.message}. Please try again.`
    });
  }
});

// Helper function to perform Brave search
async function performBraveSearch(query, searchType = 'web', location = null) {
  if (!process.env.BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY not configured');
  }
  
  // Build location-aware query
  const locationAwareQuery = location ? `${query} ${location}` : query;
  
  const params = {
    q: locationAwareQuery,
    count: 10,
    search_lang: 'en',
    country: 'US',
    safesearch: 'moderate',
    freshness: searchType === 'news' ? 'pd' : undefined,
    result_filter: searchType === 'news' ? 'news' : undefined
  };

  if (location) {
    params.location = location;
  }

  const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
    headers: {
      'X-Subscription-Token': process.env.BRAVE_API_KEY,
      'Accept': 'application/json'
    },
    params,
    timeout: 10000
  });

  const results = response.data.web?.results || [];
  const formattedResults = results.slice(0, 5).map(result => ({
    title: cleanTextForTTS(result.title),
    snippet: cleanTextForTTS(result.description),
    url: result.url,
    published: result.age
  }));

  let ttsResponse = '';
  if (formattedResults.length > 0) {
    const locationText = location ? ` in ${location}` : '';
    ttsResponse = `I found ${formattedResults.length} relevant results for "${query}"${locationText}. `;
    formattedResults.forEach((result, index) => {
      ttsResponse += `${index + 1}. ${result.title}. ${result.snippet}. `;
    });
  } else {
    const locationText = location ? ` in ${location}` : '';
    ttsResponse = `I couldn't find any results for "${query}"${locationText}. You might want to try a different search term.`;
  }

  return {
    success: true,
    query: locationAwareQuery,
    results: formattedResults,
    ttsResponse: cleanTextForTTS(ttsResponse),
    totalResults: response.data.web?.totalResults || 0,
    location: location || null,
    searchEngine: 'brave',
    searchType: searchType
  };
}

// Helper function to perform Exa search
async function performExaSearch(query, location = null) {
  if (!process.env.EXA_API_KEY) {
    throw new Error('EXA_API_KEY not configured');
  }
  
  const locationAwareQuery = location ? `${query} in ${location}` : query;
  
  const searchData = {
    query: locationAwareQuery,
    numResults: 10,
    contents: {
      text: true,
      highlights: true,
      summary: true
    },
    useAutoprompt: true,
    type: 'neural'
  };

  const response = await axios.post('https://api.exa.ai/search', searchData, {
    headers: {
      'x-api-key': process.env.EXA_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 15000
  });

  const results = response.data.results || [];
  const formattedResults = results.slice(0, 5).map(result => ({
    title: cleanTextForTTS(result.title || 'Untitled'),
    snippet: cleanTextForTTS(result.summary || result.text?.substring(0, 200) + '...' || 'No description available'),
    url: result.url,
    score: result.score,
    publishedDate: result.publishedDate
  }));

  let ttsResponse = '';
  if (formattedResults.length > 0) {
    const locationText = location ? ` in ${location}` : '';
    ttsResponse = `Using advanced AI search, I found ${formattedResults.length} highly relevant results for "${query}"${locationText}. `;
    formattedResults.forEach((result, index) => {
      ttsResponse += `${index + 1}. ${result.title}. ${result.snippet}. `;
    });
  } else {
    const locationText = location ? ` in ${location}` : '';
    ttsResponse = `I couldn't find any results for "${query}"${locationText} using AI search. You might want to try a different approach.`;
  }

  return {
    success: true,
    query: locationAwareQuery,
    results: formattedResults,
    ttsResponse: cleanTextForTTS(ttsResponse),
    totalResults: results.length,
    location: location || null,
    searchEngine: 'exa',
    searchType: 'neural'
  };
}

// Helper function to perform crypto search
async function performCryptoSearch(symbol) {
  if (!process.env.BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY not configured');
  }
  
  const query = `${symbol} cryptocurrency price current market cap`;
  
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
    ttsResponse = `Here's the latest information on ${symbol}: ${cleanTextForTTS(cryptoInfo.description)}`;
  } else if (results.length > 0) {
    ttsResponse = `I found some information about ${symbol}: ${cleanTextForTTS(results[0].description)}`;
  } else {
    ttsResponse = `I couldn't find current price information for ${symbol}. The cryptocurrency market data might be temporarily unavailable.`;
  }

  return {
    success: true,
    query: `${symbol} crypto price`,
    results: results.slice(0, 3).map(result => ({
      title: cleanTextForTTS(result.title),
      snippet: cleanTextForTTS(result.description),
      url: result.url
    })),
    ttsResponse: cleanTextForTTS(ttsResponse),
    searchEngine: 'brave',
    searchType: 'crypto',
    symbol: symbol
  };
}

// Helper function to perform restaurant search
async function performRestaurantSearch(query, location) {
  if (!process.env.BRAVE_API_KEY) {
    throw new Error('BRAVE_API_KEY not configured');
  }
  
  if (!location) {
    return {
      success: false,
      error: 'Location required for restaurant search',
      ttsResponse: 'I need to know your location to find restaurants. Could you please tell me what city or area you\'re looking for restaurants in?'
    };
  }
  
  // Extract cuisine from query
  const cuisine = query.replace(/restaurant|food|dining|eat|near me|in|around/gi, '').trim();
  
  const searchStrategies = [
    `"${cuisine}" restaurant "${location}" menu address phone hours`,
    `${cuisine} restaurant ${location} -tripadvisor -yelp -opentable -"best restaurants"`,
    `${cuisine} ${location} restaurant review menu -"top 10" -directory`,
    `restaurants in ${location} ${cuisine} local dining`
  ];
  
  let allResults = [];
  let bestResults = [];
  
  for (let i = 0; i < searchStrategies.length && bestResults.length < 5; i++) {
    const searchQuery = searchStrategies[i];
    
    try {
      const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
        headers: {
          'X-Subscription-Token': process.env.BRAVE_API_KEY,
          'Accept': 'application/json'
        },
        params: {
          q: searchQuery,
          count: 10,
          location: location,
          country: 'US'
        },
        timeout: 10000
      });

      const results = response.data.web?.results || [];
      allResults = allResults.concat(results);
      
      const restaurants = extractRestaurantInfo(results);
      bestResults = bestResults.concat(restaurants);
      
    } catch (error) {
      console.log(`⚠️ Restaurant strategy ${i + 1} failed:`, error.message);
      continue;
    }
  }
  
  // Remove duplicates
  const uniqueRestaurants = [];
  const seenTitles = new Set();
  
  for (const restaurant of bestResults) {
    const titleKey = restaurant.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!seenTitles.has(titleKey) && uniqueRestaurants.length < 5) {
      seenTitles.add(titleKey);
      uniqueRestaurants.push(restaurant);
    }
  }
  
  let ttsResponse = '';
  if (uniqueRestaurants.length > 0) {
    const cuisineText = cuisine ? `${cuisine} ` : '';
    ttsResponse = `I found ${uniqueRestaurants.length} ${cuisineText}restaurant recommendations in ${location}. `;
    
    uniqueRestaurants.forEach((restaurant, index) => {
      let restaurantName = restaurant.title;
      restaurantName = restaurantName.replace(/ - Restaurant.*$/i, '');
      restaurantName = restaurantName.replace(/ Restaurant.*$/i, '');
      restaurantName = restaurantName.replace(/ \| .*$/i, '');
      
      ttsResponse += `${index + 1}. ${restaurantName}. ${restaurant.snippet}. `;
    });
  } else {
    const cuisineText = cuisine ? `${cuisine} ` : '';
    ttsResponse = `I couldn't find specific ${cuisineText}restaurant recommendations in ${location} right now. You might want to try asking for a different type of cuisine or a nearby city.`;
  }

  return {
    success: true,
    query: `${cuisine} restaurants in ${location}`,
    results: uniqueRestaurants.slice(0, 5),
    ttsResponse: cleanTextForTTS(ttsResponse),
    location: location,
    searchEngine: 'brave',
    searchType: 'restaurants',
    cuisine: cuisine
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ElevenLabs Voice Search Tool API is running',
    timestamp: new Date().toISOString(),
    voiceOptimized: true,
    intelligentRouting: 'Natural Language Processing enabled',
    searchStrategies: ['crypto', 'restaurants', 'news', 'web', 'exa-ai'],
    locationExtraction: 'Automatic from natural language',
    cors: {
      allowedOrigins: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']
    },
    env: {
      braveApiKey: !!process.env.BRAVE_API_KEY,
      exaApiKey: !!process.env.EXA_API_KEY,
      braveKeyPreview: process.env.BRAVE_API_KEY ? process.env.BRAVE_API_KEY.substring(0, 10) + '...' : 'NOT SET',
      exaKeyPreview: process.env.EXA_API_KEY ? process.env.EXA_API_KEY.substring(0, 10) + '...' : 'NOT SET'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API connection successful!',
    timestamp: new Date().toISOString(),
    voiceOptimized: 'Ready for ElevenLabs voice agents',
    intelligentRouting: 'Single endpoint with automatic strategy detection'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 ElevenLabs Voice Search Tool server running on port ${PORT}`);
  console.log(`📡 Universal search endpoint: http://localhost:${PORT}/api/search/brave`);
  console.log(`🔑 API Keys configured: Brave=${!!process.env.BRAVE_API_KEY}, Exa=${!!process.env.EXA_API_KEY}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ CORS configured for origins: http://localhost:5173, http://localhost:5174`);
  console.log(`🎤 VOICE-OPTIMIZED: Single endpoint with intelligent query analysis`);
  console.log(`🧠 INTELLIGENT ROUTING: Crypto, Restaurant, News, Web, and AI search detection`);
  console.log(`📍 LOCATION EXTRACTION: Natural language processing for location context`);
  console.log(`🎯 TOKEN EFFICIENT: One tool definition for all search types`);
});
