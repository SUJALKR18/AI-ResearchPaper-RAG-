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
      <h2 className="text-2xl font-bold text-gray-800 mb-6 mt-12">
        Research Papers ({papers.length})
      </h2>

      <div className="space-y-4">
        {papers.map((paper, index) => {
          const isExpanded = expandedPapers.has(index);
          
          return (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Paper Header */}
              <div
                onClick={() => togglePaper(index)}
                className="bg-gradient-to-r from-blue-50 to-white p-4 cursor-pointer flex justify-between items-center"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {paper.authors}
                  </p>
                </div>
                
                <div className="ml-4 text-gray-400">
                  {isExpanded ? (
                    <svg className="w-6 h-6 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Paper Content (Expanded) */}
              {isExpanded && (
                <div className="p-6 border-t border-gray-100">
                  <div className="text-gray-700 leading-relaxed mb-4">
                    <p className="whitespace-pre-wrap">{paper.abstract}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-blue-600 font-mono inline-flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      arXiv: {paper.arxiv_id}
                    </span>
                    
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm inline-flex items-center"
                    >
                      View on arXiv
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
