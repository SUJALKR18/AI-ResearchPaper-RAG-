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
        <div className="mb-6">
          {isValidTopic ? (
            <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Valid AI Topic
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Not an AI Topic
            </span>
          )}
        </div>
      )}

      {/* Main Summary Container */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-4">
          {title}
        </h1>

        {sections.length === 0 && (
          <p className="text-gray-500 text-center py-8">No summary sections available</p>
        )}

        {sections.map((section, index) => (
          <div key={index} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4 border-b-2 border-gray-200 pb-2">
              {section.heading}
            </h2>
            
            <div className="text-gray-700 leading-relaxed space-y-4 text-justify prose prose-lg max-w-none">
              <ReactMarkdown>{section.content}</ReactMarkdown>
            </div>

            {/* Subsections */}
            {section.subsections && section.subsections.length > 0 && (
              <div className="ml-4 mt-6">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="mb-6">
                    <h3 className="text-xl font-medium text-gray-700 mt-6 mb-3">
                      {subsection.heading}
                    </h3>
                    <div className="text-gray-700 leading-relaxed space-y-4 text-justify prose prose-lg max-w-none">
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
