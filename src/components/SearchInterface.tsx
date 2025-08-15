import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Search, MapPin, Loader2 } from 'lucide-react';
import { searchAPI } from '../utils/api';
import type { SearchResult } from '../utils/api';

interface SearchInterfaceProps {
  onResults: (results: SearchResult[], ttsResponse: string, query: string) => void;
  onError: (error: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

export default function SearchInterface({ 
  onResults, 
  onError, 
  isListening, 
  onToggleListening 
}: SearchInterfaceProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchProvider, setSearchProvider] = useState<'brave' | 'exa'>('brave');
  const [searchType, setSearchType] = useState('web');
  const [location, setLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Detect user's location
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      // Reverse geocoding using a free service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
      );
      
      if (!response.ok) throw new Error('Failed to get location name');
      
      const data = await response.json();
      const locationName = data.city || data.locality || data.principalSubdivision || 'Unknown location';
      
      setDetectedLocation(locationName);
      setLocation(locationName);
      
    } catch (error) {
      console.error('Location detection failed:', error);
      onError(`Location detection failed: ${error.message}`);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      let results;
      const effectiveLocation = location.trim() || detectedLocation.trim();

      if (searchProvider === 'brave') {
        // Check if this is a restaurant search
        const isRestaurantQuery = searchQuery.toLowerCase().includes('restaurant') || 
                                 searchQuery.toLowerCase().includes('food') ||
                                 searchQuery.toLowerCase().includes('dining') ||
                                 searchType === 'restaurants';

        if (isRestaurantQuery && effectiveLocation) {
          // Use specialized restaurant search
          const cuisine = searchQuery.replace(/restaurant|food|dining|in|near/gi, '').trim();
          results = await searchAPI.restaurants(effectiveLocation, cuisine, searchQuery);
        } else {
          // Use general Brave search with location
          results = await searchAPI.brave(searchQuery, searchType, effectiveLocation);
        }
      } else {
        // Exa search - enhance query with location if provided
        const enhancedQuery = effectiveLocation ? 
          `${searchQuery} in ${effectiveLocation}` : 
          searchQuery;
        results = await searchAPI.exa(enhancedQuery, searchType);
      }

      if (results.success) {
        onResults(results.results, results.ttsResponse, searchQuery);
      } else {
        onError(results.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      onError(`Search failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Provider Selection */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setSearchProvider('brave')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchProvider === 'brave'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-surface text-textSecondary hover:bg-border'
          }`}
        >
          🦁 Brave Search
        </button>
        <button
          onClick={() => setSearchProvider('exa')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            searchProvider === 'exa'
              ? 'bg-secondary text-white shadow-lg'
              : 'bg-surface text-textSecondary hover:bg-border'
          }`}
        >
          🧠 Exa AI Search
        </button>
      </div>

      {/* Search Type Selection */}
      <div className="flex justify-center space-x-2 flex-wrap">
        {['web', 'news', 'restaurants'].map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              searchType === type
                ? 'bg-accent text-white'
                : 'bg-surface text-textSecondary hover:bg-border'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Location Input */}
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary w-5 h-5" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (optional)"
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          onClick={detectLocation}
          disabled={isDetectingLocation}
          className="px-4 py-3 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          title="Detect my location"
        >
          {isDetectingLocation ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">
            {isDetectingLocation ? 'Detecting...' : 'Auto'}
          </span>
        </button>
      </div>

      {detectedLocation && (
        <div className="text-center text-sm text-textSecondary">
          📍 Detected location: {detectedLocation}
        </div>
      )}

      {/* Main Search Interface */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything... (e.g., 'Italian restaurants near me', 'latest tech news')"
              className="w-full pl-4 pr-16 py-4 bg-surface border border-border rounded-xl text-text placeholder-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                type="button"
                onClick={onToggleListening}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? 'bg-error text-white animate-pulse'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? 'Searching...' : 'Search'}
            </span>
          </button>
        </div>
      </form>

      {/* Search Tips */}
      <div className="text-center text-sm text-textSecondary space-y-1">
        <p>💡 Try: "Best pizza restaurants in New York" or "Latest AI news"</p>
        <p>🎯 Use location for better local results • 🎤 Click mic for voice search</p>
      </div>
    </div>
  );
}
