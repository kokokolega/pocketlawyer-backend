/**
 * AI Service for PocketLawyer
 * Handles all AI-related API calls
 */

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api/ai";

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
      const res = await fetch(`${API_BASE}/generate-complaint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to generate complaint");

      return await res.json();
    } catch (err) {
      console.error("Complaint Error:", err);
      throw err;
    }
  },

  // ================= LEGAL GUIDANCE =================
  async getLegalGuidance(data: {
    issueType: string;
    description: string;
  }) {
    try {
      const res = await fetch(`${API_BASE}/legal-guidance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to get legal guidance");

      return await res.json();
    } catch (err) {
      console.error("Guidance Error:", err);
      throw err;
    }
  },

  // ================= CASE RESEARCH =================
  async searchCases(query: string) {
    try {
      const res = await fetch(`${API_BASE}/case-research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error("Failed to research cases");

      return await res.json();
    } catch (err) {
      console.error("Case Research Error:", err);
      throw err;
    }
  },

  // ================= DOCUMENT ANALYSIS =================
  async analyzeDocs(files: FileList) {
    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("documents", file);
      });

      const res = await fetch(`${API_BASE}/analyze-docs`, {
        method: "POST",
        body: formData,
      });

      // 🔴 agar backend me endpoint nahi hai to fallback
      if (!res.ok) {
        return {
          summary:
            "📄 Documents upload ho gaye hain.\n\n👉 AI analysis temporarily unavailable.\n👉 Please continue chat for guidance.",
        };
      }

      return await res.json();
    } catch (err) {
      console.error("Analyze Docs Error:", err);

      // fallback safe response
      return {
        summary:
          "📄 Documents received.\n\n👉 Aap apna case explain karein, main help karta hoon.",
      };
    }
  },
  

  // ================= CHAT WITH CASE =================
  async chatWithCase(message: string) {
    try {
      const res = await fetch(`${API_BASE}/chat-case`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      // 🔴 fallback if backend missing
      if (!res.ok) {
        return "🤖 AI: Main aapki madad kar raha hoon. Apna case detail me batayein.";
      }

      const data = await res.json();
      return data.reply || data.content || "No response";
    } catch (err) {
      console.error("Chat Error:", err);

      return "🤖 AI: Server issue aa raha hai, please dobara try karein.";
    }
  },
};
export async function fetchAIResponse(prompt: string) {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // fast + cheap
        messages: [
          {
            role: "system",
            content:
              "You are a legal research assistant for Indian law. Give structured case results with title, court, year, category, summary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await res.json();

    return data.choices?.[0]?.message?.content || "No response";
  } catch (err) {
    console.error(err);
    return "Error fetching AI response";
  }
}
