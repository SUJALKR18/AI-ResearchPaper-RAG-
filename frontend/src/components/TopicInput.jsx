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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          AI Research Paper Analysis
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Enter an AI technology topic to discover and analyze the latest research papers
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              AI Technology Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Transformer Architecture, RAG Systems, LLM Fine-tuning"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Analyze Research Papers'}
          </button>
        </form>

        {loading && (
          <div className="mt-6 flex flex-col items-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Validating topic, fetching papers, and generating comprehensive analysis...
              <br />
              This may take 30-60 seconds.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
