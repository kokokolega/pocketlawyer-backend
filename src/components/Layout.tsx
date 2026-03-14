import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Menu, X, Gavel, FileText, Search, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const navLinks = [
    { name: t('common.home'), path: '/', icon: Scale },
    { name: t('common.complaintGenerator'), path: '/generate', icon: FileText },
    { name: t('common.legalGuidance'), path: '/guidance', icon: Gavel },
    { name: t('common.caseResearch'), path: '/research', icon: Search },
    { name: t('common.about'), path: '/about', icon: Info },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2">
              <div className="bg-saffron p-1 sm:p-1.5 rounded-lg">
                <Scale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-navy tracking-tight">PocketLawyer</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-saffron bg-saffron/5'
                    : 'text-navy/70 hover:text-saffron hover:bg-gray-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="ml-2">
              <LanguageSwitcher />
            </div>
            <Link
              to="/generate"
              className="ml-4 bg-saffron text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all shadow-sm"
            >
              {t('common.getStarted')}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-navy p-1.5 sm:p-2 rounded-md hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium text-navy hover:bg-gray-50 hover:text-saffron"
                >
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-navy text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Scale className="h-6 w-6 text-saffron" />
              <span className="text-xl font-bold tracking-tight">PocketLawyer</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              {t('common.disclaimer').split(':')[0]}: {t('common.disclaimer').split(':')[1]}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-saffron">{t('common.quickLinks')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">{t('common.home')}</Link></li>
              <li><Link to="/generate" className="hover:text-white transition-colors">{t('common.complaintGenerator')}</Link></li>
              <li><Link to="/guidance" className="hover:text-white transition-colors">{t('common.legalGuidance')}</Link></li>
              <li><Link to="/research" className="hover:text-white transition-colors">{t('common.caseResearch')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-saffron">{t('common.contact')}</h3>
            <ul className="space-y-2 text-gray-400">
              <li>{t('common.supportEmail')}</li>
              <li>{t('common.location')}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} PocketLawyer. {t('common.copyright')}</p>
          <p className="mt-2 text-xs">{t('common.disclaimer')}</p>
        </div>
      </div>
    </footer>
  );
};
