import ReactMarkdown from 'react-markdown';

export default function ComprehensiveSummary({ summary, isValidTopic }) {
  if (!summary) {
    return null;
  }

  const sections = summary.sections || [];
  const title = summary.title || 'Comprehensive Summary';

  return (
    <div className="max-w-5xl mx-auto mb-12">
      {/* Validation Status Badge */}
      {isValidTopic !== undefined && (
        <div className="mb-8 flex justify-center">
          {isValidTopic ? (
            <span className="inline-flex items-center px-5 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Valid AI Topic
            </span>
          ) : (
            <span className="inline-flex items-center px-5 py-2.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full font-semibold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Not an AI Topic
            </span>
          )}
        </div>
      )}

      {/* Main Summary Container */}
      <div className="glass-panel p-10 mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 mb-8 border-b border-gray-700/50 pb-6 text-center">
          {title}
        </h1>

        {sections.length === 0 && (
          <p className="text-gray-400 text-center py-8">No summary sections available</p>
        )}

        {sections.map((section, index) => (
          <div key={index} className="mb-10">
            <h2 className="text-2xl font-bold text-indigo-300 mt-8 mb-4 border-b border-gray-700/30 pb-3">
              {section.heading}
            </h2>
            
            <div className="leading-relaxed space-y-4 text-justify prose prose-lg max-w-none text-gray-300">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {/* Subsections */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="ml-6 mt-8 border-l-2 border-indigo-500/20 pl-6">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="mb-8">
                    <h3 className="text-xl font-semibold text-purple-300 mt-6 mb-3">
                      {subsection.heading}
                    </h3>
                    <div className="leading-relaxed space-y-4 text-justify prose prose-lg max-w-none text-gray-300">
                      <ReactMarkdown>{subsection.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
