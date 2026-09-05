import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function PapersList({ papers }) {
  const [expandedPapers, setExpandedPapers] = useState(new Set());

  const togglePaper = (index) => {
    const newExpanded = new Set(expandedPapers);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPapers(newExpanded);
  };

  if (!papers || papers.length === 0) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto mb-32">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-8 mt-12 pl-2 border-l-4 border-indigo-500">
        Research Papers ({papers.length})
      </h2>

      <div className="space-y-4">
        {papers.map((paper, index) => {
          const isExpanded = expandedPapers.has(index);
          
          return (
            <div 
              key={index}
              className="glass-panel overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.2)] mb-4"
            >
              {/* Paper Header */}
              <div
                onClick={() => togglePaper(index)}
                className="bg-white/5 hover:bg-white/10 p-5 cursor-pointer flex justify-between items-center transition-colors border-b border-white/5"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-indigo-100 mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {paper.authors}
                  </p>
                </div>
                
                <div className="ml-4 text-indigo-400 bg-white/5 p-2 rounded-full">
                  {isExpanded ? (
                    <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Paper Content (Expanded) */}
              {isExpanded && (
                <div className="p-6 bg-black/20">
                  <div className="text-gray-300 leading-relaxed mb-6 text-justify">
                    <p className="whitespace-pre-wrap">{paper.abstract}</p>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700/50">
                    <span className="text-xs text-indigo-400 font-mono inline-flex items-center bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      arXiv: {paper.arxiv_id}
                    </span>
                    
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors text-sm inline-flex items-center font-medium"
                    >
                      View on arXiv
                      <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
