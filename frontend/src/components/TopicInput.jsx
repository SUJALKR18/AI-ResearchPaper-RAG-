import { useState, useEffect } from 'react';

export default function TopicInput({ onSubmit, validationError }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (validationError) {
      setError(validationError);
    }
  }, [validationError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter an AI technology topic');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSubmit(topic);
    } catch (err) {
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 fade-in">
      <div className="max-w-2xl mx-auto glass-panel p-10 w-full hover-scale">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-3 text-center drop-shadow-sm">
          AI Research Paper Analysis
        </h1>
        <p className="text-gray-300 text-center mb-8 text-lg">
          Enter an AI technology topic to discover and analyze the latest research papers
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-200 mb-2">
              AI Technology Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Transformer Architecture, RAG Systems, LLM Fine-tuning"
              className="w-full px-4 py-4 rounded-xl glass-input text-white text-lg placeholder-gray-400"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button font-bold py-4 px-6 rounded-xl text-lg shadow-lg"
          >
            {loading ? 'Processing...' : 'Analyze Research Papers'}
          </button>
        </form>

        {loading && (
          <div className="mt-8 flex flex-col items-center animate-pulse">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-400 border-t-transparent rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
            <p className="mt-4 text-sm text-gray-300 text-center">
              Validating topic, fetching papers, and generating comprehensive analysis...
              <br />
              This may take 30-60 seconds.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-sm">
            <p className="font-medium flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              Error
            </p>
            <p className="text-sm mt-1 ml-7">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
