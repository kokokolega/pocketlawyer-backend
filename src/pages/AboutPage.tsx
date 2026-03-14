import React from 'react';
import { motion } from 'motion/react';
import { Scale, Target, Users, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AboutPage = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-saffron/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
        >
          <Scale className="h-10 w-10 text-saffron" />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-navy mb-6">{t('about.title')}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        {[
          {
            title: t('about.mission.title'),
            desc: t('about.mission.description'),
            icon: Target,
            color: 'bg-blue-500'
          },
          {
            title: t('about.vision.title'),
            desc: t('about.vision.description'),
            icon: Users,
            color: 'bg-green-india'
          },
          {
            title: t('about.values.title'),
            desc: t('about.values.description'),
            icon: ShieldCheck,
            color: 'bg-saffron'
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center"
          >
            <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-black/5`}>
              <item.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-navy mb-4">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-navy rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">{t('about.why.title')}</h2>
          <div className="space-y-6">
            <p className="text-gray-400 text-lg">
              {t('about.why.description')}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                t('about.why.feat1'),
                t('about.why.feat2'),
                t('about.why.feat3'),
                t('about.why.feat4')
              ].map((feature) => (
                <li key={feature} className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-saffron" />
                  <span className="font-semibold">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-saffron/10 -skew-x-12 translate-x-1/2" />
      </div>
    </div>
  );
};
