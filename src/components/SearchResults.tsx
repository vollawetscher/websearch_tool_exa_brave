import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, Volume2, Globe, Brain } from 'lucide-react';

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

interface SearchResultsProps {
  results: SearchResponse;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const [copiedTTS, setCopiedTTS] = useState(false);

  const copyTTSResponse = async () => {
    try {
      await navigator.clipboard.writeText(results.ttsResponse);
      setCopiedTTS(true);
      setTimeout(() => setCopiedTTS(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const speakTTSResponse = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(results.ttsResponse);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!results.success) {
    return (
      <div className="bg-red-500/10 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20">
        <div className="text-center">
          <div className="text-red-400 text-lg font-semibold mb-2">Search Failed</div>
          <p className="text-gray-300">{results.error || 'An unexpected error occurred'}</p>
          <div className="mt-4 p-4 bg-red-500/20 rounded-lg">
            <p className="text-red-200 font-medium">TTS Response:</p>
            <p className="text-red-100 mt-1">{results.ttsResponse}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TTS Response Card */}
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">TTS-Ready Response</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={speakTTSResponse}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Speak response"
            >
              <Volume2 className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={copyTTSResponse}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Copy TTS response"
            >
              {copiedTTS ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
        
        <div className="bg-black/20 rounded-lg p-4">
          <p className="text-gray-200 leading-relaxed">{results.ttsResponse}</p>
        </div>
        
        <div className="mt-3 text-sm text-gray-400">
          Query: "{results.query}" • {results.totalResults || results.results.length} results found
        </div>
      </div>

      {/* Search Results */}
      {results.results.length > 0 && (
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-white">Detailed Results</h3>
            <span className="text-sm text-gray-400">({results.results.length} shown)</span>
          </div>

          <div className="space-y-4">
            {results.results.map((result, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-semibold text-lg mb-2 leading-tight">
                      {result.title}
                    </h4>
                    <p className="text-gray-300 mb-3 leading-relaxed">
                      {result.snippet}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="truncate max-w-md">{result.url}</span>
                      {result.score && (
                        <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                          Score: {result.score.toFixed(2)}
                        </span>
                      )}
                      {result.publishedDate && (
                        <span className="bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                          {new Date(result.publishedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4 text-white" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
