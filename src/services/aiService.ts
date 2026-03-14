/**
 * AI Service for PocketLawyer
 * This service handles frontend calls to the backend AI endpoints.
 */

const API_BASE = "https://pocketlawyer-backend-nh7q.onrender.com/api/ai";

export const aiService = {
  /**
   * Generates a formal legal complaint based on user input.
   */
  async generateComplaint(data: {
    category: string;
    date: string;
    location: string;
    opposingParty: string;
    description: string;
  }) {
    const response = await fetch(`${API_BASE}/generate-complaint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to generate complaint");
    return await response.json();
  },

  /**
   * Provides legal guidance for a specific issue type and description.
   */
  async getLegalGuidance(data: {
    issueType: string;
    description: string;
  }) {
    const response = await fetch(`${API_BASE}/legal-guidance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Failed to get legal guidance");
    return await response.json();
  },

  /**
   * Researches similar cases or landmark judgments based on a query.
   */
  async searchCases(query: string) {
    const response = await fetch(`${API_BASE}/case-research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error("Failed to research cases");
    return await response.json();
  },
};