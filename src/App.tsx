import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar, Footer } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ComplaintGenerator } from './pages/ComplaintGenerator';
import { LegalGuidance } from './pages/LegalGuidance';
import Research from './pages/research';
import { CaseResearch } from './pages/CaseResearch';
import { AboutPage } from './pages/AboutPage';
import AiAssistant from "./pages/AiAssistant";
const MetadataUpdater = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t('metadata.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('metadata.description'));
    }
    document.documentElement.lang = i18n.language;
  }, [t, i18n.language]);

  return null;
};

export default function App() {
  return (
    <Router>
      <MetadataUpdater />

      <Navbar />

      <Routes>

  {/* ✅ Dashboard page */}
  <Route path="/dashboard" element={<CaseResearch />} />

  {/* ✅ AI Research page */}
  <Route path="/research" element={<Research />} />

  <Route path="/ai-assistant" element={<AiAssistant />} />

  {/* baaki pages */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/generate" element={<ComplaintGenerator />} />
  <Route path="/guidance" element={<LegalGuidance />} />
  <Route path="/about" element={<AboutPage />} />

</Routes>

      <Footer />
    </Router>
  );
}