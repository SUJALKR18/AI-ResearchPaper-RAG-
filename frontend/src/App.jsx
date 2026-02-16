import { useState } from 'react';
import TopicInput from './components/TopicInput';
import ComprehensiveSummary from './components/ComprehensiveSummary';
import PapersList from './components/PapersList';
import ChatInterface from './components/ChatInterface';
import { processTopic, queryRAG } from './api';

function App() {
  const [view, setView] = useState('input');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleTopicSubmit = async (topic) => {
    setError('');
    try {
      const response = await processTopic(topic);
      if (!response.is_valid_ai_topic) {
        setError(response.error || 'The topic is not related to AI technology.');
        return;
      }
      setResults(response);
      setView('results');
    } catch (err) {
      setError(err.message || 'Failed to process the topic');
    }
  };

  const handleRAGQuery = async (sessionId, question) => {
    return await queryRAG(sessionId, question);
  };

  const handleNewSearch = () => {
    setView('input');
    setResults(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'input' ? (
        <TopicInput onSubmit={handleTopicSubmit} validationError={error} />
      ) : (
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 p-8 mr-96">
            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
              <button
                onClick={handleNewSearch}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                New Search
              </button>
            </div>

            {results?.comprehensive_summary ? (
              <ComprehensiveSummary
                summary={results.comprehensive_summary}
                isValidTopic={results?.is_valid_ai_topic}
              />
            ) : (
              <div className="max-w-5xl mx-auto mb-12 bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                <p className="text-lg">Comprehensive summary not available</p>
                <p className="text-sm mt-2">
                  The AI-generated comprehensive summary could not be generated
                </p>
              </div>
            )}

            <PapersList papers={results?.papers} />
          </div>

          {results?.session_id && (
            <ChatInterface
              sessionId={results.session_id}
              onQuery={handleRAGQuery}
              ragReady={results?.rag_ready || false}
              ragProgress={results?.rag_progress}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
