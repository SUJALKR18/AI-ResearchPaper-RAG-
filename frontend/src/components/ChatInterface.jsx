import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatInterface({ sessionId, geminiApiKey, onQuery, ragReady, ragProgress }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || loading || !ragReady) {
      return;
    }

    const userMessage = {
      role: 'user',
      content: question,
    };

    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const result = await onQuery(sessionId, question, geminiApiKey);
      
      const aiMessage = {
        role: 'assistant',
        content: result.answer,
        sources: result.sources || [],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-3xl border-l border-white/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-5 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Research Assistant</h2>
        <p className="text-sm text-indigo-300 mt-1">Ask questions about the papers</p>
      </div>

      {/* RAG Status Notification */}
      {!ragReady && (
        <div className="bg-yellow-900/20 border-b border-yellow-700/30 p-4">
          <div className="flex items-center">
            <svg className="animate-spin h-5 w-5 text-yellow-500 mr-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <div className="flex-1">
              <p className="text-sm text-yellow-300 font-medium">Building knowledge base...</p>
              {ragProgress && (
                <p className="text-xs text-yellow-400 mt-1">{ragProgress}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {ragReady && (
        <div className="bg-emerald-900/20 border-b border-emerald-700/30 p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-emerald-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-emerald-300 font-medium">RAG System Active - Ready!</p>
          </div>
        </div>
      )}

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-transparent custom-scrollbar">
        {messages.length === 0 && ragReady && (
          <div className="text-center text-gray-400 mt-12">
            <svg className="w-14 h-14 mx-auto mb-4 text-indigo-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="font-medium text-lg text-gray-300">Start a conversation</p>
            <p className="text-sm mt-2 text-gray-500">Ask questions about the research papers</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="animate-fadeIn">
            {message.role === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm p-4 shadow-lg">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <div className="max-w-[90%] glass-panel bg-black/40 p-4 shadow-lg rounded-2xl rounded-tl-sm border border-white/10">
                  <div className="text-sm prose prose-sm max-w-none prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <p className="text-xs text-indigo-300 font-semibold mb-2">Sources:</p>
                      {message.sources.map((source, sIndex) => (
                        <div key={sIndex} className="text-xs text-gray-400 mb-1 flex items-start">
                          <span className="mr-1.5 text-indigo-500">•</span> 
                          <span>{source.title} ({source.arxiv_id})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="glass-panel bg-black/40 rounded-2xl rounded-tl-sm p-4 shadow-lg border border-white/10">
              <div className="flex items-center space-x-3 text-indigo-300">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-white/10 p-5 bg-black/40 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={ragReady ? "Ask a question..." : "Waiting for RAG system..."}
            className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-white placeholder-gray-400"
            rows="2"
            disabled={loading || !ragReady}
          />
          <button
            type="submit"
            disabled={loading || !question.trim() || !ragReady}
            className="w-full glass-button font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 disabled:opacity-50 text-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Send Message'
            )}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
