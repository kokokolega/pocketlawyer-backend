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

  // ================= CASE RESEARCH (AI SIMULATED) =================
  async searchCases(query: string) {
    try {
      const prompt = `As an Indian legal expert, provide 3 highly relevant landmark or recent Indian court cases related to the following query:
Query: "${query}"

For each case, provide the information strictly in this JSON format:
[
  {
    "title": "Case Name vs Case Name",
    "court": "Name of the Court (e.g., Supreme Court of India)",
    "year": "YYYY",
    "category": "Area of Law (e.g., Criminal, Family, Contract)",
    "summary": "A brief 2-3 sentence summary of the facts, legal issue, and judgment.",
    "relevance": "High"
  }
]
Only return the valid JSON array. Do not include any other text or markdown formatting.`;

      const messages = [{ role: "user", content: prompt }];
      const response = await fetchAIResponse(messages, 'openrouter', 'openai/gpt-4o-mini');
      
      // Attempt to parse the JSON response
      try {
        // Strip markdown code blocks if the AI accidentally includes them
        const jsonStr = response.replace(/```json\n|\n```|```/g, '').trim();
        const cases = JSON.parse(jsonStr);
        if (Array.isArray(cases)) {
          // Ensure all required fields are present
          return cases.map(c => ({
            ...c,
            link: "#" // No real links available in simulated mode
          }));
        }
      } catch (parseError) {
        console.error("Failed to parse AI case research JSON:", parseError);
        console.log("Raw response:", response);
        // Fallback if parsing fails
      }

      return [{ 
        title: "AI Simulated Research Result", 
        court: "AI Database",
        year: "2024",
        category: "Simulated",
        summary: response, 
        relevance: "Medium",
        link: "#"
      }];
    } catch (err) {
      console.error("Case Research Error:", err);
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