import React, { useState } from 'react';
import { Search, Mic, Globe, Brain, TrendingUp, MapPin, Calendar, Zap } from 'lucide-react';
import SearchInterface from './components/SearchInterface';
import ApiKeyManager from './components/ApiKeyManager';
import SearchResults from './components/SearchResults';
import VoiceAgentDemo from './components/VoiceAgentDemo';
import { searchAPI } from './utils/api';

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  score?: number;
  publishedDate?: string;
}

interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResult[];
  ttsResponse: string;
  totalResults?: number;
  error?: string;
}

function App() {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'demo' | 'settings'>('search');

  const handleSearch = async (searchData: any) => {
    setIsLoading(true);
    try {
      let result: SearchResponse;

      // Route to appropriate search API based on type and engine
      if (searchData.type === 'crypto') {
        result = await searchAPI.crypto(searchData.symbol || searchData.query);
      } else if (searchData.type === 'restaurants') {
        result = await searchAPI.restaurants(
          searchData.location || 'New York',
          searchData.cuisine,
          searchData.query
        );
      } else if (searchData.engine === 'exa') {
        result = await searchAPI.exa(searchData.query, searchData.type);
      } else {
        // Default to Brave search
        result = await searchAPI.brave(searchData.query, searchData.type, searchData.location);
      }

      setSearchResults(result);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        success: false,
        query: searchData.query,
        results: [],
        ttsResponse: 'I encountered an error while searching. Please check your connection and try again.',
        error: 'Network error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl">
                  <Mic className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">ElevenLabs Voice Search</h1>
                  <p className="text-sm text-gray-300">AI-Powered Web Search Tool</p>
                </div>
              </div>
              
              <nav className="flex space-x-1">
                {[
                  { id: 'search', label: 'Search', icon: Search },
                  { id: 'demo', label: 'Voice Demo', icon: Mic },
                  { id: 'settings', label: 'Settings', icon: Zap }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-white/20 text-white shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'search' && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="text-center space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>Powered by Brave Search & Exa.ai</span>
                </div>
                
                <h2 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
                  Intelligent Web Search
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                    for Voice Agents
                  </span>
                </h2>
                
                <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                  Comprehensive search capabilities covering events, sports, traffic, crypto, stocks, 
                  restaurants, and more. Optimized for TTS-compatible responses.
                </p>

                {/* Feature Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                  {[
                    { icon: Globe, label: 'Web Search', desc: 'General queries' },
                    { icon: TrendingUp, label: 'Finance', desc: 'Stocks & Crypto' },
                    { icon: MapPin, label: 'Local', desc: 'Restaurants & Places' },
                    { icon: Calendar, label: 'Events', desc: 'News & Sports' }
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-200">
                      <Icon className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <h3 className="font-semibold text-white">{label}</h3>
                      <p className="text-sm text-gray-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Interface */}
              <SearchInterface onSearch={handleSearch} isLoading={isLoading} />

              {/* Search Results */}
              {searchResults && (
                <SearchResults results={searchResults} />
              )}
            </div>
          )}

          {activeTab === 'demo' && (
            <VoiceAgentDemo onSearch={handleSearch} />
          )}

          {activeTab === 'settings' && (
            <ApiKeyManager />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
