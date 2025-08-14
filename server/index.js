import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Brave Search API endpoint
app.post('/api/search/brave', async (req, res) => {
  try {
    const { query, type = 'web', count = 10, location = null } = req.body;
    
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

    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params
    });

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

    res.json({
      success: true,
      query,
      results: formattedResults,
      ttsResponse,
      totalResults: response.data.web?.totalResults || 0
    });

  } catch (error) {
    console.error('Brave Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      ttsResponse: 'I encountered an error while searching. Please try again.'
    });
  }
});

// Exa.ai Search API endpoint
app.post('/api/search/exa', async (req, res) => {
  try {
    const { query, type = 'neural', numResults = 10, includeDomains = null } = req.body;
    
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

    const response = await axios.post('https://api.exa.ai/search', searchData, {
      headers: {
        'x-api-key': process.env.EXA_API_KEY,
        'Content-Type': 'application/json'
      }
    });

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

    res.json({
      success: true,
      query,
      results: formattedResults,
      ttsResponse,
      totalResults: results.length
    });

  } catch (error) {
    console.error('Exa Search Error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'AI search failed',
      ttsResponse: 'I encountered an error while performing AI search. Please try again.'
    });
  }
});

// Specialized search endpoints
app.post('/api/search/crypto', async (req, res) => {
  try {
    const { symbol } = req.body;
    const query = `${symbol} cryptocurrency price current market cap`;
    
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
      }
    });

    const results = response.data.web?.results || [];
    const cryptoInfo = results.find(r => 
      r.title.toLowerCase().includes(symbol.toLowerCase()) && 
      (r.title.toLowerCase().includes('price') || r.description.toLowerCase().includes('price'))
    );

    let ttsResponse = '';
    if (cryptoInfo) {
      ttsResponse = `Here's the latest information on ${symbol}: ${cryptoInfo.description}`;
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
    res.status(500).json({
      success: false,
      error: 'Crypto search failed',
      ttsResponse: 'I encountered an error while searching for cryptocurrency information.'
    });
  }
});

app.post('/api/search/restaurants', async (req, res) => {
  try {
    const { location, cuisine = '', query = 'restaurants' } = req.body;
    const searchQuery = `${cuisine} ${query} near ${location} reviews ratings`;
    
    const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY,
        'Accept': 'application/json'
      },
      params: {
        q: searchQuery,
        count: 8,
        location: location
      }
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
    res.status(500).json({
      success: false,
      error: 'Restaurant search failed',
      ttsResponse: 'I encountered an error while searching for restaurants.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ElevenLabs Voice Search Tool server running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});
