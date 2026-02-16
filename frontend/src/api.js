const API_BASE_URL = 'http://localhost:8000';

export async function processTopic(topic) {
  const response = await fetch(`${API_BASE_URL}/api/process-topic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to process topic');
  }

  return response.json();
}

export async function queryRAG(sessionId, question) {
  const response = await fetch(`${API_BASE_URL}/api/query-rag`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      question,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to query RAG system');
  }

  return response.json();
}

/**
 * Check API health status
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}
