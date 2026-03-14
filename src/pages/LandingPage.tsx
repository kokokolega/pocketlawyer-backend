import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, FileText, Gavel, Search, AlertCircle, 
  Phone, Shield, AlertTriangle, User, ShieldAlert, Baby, 
  Stethoscope, HeartPulse, Car, Flame, Wind, Train, 
  MapPin, UserCheck, Brain, Ban, Vote, Droplets, Zap, 
  ShoppingBag, IndianRupee, Activity, Siren, Navigation, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FeatureCard = ({ icon: Icon, title, description, link }: any) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
    >
      <div className="bg-saffron/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-saffron" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-navy">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{description}</p>
      <Link to={link} className="text-saffron font-semibold flex items-center text-sm hover:underline">
        {t('common.getStarted')} <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    </motion.div>
  );
};

const HelplineCard = ({ icon: Icon, name, number, descEn, descHi }: any) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      whileHover={{ y: -3 }}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="bg-green-india/10 p-2.5 rounded-xl">
          <Icon className="h-6 w-6 text-green-india" />
        </div>
        <span className="text-2xl font-black text-navy tracking-tighter">{number}</span>
      </div>
      <h3 className="text-lg font-bold text-navy mb-1">{name}</h3>
      <div className="flex-grow">
        <p className="text-xs text-gray-600 mb-1 leading-tight">{descEn}</p>
        <p className="text-xs text-gray-400 italic leading-tight">{descHi}</p>
      </div>
      <a 
        href={`tel:${number}`}
        className="mt-4 w-full bg-navy text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center hover:bg-saffron transition-colors group"
      >
        <Phone className="h-4 w-4 mr-2 group-hover:animate-bounce" /> {t('landing.emergency.callNow')}
      </a>
    </motion.div>
  );
};

