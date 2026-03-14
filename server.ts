import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {

  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // =============================
  // Groq AI Initialization
  // =============================
  const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });

  // =============================
  // Generate Complaint API
  // =============================
  app.post("/api/ai/generate-complaint", async (req, res) => {

    try {

      const { category, date, location, opposingParty, description } = req.body;

      const prompt = `
You are a professional legal assistant in India.

Generate a formal police complaint based on the following details:

Category: ${category}
Date: ${date}
Location: ${location}
Opposing Party: ${opposingParty}

Description:
${description}

Format the complaint as a formal letter addressed to the Station House Officer (SHO).

Include:
- Heading
- Subject
- Statement of Facts
- Legal Request / Prayer
- Signature Placeholder

Use professional Indian legal language.
`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ]
      });

      res.json({
        content: completion.choices[0].message.content
      });

    } catch (error) {

      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate complaint" });

    }

  });

  // =============================
  // Legal Guidance API
  // =============================
  app.post("/api/ai/legal-guidance", async (req, res) => {

    try {

      const { issueType, description } = req.body;

      const prompt = `
You are an expert Indian Legal Advisor.

Provide legal guidance for the following issue.

Issue Type: ${issueType}
Description: ${description}

Explain clearly:

1. Applicable Laws (IPC / BNS / relevant Acts)
2. Explanation of the legal situation
3. Immediate steps the citizen should take
4. Which authority to approach

Use clear and supportive language.
`;

      const completion = await groq.chat.completions.create({
       model: "llama-3.3-70b-versatile",
        messages: [
          { role: "user", content: prompt }
        ]
      });

      res.json({
        content: completion.choices[0].message.content
      });

    } catch (error) {

      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to provide guidance" });

    }

  });

  // =============================
  // Case Research API
  // =============================
  app.post("/api/ai/case-research", async (req, res) => {

    try {

      const { query } = req.body;

      const prompt = `
You are a legal researcher specializing in Indian case law.

Research landmark or similar cases related to:

"${query}"

Provide 3-4 relevant cases including:

- Case Name
- Court & Year
- Brief Summary
- Legal Impact or precedent

If no exact case matches, explain general Supreme Court principles on the topic.
`;

      const completion = await groq.chat.completions.create({
        model: "llama3-70b-8192",
        messages: [
          { role: "user", content: prompt }
        ]
      });

      res.json({
        content: completion.choices[0].message.content
      });

    } catch (error) {

      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to research cases" });

    }

  });

  // =============================
  // Vite Dev Middleware
  // =============================
  if (process.env.NODE_ENV !== "production") {

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);

  } else {

    app.use(express.static(path.join(__dirname, "dist")));

    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });

  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

}

startServer();