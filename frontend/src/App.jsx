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
    <div className="min-h-screen text-white">
      {view === 'input' ? (
        <TopicInput onSubmit={handleTopicSubmit} validationError={error} />
      ) : (
        <div className="flex min-h-screen">
          <div className="flex-1 p-8 mr-96">
            <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center fade-in">
              <button
                onClick={handleNewSearch}
                className="glass-button px-6 py-2 rounded-lg font-medium inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                New Search
              </button>
            </div>

            <div className="fade-in" style={{ animationDelay: '0.1s' }}>
              {results?.comprehensive_summary ? (
                <ComprehensiveSummary
                  summary={results.comprehensive_summary}
                  isValidTopic={results?.is_valid_ai_topic}
                />
              ) : (
                <div className="max-w-5xl mx-auto mb-12 glass-panel p-10 text-center text-gray-400">
                  <p className="text-xl text-white">Comprehensive summary not available</p>
                  <p className="text-sm mt-3">
                    The AI-generated comprehensive summary could not be generated
                  </p>
                </div>
              )}
            </div>

            <div className="fade-in" style={{ animationDelay: '0.2s' }}>
              <PapersList papers={results?.papers} />
            </div>
          </div>

          {results?.session_id && (
            <div className="fixed right-0 top-0 bottom-0 w-96 glass-panel rounded-none border-t-0 border-b-0 border-r-0 fade-in" style={{ animationDelay: '0.3s' }}>
              <ChatInterface
                sessionId={results.session_id}
                onQuery={handleRAGQuery}
                ragReady={results?.rag_ready || false}
                ragProgress={results?.rag_progress}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
