import { fetchAIResponse } from './aiService';

// Mock environment variables for testing
const MOCK_OPENROUTER_API_KEY = 'test-openrouter-key';
const MOCK_GROQ_API_KEY = 'test-groq-key';

// Mock fetch API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('fetchAIResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock environment variables for each test
    process.env.VITE_OPENROUTER_API_KEY = MOCK_OPENROUTER_API_KEY;
    process.env.VITE_GROQ_API_KEY = MOCK_GROQ_API_KEY;
  });

  // Helper to mock a successful API response
  const mockSuccessfulResponse = (content: string) => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content } }],
      }),
    });
  };

  // Helper to mock a failed API response
  const mockFailedResponse = (status: number, message: string) => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: status,
      json: () => Promise.resolve({ message }),
    });
  };

  it('should fetch a response from OpenRouter successfully', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const expectedContent = 'AI response from OpenRouter';
    mockSuccessfulResponse(expectedContent);

    const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://openrouter.ai/api/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Authorization': `Bearer ${MOCK_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: messages,
      }),
    }));
    expect(response).toBe(expectedContent);
  });

  it('should fetch a response from Groq successfully', async () => {
    const messages = [{ role: 'user', content: 'Hello Groq' }];
    const expectedContent = 'AI response from Groq';
    mockSuccessfulResponse(expectedContent);

    const response = await fetchAIResponse(messages, 'groq', 'llama3-8b-8192');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://api.groq.com/openai/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Authorization': `Bearer ${MOCK_GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: messages,
      }),
    }));
    expect(response).toBe(expectedContent);
  });

  it('should return an error message if OpenRouter API key is missing', async () => {
    process.env.VITE_OPENROUTER_API_KEY = undefined; // Simulate missing key
    const messages = [{ role: 'user', content: 'Test' }];

    const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini');

    expect(mockFetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(response).toContain('Error fetching AI response from openrouter');
    expect(response).toContain('API key for openrouter is not set.');
  });

  it('should return an error message if Groq API key is missing', async () => {
    process.env.VITE_GROQ_API_KEY = undefined; // Simulate missing key
    const messages = [{ role: 'user', content: 'Test' }];

    const response = await fetchAIResponse(messages, 'groq', 'llama3-8b-8192');

    expect(mockFetch).not.toHaveBeenCalled(); // fetch should not be called
    expect(response).toContain('Error fetching AI response from groq');
    expect(response).toContain('API key for groq is not set.');
  });

  it('should handle API errors gracefully for OpenRouter', async () => {
    const messages = [{ role: 'user', content: 'Error test' }];
    mockFailedResponse(500, 'Internal Server Error');

    const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response).toContain('Error fetching AI response from openrouter');
    expect(response).toContain('AI API Error (openrouter - 500): Internal Server Error');
  });

  it('should handle API errors gracefully for Groq', async () => {
    const messages = [{ role: 'user', content: 'Error test' }];
    mockFailedResponse(400, 'Bad Request');

    const response = await fetchAIResponse(messages, 'groq', 'llama3-8b-8192');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(response).toContain('Error fetching AI response from groq');
    expect(response).toContain('AI API Error (groq - 400): Bad Request');
  });

  it('should return "No response from AI." if choices are empty', async () => {
    const messages = [{ role: 'user', content: 'Empty response test' }];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ choices: [] }), // Empty choices array
    });

    const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini');

    expect(response).toBe('No response from AI.');
  });

  it('should throw error for unsupported model provider', async () => {
    const messages = [{ role: 'user', content: 'Unsupported' }];
    // @ts-ignore - Intentionally testing unsupported provider
    const response = await fetchAIResponse(messages, 'unsupported', 'some-model');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(response).toContain('Error fetching AI response from unsupported');
    expect(response).toContain('Unsupported model provider');
  });
});