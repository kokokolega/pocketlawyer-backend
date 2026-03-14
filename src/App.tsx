import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar, Footer } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ComplaintGenerator } from './pages/ComplaintGenerator';
import { LegalGuidance } from './pages/LegalGuidance';
import { CaseResearch } from './pages/CaseResearch';
import { AboutPage } from './pages/AboutPage';

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
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/generate" element={<ComplaintGenerator />} />
            <Route path="/guidance" element={<LegalGuidance />} />
            <Route path="/research" element={<CaseResearch />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
