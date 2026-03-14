import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Send, Download, Copy, Printer, CheckCircle, Loader2, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { aiService } from '../services/aiService';

export const ComplaintGenerator = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    location: '',
    opposingParty: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const categories = [
    { key: 'theft', label: t('complaint.categories.theft') },
    { key: 'cyber', label: t('complaint.categories.cyber') },
    { key: 'fraud', label: t('complaint.categories.fraud') },
    { key: 'harassment', label: t('complaint.categories.harassment') },
    { key: 'domestic', label: t('complaint.categories.domestic') },
    { key: 'property', label: t('complaint.categories.property') },
    { key: 'assault', label: t('complaint.categories.assault') },
    { key: 'other', label: t('complaint.categories.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await aiService.generateComplaint(formData);
      setResult(data.content);
    } catch (error) {
      console.error(error);
      alert('Failed to generate complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      alert('Copied to clipboard!');
    }
  };

  const handlePrint = () => {
    if (!result) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>PocketLawyer - Generated Complaint</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; line-height: 1.6; color: #1A1A2E; }
            h1, h2, h3 { color: #1A1A2E; }
            .content { max-width: 800px; margin: 0 auto; white-space: pre-wrap; }
            @page { margin: 2cm; }
          </style>
        </head>
        <body>
          <div class="content">${result.replace(/\n/g, '<br/>')}</div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy mb-4">{t('complaint.title')}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('complaint.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-navy mb-2">{t('complaint.form.category')}</label>
              <select
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">{t('complaint.form.selectCategory')}</option>
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.label}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">{t('complaint.form.date')}</label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy mb-2">{t('complaint.form.location')}</label>
                <input
                  type="text"
                  placeholder={t('complaint.form.locationPlaceholder')}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">{t('complaint.form.opposingParty')}</label>
              <input
                type="text"
                placeholder={t('complaint.form.opposingPartyPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all"
                value={formData.opposingParty}
                onChange={(e) => setFormData({ ...formData, opposingParty: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">{t('complaint.form.description')}</label>
              <textarea
                required
                rows={5}
                placeholder={t('complaint.form.descriptionPlaceholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-saffron focus:ring-2 focus:ring-saffron/20 outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-2">{t('complaint.form.evidence')}</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-saffron transition-colors cursor-pointer group">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-saffron transition-colors" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-saffron hover:text-orange-500 focus-within:outline-none">
                      <span>{t('complaint.form.uploadFile')}</span>
                      <input type="file" className="sr-only" />
                    </label>
                    <p className="pl-1">{t('complaint.form.dragDrop')}</p>
                  </div>
                  <p className="text-xs text-gray-500">{t('complaint.form.fileTypes')}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-saffron text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-saffron/20 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" /> {t('complaint.form.generating')}
                </>
              ) : (
                <>
                  {t('complaint.form.submit')} <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Result Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-offwhite p-8 rounded-3xl border border-gray-200 min-h-[500px] flex flex-col"
        >
          {result ? (
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-navy flex items-center">
                  <CheckCircle className="text-green-india mr-2 h-5 w-5" /> {t('complaint.result.draft')}
                </h3>
                <div className="flex space-x-2">
                  <button onClick={copyToClipboard} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all" title={t('complaint.result.copy')}>
                    <Copy className="h-4 w-4 text-gray-600" />
                  </button>
                  <button onClick={handlePrint} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-all" title={t('complaint.result.print')}>
                    <Printer className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex-grow overflow-auto prose prose-slate max-w-none">
                <div className="markdown-body">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
              <button className="mt-6 w-full bg-navy text-white py-3 rounded-xl font-semibold flex items-center justify-center hover:bg-navy/90 transition-all">
                <Download className="mr-2 h-5 w-5" /> {t('complaint.result.download')}
              </button>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400">
              <FileText className="h-16 w-16 mb-4 opacity-20" />
              <p className="max-w-xs">
                {t('complaint.result.empty')}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
