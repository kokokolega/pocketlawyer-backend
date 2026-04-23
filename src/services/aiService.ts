/**
 * AI Service for PocketLawyer
 * Handles all AI-related API calls
 */

export const aiService = {

  // ================= COMPLAINT =================
  async generateComplaint(data: {
    category: string;
    date: string;
    location: string;
    opposingParty: string;
    description: string;
  }) {
    try {
      const prompt = `Generate a formal legal complaint based on the following details:
Category: ${data.category}
Date: ${data.date}
Location: ${data.location}
Opposing Party: ${data.opposingParty}
Description of Incident: ${data.description}

Please provide a well-structured and professional complaint draft suitable for Indian legal context.`;

      const messages = [{ role: "user", content: prompt }];
      const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini'); // Using OpenRouter for now

      return { content: response };
    } catch (err) {
      console.error("Complaint Generation Error:", err);
      throw err;
    }
  },

  // ================= LEGAL GUIDANCE =================
  async getLegalGuidance(data: {
    issueType: string;
    description: string;
  }) {
    try {
      const prompt = `Provide legal guidance for the following issue in an Indian context:
Issue Type: ${data.issueType}
Description: ${data.description}

Please structure the response with clear headings for:
- 🔍 Case Analysis: (Summary of the issue)
- ⚖️ Legal Issues & Risks: (Relevant laws, potential risks)
- 📊 Chances / Probability: (Likelihood of success/outcome)
- 🧠 Suggested Strategy: (Actionable steps, advice)
- ❓ Questions for User: (Further information needed)
`;

      const messages = [{ role: "user", content: prompt }];
      const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini'); // Using OpenRouter for now

      return { content: response };
    } catch (err) {
      console.error("Legal Guidance Error:", err);
      throw err;
    }
  },



  // ================= DOCUMENT ANALYSIS =================
  async analyzeDocs(files: FileList) {
    // This functionality relied on backend processing of documents.
    // In a frontend-only setup, sending file contents directly to an AI API
    // is generally not feasible or secure without a backend proxy.
    console.warn("analyzeDocs: Functionality removed. Returning placeholder.");
    return {
      summary:
        "Document analysis is not available in frontend-only mode. " +
        "Please describe your case details in the chat for AI assistance.",
    };
  },
  

  // ================= CHAT WITH CASE =================
  async chatWithCase(message: string) {
    try {
      const systemPrompt = "You are an AI legal assistant for Indian law. Provide concise and helpful responses.";
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ];
      const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-3.5-turbo'); // Using OpenRouter for now

      return response;
    } catch (err) {
      console.error("Chat with Case Error:", err);
      return "🤖 AI: There was an error processing your request. Please try again.";
    }
  },
};
export async function fetchAIResponse(
  messages: Array<{ role: string; content: string }>,
  modelProvider: 'openrouter' | 'groq',
  modelName: string
) {
  try {
    let apiKey: string | undefined;
    let apiUrl: string;
    let headers: HeadersInit;

    if (modelProvider === 'openrouter') {
      apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://pocketlawyer.in", // Your frontend domain
        "X-Title": "PocketLawyer",
      };
    } else if (modelProvider === 'groq') {
      apiKey = import.meta.env.VITE_GROQ_API_KEY;
      apiUrl = "https://api.groq.com/openai/v1/chat/completions";
      headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      };
    } else {
      throw new Error("Unsupported model provider");
    }

    if (!apiKey) {
      throw new Error(`API key for ${modelProvider} is not set.`);
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        model: modelName,
        messages: messages,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(`AI API Error (${modelProvider} - ${res.status}): ${errorData.message || JSON.stringify(errorData)}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No response from AI.";
  } catch (err) {
    console.error(`Error fetching AI response from ${modelProvider}:`, err);
    return `Error fetching AI response from ${modelProvider}. Please check console for details.`;
  }
}
