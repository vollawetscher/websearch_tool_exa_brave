import React, { useState, useEffect } from 'react';
import { Key, Save, Eye, EyeOff, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

const ApiKeyManager: React.FC = () => {
  const [braveKey, setBraveKey] = useState('');
  const [exaKey, setExaKey] = useState('');
  const [showBraveKey, setShowBraveKey] = useState(false);
  const [showExaKey, setShowExaKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    // Load saved keys from localStorage
    const savedBraveKey = localStorage.getItem('brave_api_key');
    const savedExaKey = localStorage.getItem('exa_api_key');
    
    if (savedBraveKey) setBraveKey(savedBraveKey);
    if (savedExaKey) setExaKey(savedExaKey);
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    
    try {
      // Save to localStorage (in production, you'd want to handle this more securely)
      if (braveKey) localStorage.setItem('brave_api_key', braveKey);
      if (exaKey) localStorage.setItem('exa_api_key', exaKey);
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-300">
          <Key className="h-4 w-4 text-yellow-400" />
          <span>API Configuration</span>
        </div>
        
        <h2 className="text-4xl font-bold text-white">
          Configure API Keys
        </h2>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Set up your Brave Search and Exa.ai API keys to enable search functionality.
        </p>
      </div>

      {/* API Key Configuration */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 space-y-8">
        
        {/* Brave Search API */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span>Brave Search API</span>
              </h3>
              <p className="text-gray-400 mt-1">Fast, private web search with comprehensive results</p>
            </div>
            <a
              href="https://api.search.brave.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
          
          <div className="relative">
            <input
              type={showBraveKey ? 'text' : 'password'}
              value={braveKey}
              onChange={(e) => setBraveKey(e.target.value)}
              placeholder="Enter your Brave Search API key"
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={() => setShowBraveKey(!showBraveKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showBraveKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
            <h4 className="text-orange-300 font-medium mb-2">Getting Started with Brave Search</h4>
            <ul className="text-orange-200 text-sm space-y-1">
              <li>• Visit api.search.brave.com to get your API key</li>
              <li>• Free tier includes 2,000 queries per month</li>
              <li>• Supports web search, news, and location-based queries</li>
            </ul>
          </div>
        </div>

        {/* Exa.ai API */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span>Exa.ai API</span>
              </h3>
              <p className="text-gray-400 mt-1">AI-powered search with semantic understanding</p>
            </div>
            <a
              href="https://exa.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
          
          <div className="relative">
            <input
              type={showExaKey ? 'text' : 'password'}
              value={exaKey}
              onChange={(e) => setExaKey(e.target.value)}
              placeholder="Enter your Exa.ai API key"
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <button
              type="button"
              onClick={() => setShowExaKey(!showExaKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showExaKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="text-cyan-300 font-medium mb-2">Getting Started with Exa.ai</h4>
            <ul className="text-cyan-200 text-sm space-y-1">
              <li>• Visit exa.ai to sign up and get your API key</li>
              <li>• AI-powered search with semantic understanding</li>
              <li>• Perfect for complex queries and content discovery</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 transition-all duration-200 flex items-center space-x-2"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Saved Successfully</span>
              </>
            ) : saveStatus === 'error' ? (
              <>
                <AlertCircle className="h-5 w-5" />
                <span>Save Failed</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Save Configuration</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Environment Setup Instructions */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
        <div className="flex items-start space-x-4">
          <AlertCircle className="h-6 w-6 text-yellow-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Production Setup</h3>
            <div className="space-y-3 text-gray-300">
              <p>
                For production deployment, set these environment variables on your server:
              </p>
              <div className="bg-black/20 rounded-lg p-4 font-mono text-sm">
                <div className="text-yellow-300">BRAVE_API_KEY=your_brave_api_key</div>
                <div className="text-cyan-300">EXA_API_KEY=your_exa_api_key</div>
                <div className="text-green-300">PORT=3001</div>
              </div>
              <p className="text-sm">
                <strong className="text-white">Note:</strong> The current implementation stores keys in localStorage for demo purposes. 
                In production, use secure environment variables and proper secret management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
