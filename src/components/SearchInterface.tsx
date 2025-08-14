import React, { useState } from 'react';
import { Search, Globe, Brain, TrendingUp, MapPin, Loader2 } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (searchData: any) => void;
  isLoading: boolean;
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [engine, setEngine] = useState<'brave' | 'exa'>('brave');
  const [searchType, setSearchType] = useState<'web' | 'crypto' | 'restaurants' | 'news'>('web');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchData: any = {
      query: query.trim(),
      engine,
      type: searchType
    };

    if (searchType === 'restaurants') {
      searchData.location = location || 'New York';
      searchData.cuisine = cuisine;
    }

    if (searchType === 'crypto') {
      searchData.symbol = query.trim();
    }

    onSearch(searchData);
  };

  const searchTypeOptions = [
    { value: 'web', label: 'Web Search', icon: Globe, desc: 'General web search' },
    { value: 'crypto', label: 'Cryptocurrency', icon: TrendingUp, desc: 'Crypto prices & info' },
    { value: 'restaurants', label: 'Restaurants', icon: MapPin, desc: 'Local dining options' },
    { value: 'news', label: 'News', icon: Search, desc: 'Latest news & events' }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Engine Selection */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setEngine('brave')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
              engine === 'brave'
                ? 'border-purple-400 bg-purple-400/20 text-white'
                : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
            }`}
          >
            <Globe className="h-6 w-6 mx-auto mb-2" />
            <div className="font-semibold">Brave Search</div>
            <div className="text-sm opacity-75">Fast & Private</div>
          </button>
          
          <button
            type="button"
            onClick={() => setEngine('exa')}
            className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 ${
              engine === 'exa'
                ? 'border-cyan-400 bg-cyan-400/20 text-white'
                : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
            }`}
          >
            <Brain className="h-6 w-6 mx-auto mb-2" />
            <div className="font-semibold">Exa.ai</div>
            <div className="text-sm opacity-75">AI-Powered</div>
          </button>
        </div>

        {/* Search Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {searchTypeOptions.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSearchType(value as any)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                searchType === value
                  ? 'border-purple-400 bg-purple-400/20 text-white'
                  : 'border-white/20 bg-white/5 text-gray-300 hover:border-white/40'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <div className="font-medium text-sm">{label}</div>
              <div className="text-xs opacity-75">{desc}</div>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchType === 'crypto' ? 'Enter cryptocurrency symbol (e.g., BTC, ETH)' :
              searchType === 'restaurants' ? 'What type of food are you looking for?' :
              'Enter your search query...'
            }
            className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent text-lg"
          />
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
        </div>

        {/* Additional Fields for Restaurant Search */}
        {searchType === 'restaurants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location (e.g., New York, NY)"
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="Cuisine type (optional)"
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              <span>Search</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchInterface;
