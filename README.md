# PocketLawyer – AI Legal Assistance Platform

PocketLawyer is a professional, scalable AI-powered legal assistance platform designed for citizens, lawyers, and law students in India. It helps users generate legal complaints, understand laws, and research similar cases using artificial intelligence.

## Features

- **AI Complaint Generator**: Automatically generate police complaints and legal applications with professional formatting.
- **Legal Guidance AI**: Get clear explanations of relevant laws (IPC/BNS) and next legal steps for various issues.
- **AI Case Research**: Search for landmark judgments and similar cases to strengthen legal understanding.
- **Modern UI**: A trustworthy, minimal design with a subtle Indian tricolor theme.

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, Lucide React.
- **Backend**: Node.js, Express.js.
- **AI**: Google Gemini API.
- **Styling**: Tailwind CSS with custom theme configuration.

## Project Structure

```
/
├── server.ts            # Express server entry point & API routes
├── src/
│   ├── components/      # Reusable UI components (Layout, etc.)
│   ├── pages/           # Page components (Landing, Complaint, etc.)
│   ├── services/        # Frontend API services
│   ├── App.tsx          # Main React application & routing
│   ├── index.css        # Global styles & Tailwind theme
│   └── main.tsx         # React entry point
├── package.json         # Dependencies & scripts
├── metadata.json        # App metadata & permissions
└── .env.example         # Environment variable templates
```

## Getting Started

### Prerequisites

- Node.js installed.
### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Create a `.env` file based on `.env.example`.

### Running the App

Start the development server (Full-stack mode):
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## Deployment

- **Frontend**: Can be deployed as a static site after running `npm run build`.
- **Backend**: Can be deployed to platforms like Render, Railway, or Heroku.
- **Full-stack**: The `server.ts` is configured to serve the static frontend in production.

## Disclaimer

PocketLawyer provides AI-generated information for educational purposes and is not a substitute for professional legal advice. Always consult with a qualified advocate for critical legal matters.
