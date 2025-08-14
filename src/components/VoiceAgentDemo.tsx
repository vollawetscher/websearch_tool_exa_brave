import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Play, Pause, Settings } from 'lucide-react';

interface VoiceAgentDemoProps {
  onSearch: (searchData: any) => void;
}

const VoiceAgentDemo: React.FC<VoiceAgentDemoProps> = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const demoQueries = [
    {
      category: 'Crypto',
      query: 'What is the current price of Bitcoin?',
      searchData: { query: 'Bitcoin', engine: 'brave', type: 'crypto', symbol: 'BTC' }
    },
    {
      category: 'Restaurants',
      query: 'Find Italian restaurants near Times Square',
      searchData: { query: 'Italian restaurants', engine: 'brave', type: 'restaurants', location: 'Times Square, New York', cuisine: 'Italian' }
    },
    {
      category: 'Sports',
      query: 'What are the latest NBA scores?',
      searchData: { query: 'NBA scores today latest games', engine: 'brave', type: 'news' }
    },
    {
      category: 'Weather',
      query: 'What is the weather like in San Francisco?',
      searchData: { query: 'San Francisco weather today forecast', engine: 'brave', type: 'web' }
    },
    {
      category: 'Stock',
      query: 'How is Apple stock performing today?',
      searchData: { query: 'Apple AAPL stock price today performance', engine: 'exa', type: 'web' }
    },
    {
      category: 'Events',
      query: 'What events are happening in New York this weekend?',
      searchData: { query: 'New York events this weekend concerts shows', engine: 'exa', type: 'web' }
    }
  ];

  const handleDemoQuery = (demo: any) => {
    setTranscript(demo.query);
    onSearch(demo.searchData);
  };

  const toggleListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      if (!isListening) {
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('Listening...');
        };

        recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          setTranscript(transcript);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      alert('Speech recognition is not supported in your browser. Please try the demo queries below.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300">
          <Mic className="h-4 w-4 text-green-400" />
          <span>Voice Agent Integration Demo</span>
        </div>
        
        <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Test Voice Interactions
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
            with Live Search
          </span>
        </h2>
        
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Experience how the search tool integrates with voice agents. Try speaking or use the demo queries below.
        </p>
      </div>

      {/* Voice Input Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="text-center space-y-6">
          <button
            onClick={toggleListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </button>
          
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isListening ? 'Listening...' : 'Click to Start Voice Input'}
            </h3>
            <p className="text-gray-400">
              {isListening ? 'Speak your query now' : 'Ask about crypto, restaurants, weather, sports, or events'}
            </p>
          </div>

          {transcript && (
            <div className="bg-black/20 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-white text-lg">{transcript}</p>
            </div>
          )}
        </div>
      </div>

      {/* Demo Queries */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Try These Demo Queries</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoQueries.map((demo, index) => (
            <button
              key={index}
              onClick={() => handleDemoQuery(demo)}
              className="bg-white/5 hover:bg-white/15 rounded-xl p-6 border border-white/10 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  {demo.category}
                </span>
                <Play className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              </div>
              
              <p className="text-white font-medium mb-2">{demo.query}</p>
              <p className="text-gray-400 text-sm">
                Engine: {demo.searchData.engine} • Type: {demo.searchData.type}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Integration Instructions */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-start space-x-4">
          <Settings className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">ElevenLabs Integration</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-white">API Endpoint:</strong> POST http://localhost:3001/api/search/[engine]
              </p>
              <p>
                <strong className="text-white">Response Format:</strong> The API returns a <code className="bg-black/20 px-2 py-1 rounded text-cyan-300">ttsResponse</code> field optimized for voice synthesis.
              </p>
              <p>
                <strong className="text-white">Supported Engines:</strong> brave, exa
              </p>
              <p>
                <strong className="text-white">Search Types:</strong> web, crypto, restaurants, news
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgentDemo;
