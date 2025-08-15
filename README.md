# ElevenLabs Voice Search Tool

A **voice-optimized backend API** designed specifically for ElevenLabs voice agents to provide real-time web search capabilities through natural language voice interactions.

## 🎤 **Voice-First Design**

This tool is **NOT a traditional web application**. It's a specialized backend service built for **voice-only interactions** with ElevenLabs voice agents and LLMs.

### Key Characteristics:
- **Input**: Natural language voice queries (transcribed to text)
- **Output**: TTS-optimized responses for voice synthesis
- **No GUI**: The frontend is only for testing the backend APIs
- **Voice Agent Integration**: Designed for ElevenLabs voice agents to call as a tool

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- Brave Search API key ([Get one here](https://api.search.brave.com/))
- Exa.ai API key ([Get one here](https://exa.ai/)) - Optional but recommended

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd elevenlabs-voice-search-tool
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
BRAVE_API_KEY=your_brave_api_key_here
EXA_API_KEY=your_exa_api_key_here
PORT=3000
```

4. **Start the backend server**
```bash
npm start
```

5. **Test the frontend (optional)**
```bash
npm run dev
```

The backend API will be available at `http://localhost:3000`
The test frontend will be available at `http://localhost:5173`

## 🛠️ **ElevenLabs Tool Integration**

### Ready-to-Use Tool Definitions

The `/elevenlabs-tools/` directory contains pre-configured JSON tool definitions for ElevenLabs:

- **`web-search-brave.json`** - General web search and news
- **`ai-search-exa.json`** - Advanced AI-powered semantic search  
- **`restaurant-search.json`** - Local restaurant and dining search
- **`crypto-search.json`** - Cryptocurrency prices and market data

### Quick Setup:

1. **Update server URL** in each JSON file:
```json
"url": "https://your-domain.com/api/search/brave"
```

2. **Import to ElevenLabs**:
   - Copy the JSON content
   - Add new webhook tool in ElevenLabs
   - Paste configuration
   - Save and test

3. **Tool Selection Guide**:
   - **Brave Search**: General queries, news, location-based searches
   - **Exa AI**: Complex research, technical topics, semantic search
   - **Restaurant Search**: Dining recommendations, "restaurants near me"
   - **Crypto Search**: Cryptocurrency prices and market data

## 🎯 **API Endpoints**

### Core Search Endpoints

#### **Brave Search** (Recommended for most queries)
```http
POST /api/search/brave
Content-Type: application/json

{
  "query": "Italian restaurants near me",
  "type": "web",
  "location": "Chicago" // Optional - can be extracted from query
}
```

#### **Exa AI Search** (Best for complex/semantic queries)
```http
POST /api/search/exa
Content-Type: application/json

{
  "query": "latest developments in artificial intelligence",
  "type": "neural",
  "location": "San Francisco" // Optional
}
```

#### **Specialized Endpoints**

**Cryptocurrency Search:**
```http
POST /api/search/crypto
{
  "symbol": "BTC"
}
```

**Restaurant Search:**
```http
POST /api/search/restaurants
{
  "location": "New York",
  "cuisine": "Italian", // Optional
  "query": "best pizza places"
}
```

### Response Format

All endpoints return a consistent format optimized for voice agents:

```json
{
  "success": true,
  "query": "Italian restaurants in Chicago",
  "originalQuery": "Italian restaurants near me",
  "results": [
    {
      "title": "Mario's Italian Restaurant",
      "snippet": "Authentic Italian cuisine in downtown Chicago...",
      "url": "https://example.com"
    }
  ],
  "ttsResponse": "I found 3 Italian restaurant recommendations in Chicago. 1. Mario's Italian Restaurant. Authentic Italian cuisine in downtown Chicago with fresh pasta and wood-fired pizza...",
  "location": "Chicago",
  "extractedLocation": {
    "location": "Chicago",
    "isNearMe": false,
    "originalQuery": "Italian restaurants near me"
  }
}
```

## 🧠 **Voice-Optimized Features**

### **Natural Language Location Extraction**

The API automatically extracts location information from natural voice queries:

- **"Near me" patterns**: "pizza places near me", "restaurants close to me"
- **"In [location]" patterns**: "hotels in San Francisco", "events in downtown"
- **City/State recognition**: Recognizes 200+ US cities and all states
- **Contextual patterns**: "Chicago area restaurants", "around Times Square"

### **"Near Me" Handling**

When users say "near me" without providing location context:

```json
{
  "success": true,
  "needsLocation": true,
  "ttsResponse": "I heard you say 'near me' but I need to know your location first. Could you please tell me what city or area you're in?",
  "extractedLocation": {
    "isNearMe": true,
    "originalQuery": "restaurants near me"
  }
}
```

### **TTS-Optimized Responses**

All responses include a `ttsResponse` field that is:
- ✅ Cleaned of HTML tags and special characters
- ✅ Optimized for natural speech synthesis
- ✅ Includes context and location information
- ✅ Structured for easy voice delivery
- ✅ Handles errors gracefully with helpful voice messages

## 🎤 **Voice Agent Examples**

### Example Voice Interactions

**User**: *"What's the current price of Bitcoin?"*
**Agent calls**: `crypto_search` tool with `{"symbol": "Bitcoin"}`
**Agent speaks**: *"Here's the latest information on Bitcoin: Bitcoin is currently trading at $43,250, up 2.3% in the last 24 hours..."*

**User**: *"Find me some good sushi restaurants in Seattle"*
**Agent calls**: `restaurant_search` tool with `{"location": "Seattle", "cuisine": "sushi"}`
**Agent speaks**: *"I found 4 sushi restaurant recommendations in Seattle. 1. Shiro's Sushi. Award-winning omakase experience..."*

**User**: *"What's happening in tech news today?"*
**Agent calls**: `web_search_brave` tool with `{"query": "tech news today", "type": "news"}`
**Agent speaks**: *"Here are the latest tech news stories. 1. Apple announces new AI features..."*

## 🔧 **Configuration**

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BRAVE_API_KEY` | Yes | Your Brave Search API key |
| `EXA_API_KEY` | No | Your Exa.ai API key (recommended) |
| `PORT` | No | Server port (default: 3000) |

### Search Types

| Type | Description | Best For |
|------|-------------|----------|
| `web` | General web search | Most queries |
| `news` | Recent news and events | Current events, sports scores |
| `restaurants` | Local dining search | Food and restaurant queries |
| `crypto` | Cryptocurrency prices | Crypto market data |

## 🚨 **Important Notes**

### **This is NOT a Web App**
- The frontend (`npm run dev`) is **only for testing**
- Production use should **only use the backend API**
- Designed for **voice agents**, not human web browsing

### **Voice-Only Considerations**
- No geolocation API access (voice agents can't access browser location)
- Location must be extracted from speech or provided by the agent
- All responses optimized for text-to-speech synthesis
- Error messages designed for voice delivery

### **API Limitations**
- Brave Search: 2,000 queries/month (free tier)
- Exa.ai: Check their pricing for limits
- Rate limiting implemented to prevent abuse

## 🛠️ **Development**

### Project Structure
```
├── server/
│   └── index.js          # Main backend server
├── src/                  # Frontend (testing only)
│   ├── components/       # React components for testing
│   └── utils/api.ts      # API client utilities
├── elevenlabs-tools/     # ElevenLabs tool definitions
│   ├── web-search-brave.json
│   ├── ai-search-exa.json
│   ├── restaurant-search.json
│   ├── crypto-search.json
│   └── README.md
├── package.json
└── README.md
```

### Testing the API

1. **Start the backend**: `npm start`
2. **Test with curl**:
```bash
curl -X POST http://localhost:3000/api/search/brave \
  -H "Content-Type: application/json" \
  -d '{"query": "best pizza in New York", "type": "web"}'
```

3. **Use the test frontend**: `npm run dev` and visit `http://localhost:5173`

### Health Check
```bash
curl http://localhost:3000/health
```

## 📝 **License**

MIT License - see LICENSE file for details.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes (focus on voice optimization)
4. Test with voice agent scenarios
5. Submit a pull request

## 📞 **Support**

For issues related to:
- **Voice agent integration**: Check the `/elevenlabs-tools/` directory for tool definitions
- **API errors**: Verify your API keys and check the logs
- **Location extraction**: Test with the provided frontend
- **TTS optimization**: Ensure responses sound natural when spoken

---

**Remember**: This tool is designed for **voice agents**, not traditional web applications. The frontend is purely for testing the backend APIs that your ElevenLabs voice agents will call.
