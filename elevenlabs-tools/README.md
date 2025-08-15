# ElevenLabs Universal Search Tool

This directory contains the **single, optimized tool definition** for integrating the Voice Search Tool with ElevenLabs voice agents.

## 🎯 **Single Universal Tool Approach**

Based on **token efficiency** and **prompting simplicity**, this tool uses **one endpoint** that intelligently routes queries to the appropriate search strategy.

### Why Single Tool?
- ✅ **Minimal token usage** - Only one tool definition sent to LLM
- ✅ **Simple prompting** - LLM doesn't need to choose between tools
- ✅ **Backend intelligence** - All complexity handled server-side
- ✅ **Natural language** - Just send the user's query as-is

## 🛠️ **The Universal Tool**

### **`universal-search.json`** - One Tool for Everything
- **Handles**: Web search, news, crypto, restaurants, AI search
- **Auto-detects**: Search intent from natural language
- **Extracts**: Location from "near me", "in Chicago", etc.
- **Routes**: To optimal search engine (Brave/Exa) automatically

## 📋 **Setup Instructions**

### 1. **Update Server URL**
Edit the `url` field in `universal-search.json`:
```json
"url": "https://your-domain.com/api/search/brave"
```

For local development:
```json
"url": "http://localhost:3000/api/search/brave"
```

### 2. **Import to ElevenLabs**
1. Copy the contents of `universal-search.json`
2. In ElevenLabs, add new webhook tool
3. Paste the JSON configuration
4. Save and test

### 3. **That's It!**
The backend handles everything else automatically.

## 🧠 **How It Works**

### **Intelligent Query Analysis**
The backend analyzes each query to determine:

1. **Search Type Detection**:
   - **Crypto**: "Bitcoin price", "ETH market cap"
   - **Restaurants**: "pizza near me", "Italian food in NYC"
   - **News**: "latest tech news", "what happened today"
   - **Complex/Research**: "how does AI work", "compare X vs Y"
   - **General**: Everything else

2. **Location Extraction**:
   - **"Near me"**: Asks user for location
   - **"In [city]"**: Extracts city name
   - **City names**: Recognizes 200+ US cities
   - **State names**: All US states and abbreviations

3. **Search Engine Selection**:
   - **Brave**: General queries, news, crypto, restaurants
   - **Exa AI**: Complex research, technical topics

### **Example Query Processing**

**User says**: *"Find Italian restaurants near me"*
**Backend detects**: 
- Type: `restaurants`
- Location: `near me` (asks for clarification)
- Engine: `brave`

**User says**: *"Bitcoin price today"*
**Backend detects**:
- Type: `crypto`
- Symbol: `Bitcoin`
- Engine: `brave`

**User says**: *"How does machine learning work?"*
**Backend detects**:
- Type: `complex/research`
- Engine: `exa` (AI search)

## 🎤 **Voice Agent Integration**

### **Simple Tool Usage**
```json
{
  "query": "{{user_input}}"
}
```

That's it! Just pass the user's natural language query directly.

### **Response Handling**
All responses include a `ttsResponse` field optimized for voice:

```json
{
  "success": true,
  "ttsResponse": "I found 3 Italian restaurants in Chicago. 1. Mario's Italian Restaurant. Authentic Italian cuisine with fresh pasta...",
  "results": [...],
  "analysis": {
    "searchStrategy": "restaurants",
    "searchEngine": "brave",
    "extractedLocation": {
      "location": "Chicago",
      "isNearMe": false
    }
  }
}
```

### **"Near Me" Handling**
When user says "near me":
```json
{
  "success": true,
  "needsLocation": true,
  "ttsResponse": "I heard you say 'near me' but I need to know your location first. Could you please tell me what city or area you're in?"
}
```

Your agent should then ask for location and make a follow-up call.

## 🔧 **Customization**

### **Timeout Settings**
```json
"response_timeout_secs": 20
```

### **Adding Authentication**
If you add auth to your server:
```json
"auth_connection": "your_auth_connection_id"
```

## 🚨 **Important Notes**

1. **Single Endpoint**: All queries go to `/api/search/brave`
2. **Backend Routes**: Server automatically chooses Brave vs Exa
3. **Token Efficient**: Only one tool definition in LLM context
4. **Voice Optimized**: All responses designed for TTS
5. **Location Smart**: Handles "near me" gracefully

## 📞 **Testing**

Test the universal endpoint:
```bash
curl -X POST http://localhost:3000/api/search/brave \
  -H "Content-Type: application/json" \
  -d '{"query": "Italian restaurants in Chicago"}'

curl -X POST http://localhost:3000/api/search/brave \
  -H "Content-Type: application/json" \
  -d '{"query": "Bitcoin price today"}'

curl -X POST http://localhost:3000/api/search/brave \
  -H "Content-Type: application/json" \
  -d '{"query": "how does blockchain work"}'
```

## 🎯 **Benefits of This Approach**

- **🪙 Token Efficient**: Single tool = fewer tokens per conversation
- **🧠 Simple Prompting**: LLM just sends user query, no decision making
- **⚡ Fast**: No tool selection overhead
- **🎤 Voice Optimized**: All responses perfect for TTS
- **📍 Location Smart**: Automatic location extraction and handling
- **🔄 Future Proof**: Easy to add new search types without new tools

---

**Remember**: Update the server URL in `universal-search.json` before importing to ElevenLabs!
