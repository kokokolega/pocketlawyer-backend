import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, BookOpen, ExternalLink, Loader2, Scale } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { aiService } from '../services/aiService';

export const CaseResearch = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      const data = await aiService.searchCases(query);
      setResults(data.content);
    } catch (error) {
      console.error(error);
      alert('Failed to research cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-4">{t('research.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('research.subtitle')}
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-16">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder={t('research.form.searchPlaceholder')}
            className="w-full pl-14 pr-32 py-5 rounded-2xl border-2 border-gray-100 focus:border-saffron focus:ring-4 focus:ring-saffron/10 outline-none transition-all text-lg shadow-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-saffron text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('common.search')}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Popular:</span>
          {['Cyber Crime', 'Property Law', 'Consumer Rights', 'Landmark Judgments'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="text-xs font-medium text-navy/60 bg-gray-100 px-3 py-1 rounded-full hover:bg-saffron/10 hover:text-saffron transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {results ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 gap-8"
        >
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 markdown-body">
            <div className="flex items-center mb-8 pb-4 border-b border-gray-100">
              <BookOpen className="h-6 w-6 text-saffron mr-3" />
              <h2 className="text-2xl font-bold text-navy !m-0">{t('research.result.title')}</h2>
            </div>
            <ReactMarkdown>{results}</ReactMarkdown>
          </div>
          
          <div className="bg-navy text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Need more detailed research?</h3>
              <p className="text-gray-400">Our premium research tools provide access to full court transcripts and AI summaries.</p>
            </div>
            <button className="bg-saffron text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center">
              Upgrade to Pro <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Landmark Cases', desc: 'Explore cases that changed Indian law.', icon: Scale },
            { title: 'Recent Judgments', desc: 'Stay updated with latest court rulings.', icon: BookOpen },
            { title: 'Legal Precedents', desc: 'Find authoritative rules for your case.', icon: Search },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <div className="bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-bold text-navy mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