export const LandingPage = () => {
  const { t } = useTranslation();
  const helplines = [
    { icon: Shield, name: "Police Emergency", number: "100", descEn: "Immediate police assistance for crimes and emergencies.", descHi: "अपराध या आपात स्थिति में पुलिस सहायता के लिए।" },
    { icon: AlertTriangle, name: "National Emergency", number: "112", descEn: "India's integrated emergency helpline for police, fire and ambulance.", descHi: "भारत का एकीकृत आपातकालीन नंबर जो पुलिस, फायर और एम्बुलेंस से जोड़ता है।" },
    { icon: User, name: "Women Helpline", number: "1091", descEn: "Support for women facing harassment or violence.", descHi: "महिलाओं के खिलाफ हिंसा या उत्पीड़न की स्थिति में सहायता।" },
    { icon: HeartPulse, name: "Women Domestic Violence", number: "181", descEn: "Assistance for women facing domestic violence.", descHi: "घरेलू हिंसा का सामना कर रही महिलाओं के लिए सहायता।" },
    { icon: ShieldAlert, name: "Cyber Crime Helpline", number: "1930", descEn: "Report online fraud and cyber financial crimes.", descHi: "ऑनलाइन फ्रॉड और साइबर अपराध की शिकायत के लिए।" },
    { icon: Baby, name: "Child Helpline", number: "1098", descEn: "Support for children in distress or danger.", descHi: "संकট বা खतरे में बच्चों के लिए सहायता।" },
    { icon: Stethoscope, name: "Ambulance Emergency", number: "108", descEn: "Emergency medical and ambulance services.", descHi: "चिकित्सा आपातकाल में एम्बुलेंस सेवा।" },
    { icon: HeartPulse, name: "Health Helpline", number: "104", descEn: "Government health advice and assistance services.", descHi: "सरकारी स्वास्थ्य सलाह और सहायता सेवा।" },
    { icon: Car, name: "Road Accident Emergency", number: "1073", descEn: "National highway accident emergency helpline.", descHi: "राष्ट्रीय राजमार्ग दुर्घटना सहायता हेल्पलाइन।" },
    { icon: Flame, name: "Fire Emergency", number: "101", descEn: "Fire brigade emergency assistance.", descHi: "आग लगने की स्थिति में फायर ब्रिगेड सहायता।" },
    { icon: Wind, name: "Disaster Management", number: "1078", descEn: "Assistance during natural disasters and emergencies.", descHi: "प्राकृतिक आपदाओं के दौरान सहायता।" },
    { icon: Train, name: "Railway Helpline", number: "139", descEn: "Passenger assistance and railway inquiries.", descHi: "रेलवे यात्रियों के लिए सहायता और जानकारी।" },
    { icon: Shield, name: "Railway Security", number: "182", descEn: "Security assistance for railway passengers.", descHi: "रेलवे यात्रियों की सुरक्षा के लिए हेल्पलाइन।" },
    { icon: MapPin, name: "Tourist Helpline", number: "1363", descEn: "Assistance for tourists across India.", descHi: "भारत में पर्यटकों के लिए सहायता सेवा।" },
    { icon: UserCheck, name: "Senior Citizen Helpline", number: "14567", descEn: "Support services for senior citizens.", descHi: "वरिष्ठ नागरिकों के लिए सहायता सेवा।" },
    { icon: Brain, name: "Mental Health (Kiran)", number: "1800-599-0019", descEn: "Mental health counseling and support.", descHi: "मानसिक स्वास्थ्य सहायता और परामर्श सेवा।" },
    { icon: Ban, name: "Anti Corruption", number: "1031", descEn: "Report corruption related issues.", descHi: "भ्रष्टाचार से संबंधित शिकायत दर्ज करने के लिए।" },
    { icon: Vote, name: "Election Commission", number: "1950", descEn: "Voter information and election assistance.", descHi: "मतदाता जानकारी और चुनाव सहायता।" },
    { icon: Droplets, name: "Gas Leakage Emergency", number: "1906", descEn: "LPG gas leakage emergency assistance.", descHi: "गैस रिसाव की स्थिति में सहायता।" },
    { icon: Zap, name: "Electricity Complaint", number: "1912", descEn: "Electricity service complaints and support.", descHi: "बिजली सेवा शिकायत और सहायता।" },
    { icon: ShoppingBag, name: "Consumer Helpline", number: "1800-11-4000", descEn: "Assistance for consumer rights and complaints.", descHi: "उपभोक्ता अधिकार और शिकायत सहायता।" },
    { icon: IndianRupee, name: "Income Tax Helpline", number: "1800-180-1961", descEn: "Assistance related to income tax queries.", descHi: "आयकर से संबंधित सहायता।" },
    { icon: Activity, name: "National AIDS Helpline", number: "1097", descEn: "Information and support regarding HIV/AIDS.", descHi: "एचआईवी/एड्स से संबंधित जानकारी और सहायता।" },
    { icon: Siren, name: "Anti Ragging Helpline", number: "1800-180-5522", descEn: "Report ragging incidents in educational institutions.", descHi: "शैक्षणिक संस्थानों में रैगिंग की शिकायत के लिए।" },
    { icon: Navigation, name: "Traffic Helpline", number: "1073", descEn: "Report traffic incidents and highway emergencies.", descHi: "ट्रैफिक या हाईवे दुर्घटना की सूचना देने के लिए।" },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 tricolor-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-green-india bg-green-india/10 rounded-full">
              {t('landing.hero.badge')}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-navy mb-6 tracking-tight">
              {t('landing.hero.headline').split('–')[0]} – <br />
              <span className="text-saffron">{t('landing.hero.headline').split('–')[1]}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {t('landing.hero.subheadline')}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/generate"
                className="bg-saffron text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-orange-600 transition-all shadow-lg shadow-saffron/20 flex items-center justify-center"
              >
                {t('landing.hero.ctaGenerate')} <FileText className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/guidance"
                className="bg-white text-navy border-2 border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                {t('landing.hero.ctaGuidance')} <Gavel className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-x-1/2 w-64 h-64 bg-saffron/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 w-96 h-96 bg-green-india/5 rounded-full blur-3xl" />
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                {t('landing.problem.headline')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('landing.problem.subheadline')}
              </p>
              <div className="space-y-6">
                {[
                  { label: t('landing.problem.stat1'), icon: AlertCircle },
                  { label: t('landing.problem.stat2'), icon: AlertCircle },
                  { label: t('landing.problem.stat3'), icon: AlertCircle },
                  { label: t('landing.problem.stat4'), icon: AlertCircle },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="mt-1 bg-red-50 p-1 rounded">
                      <item.icon className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="text-gray-700 font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 relative">
              <div className="absolute -top-4 -right-4 bg-saffron text-white p-4 rounded-2xl shadow-lg">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <img 
                src="https://picsum.photos/seed/legal/800/600" 
                alt="Justice" 
                className="rounded-2xl shadow-sm w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">{t('landing.features.headline')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing.features.subheadline')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={FileText}
              title={t('landing.features.feat1.title')}
              description={t('landing.features.feat1.description')}
              link="/generate"
            />
            <FeatureCard 
              icon={Gavel}
              title={t('landing.features.feat2.title')}
              description={t('landing.features.feat2.description')}
              link="/guidance"
            />
            <FeatureCard 
              icon={Search}
              title={t('landing.features.feat3.title')}
              description={t('landing.features.feat3.description')}
              link="/research"
            />
            <FeatureCard 
              icon={ShieldCheck}
              title={t('landing.features.feat4.title')}
              description={t('landing.features.feat4.description')}
              link="/generate"
            />
            <FeatureCard 
              icon={MessageSquare}
              title={t('landing.features.feat5.title')}
              description={t('landing.features.feat5.description')}
              link="/guidance"
            />
          </div>
        </div>
      </section>

      {/* Emergency Help Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-2">{t('landing.emergency.headline')}</h2>
            <h3 className="text-xl md:text-2xl font-medium text-saffron mb-4">अपने अधिकार और आपातकालीन सहायता</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('landing.emergency.subheadline')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {helplines.map((help, i) => (
              <HelplineCard key={i} {...help} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('landing.cta.headline')}
          </h2>
          <p className="text-gray-400 mb-10 max-w-xl mx-auto">
            {t('landing.cta.subheadline')}
          </p>
          <Link
            to="/generate"
            className="inline-block bg-saffron text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-orange-600 transition-all shadow-xl shadow-saffron/10"
          >
            {t('landing.cta.button')}
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-saffron/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-india/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </section>
    </div>
  );
};
