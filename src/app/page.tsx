"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const translations = {
  en: {
    nav_home: "Home",
    nav_about: "Features",
    nav_contact: "Contact Us",
    lang_toggle: "हिंदी",
    hero_badge: "BETA RELEASE · Free Forever · No Coaching Required",
    hero_headline_1: "Study Smart.",
    hero_headline_2: "Score Better.",
    hero_sub:
      "Structured daily preparation for Uttarakhand government exams. Free quizzes, topic tracking, and performance analytics — built for serious aspirants.",
    choose_label: "Choose your exam to begin",
    ukpsc_title: "UKPSC",
    ukpsc_full: "Uttarakhand Public Service Commission",
    ukpsc_desc:
      "Civil Services, Combined State, RO/ARO and more. Structured syllabus-based prep.",
    ukpsc_tag: "State Civil Services",
    ukssc_title: "UKSSC",
    ukssc_full: "Uttarakhand Subordinate Service Selection Commission",
    ukssc_desc:
      "Group C & D exams, VDO, Lekhpal, Forest Guard and more. Topic-wise daily tasks.",
    ukssc_tag: "Subordinate Services",
    cta: "Start Preparing →",
    features_title: "Everything you need. Nothing you don't.",
    f1_title: "Daily Study Plan",
    f1_desc: "A new topic every day, sequenced by the actual exam syllabus.",
    f2_title: "Smart Quizzes",
    f2_desc: "MCQs after every topic with instant explanations and scoring.",
    f3_title: "Weak Topic Radar",
    f3_desc: "Automatically detects your weak areas and schedules revision.",
    f4_title: "Streak & Rewards",
    f4_desc: "Build daily habits. Earn points. Unlock premium features.",
    f5_title: "Hindi + English",
    f5_desc: "Full bilingual support. Switch anytime, study in your language.",
    f6_title: "Free to Use",
    f6_desc: "Core preparation is completely free. Always will be.",
    stats_users: "Target Aspirants",
    stats_topics: "Syllabus Topics",
    stats_quizzes: "Practice Quizzes",
    stats_exams: "Exams Covered",
    stats_disclaimer: "*Platform beta metrics & projections",
    footer_tagline: "Padho. Apni Tarah.",
    footer_copy: "© 2026 UnInstitutional. Made with ♥ for Uttarakhand.",
    footer_privacy: "Privacy Policy",
  },
  hi: {
    nav_home: "होम",
    nav_about: "विशेषताएं",
    nav_contact: "संपर्क करें",
    nav_contact_href: "mailto:hello@uninstitutional.com",
    lang_toggle: "English",
    hero_badge: "बीटा रिलीज़ · बिल्कुल मुफ्त · कोचिंग की जरूरत नहीं",
    hero_headline_1: "स्मार्ट पढ़ो।",
    hero_headline_2: "बेहतर स्कोर करो।",
    hero_sub:
      "उत्तराखंड सरकारी परीक्षाओं के लिए संरचित दैनिक तैयारी। मुफ्त क्विज़, टॉपिक ट्रैकिंग और प्रदर्शन विश्लेषण — गंभीर उम्मीदवारों के लिए।",
    choose_label: "शुरू करने के लिए अपनी परीक्षा चुनें",
    ukpsc_title: "UKPSC",
    ukpsc_full: "उत्तराखंड लोक सेवा आयोग",
    ukpsc_desc:
      "सिविल सेवा, संयुक्त राज्य, RO/ARO और अधिक। सिलेबस आधारित तैयारी।",
    ukpsc_tag: "राज्य सिविल सेवाएं",
    ukssc_title: "UKSSC",
    ukssc_full: "उत्तराखंड अधीनस्थ सेवा चयन आयोग",
    ukssc_desc:
      "ग्रुप C और D, VDO, लेखपाल, फॉरेस्ट गार्ड और अधिक। टॉपिक-वार दैनिक कार्य।",
    ukssc_tag: "अधीनस्थ सेवाएं",
    cta: "तैयारी शुरू करें →",
    features_title: "जो चाहिए वो सब। जो नहीं चाहिए वो कुछ नहीं।",
    f1_title: "दैनिक अध्ययन योजना",
    f1_desc: "हर दिन एक नया टॉपिक, वास्तविक सिलेबस के अनुसार।",
    f2_title: "स्मार्ट क्विज़",
    f2_desc: "हर टॉपिक के बाद MCQ, तत्काल स्पष्टीकरण के साथ।",
    f3_title: "कमजोर टॉपिक रडार",
    f3_desc: "कमजोर क्षेत्रों को स्वतः पहचानता है और रिवीजन शेड्यूल करता है।",
    f4_title: "स्ट्रीक और इनाम",
    f4_desc: "रोज़ाना पढ़ने की आदत बनाएं। पॉइंट्स कमाएं।",
    f5_title: "हिंदी + अंग्रेजी",
    f5_desc: "पूर्ण द्विभाषी समर्थन। कभी भी बदलें।",
    f6_title: "बिल्कुल मुफ्त",
    f6_desc: "मूल तैयारी पूरी तरह मुफ्त है। हमेशा रहेगी।",
    stats_users: "लक्षित उम्मीदवार",
    stats_topics: "सिलेबस विषय",
    stats_quizzes: "अभ्यास क्विज़",
    stats_exams: "परीक्षाएं कवर",
    stats_disclaimer: "*प्लेटफ़ॉर्म बीटा मेट्रिक्स और अनुमान",
    footer_tagline: "पढ़ो। अपनी तरह।",
    footer_copy: "© 2026 UnInstitutional। उत्तराखंड के लिए ♥ से बना।",
    footer_privacy: "गोपनीयता नीति",
  },
};

type Lang = "en" | "hi";

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [hovered, setHovered] = useState<"ukpsc" | "ukssc" | null>(null);
  const router = useRouter();
  const t = translations[lang];

  // Sync lang from localStorage on initial render
  useEffect(() => {
    if (typeof window !== "undefined") {
      const persisted = localStorage.getItem("ui-lang") as Lang;
      if (persisted === "hi" || persisted === "en") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLang(persisted);
      }
    }
  }, []);

  const handleLangToggle = () => {
    const nextLang = lang === "en" ? "hi" : "en";
    setLang(nextLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-lang", nextLang);
    }
  };

  const handleExamClick = (exam: "ukpsc" | "ukssc") => {
    router.push(`/auth/login?exam=${exam}`);
  };

  const features = [
    { icon: "📅", title: t.f1_title, desc: t.f1_desc },
    { icon: "🎯", title: t.f2_title, desc: t.f2_desc },
    { icon: "📊", title: t.f3_title, desc: t.f3_desc },
    { icon: "🔥", title: t.f4_title, desc: t.f4_desc },
    { icon: "🌐", title: t.f5_title, desc: t.f5_desc },
    { icon: "✅", title: t.f6_title, desc: t.f6_desc },
  ];

  const stats = [
    { value: "10,000+", label: t.stats_users },
    { value: "500+", label: t.stats_topics },
    { value: "100,000+", label: t.stats_quizzes },
    { value: "2", label: t.stats_exams },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 antialiased font-sans flex flex-col justify-between">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center justify-between max-w-7xl w-full mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm font-sora shadow-sm">
            UI
          </div>
          <span className="font-extrabold text-base text-slate-900 font-sora">
            UnInstitutional
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            {t.nav_home}
          </Link>
          <a href="#features" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            {t.nav_about}
          </a>
          <a href="mailto:hello@uninstitutional.com" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            {t.nav_contact}
          </a>
          <button 
            className="bg-transparent border border-slate-300 hover:bg-blue-600 hover:border-blue-600 hover:text-white rounded-full px-3.5 py-1 text-xs font-bold text-slate-600 cursor-pointer transition-all"
            onClick={handleLangToggle}
          >
            {t.lang_toggle}
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex-1 flex flex-col justify-center px-6 py-16 md:py-24 max-w-5xl mx-auto w-full space-y-12">
        {/* Badge */}
        <div className="animate-fade-in">
          <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-blue-200 shadow-sm">
            {t.hero_badge}
          </span>
        </div>

        {/* Headlines */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="font-sora text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
            {t.hero_headline_1}
            <span className="block text-blue-600 mt-1">{t.hero_headline_2}</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-500 leading-relaxed max-w-xl">
            {t.hero_sub}
          </p>
        </div>

        {/* Exam Cards Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {t.choose_label}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UKPSC Card */}
            <div
              className={`group bg-white border rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                hovered === "ukpsc" 
                  ? "border-blue-500 shadow-xl -translate-y-1" 
                  : "border-slate-200 hover:border-blue-200"
              }`}
              onClick={() => handleExamClick("ukpsc")}
              onMouseEnter={() => setHovered("ukpsc")}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 transition-opacity duration-300" />
              
              {/* Background Watermark Logo */}
              <div className="absolute -right-8 -bottom-8 w-44 h-44 pointer-events-none select-none transition-all duration-500 ease-out transform group-hover:scale-110 group-hover:rotate-6 text-blue-600/5 dark:text-blue-400/5">
                <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
                  <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
                  <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
                  {/* Himalayan peaks in background */}
                  <path d="M 20,110 L 60,60 L 100,110 M 70,110 L 115,45 L 160,110 M 130,110 L 165,70 L 200,110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.25" />
                  {/* Official building dome and columns */}
                  <path d="M 85,75 A 15,15 0 0,1 115,75 Z" fill="currentColor" opacity="0.4" />
                  <polygon points="75,80 100,68 125,80" fill="currentColor" opacity="0.5" />
                  <rect x="75" y="80" width="50" height="4" fill="currentColor" opacity="0.5" />
                  <rect x="78" y="84" width="4" height="24" fill="currentColor" opacity="0.4" />
                  <rect x="90" y="84" width="4" height="24" fill="currentColor" opacity="0.4" />
                  <rect x="106" y="84" width="4" height="24" fill="currentColor" opacity="0.4" />
                  <rect x="118" y="84" width="4" height="24" fill="currentColor" opacity="0.4" />
                  <rect x="70" y="108" width="60" height="4" fill="currentColor" opacity="0.5" />
                  <rect x="65" y="112" width="70" height="4" fill="currentColor" opacity="0.6" />
                  <text x="100" y="170" textAnchor="middle" fontSize="22" fontWeight="900" letterSpacing="3" fontFamily="var(--font-sora), sans-serif">UKPSC</text>
                </svg>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                    hovered === "ukpsc" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {t.ukpsc_tag}
                  </span>
                  <span className="text-2xl">🏛️</span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="font-sora text-2xl font-extrabold text-slate-900">{t.ukpsc_title}</h2>
                  <p className="text-xs font-bold text-slate-400">{t.ukpsc_full}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.ukpsc_desc}</p>
              </div>

              <div className="pt-6 relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleExamClick("ukpsc"); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  {t.cta}
                </button>
              </div>
            </div>

            {/* UKSSC Card */}
            <div
              className={`group bg-white border rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                hovered === "ukssc" 
                  ? "border-emerald-500 shadow-xl -translate-y-1" 
                  : "border-slate-200 hover:border-emerald-200"
              }`}
              onClick={() => handleExamClick("ukssc")}
              onMouseEnter={() => setHovered("ukssc")}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 transition-opacity duration-300" />
              
              {/* Background Watermark Logo */}
              <div className="absolute -right-8 -bottom-8 w-44 h-44 pointer-events-none select-none transition-all duration-500 ease-out transform group-hover:scale-110 group-hover:rotate-6 text-emerald-600/5 dark:text-emerald-400/5">
                <svg viewBox="0 0 200 200" className="w-full h-full fill-current">
                  <polygon points="100,5 182,52 182,148 100,195 18,148 18,52" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                  <polygon points="100,10 174,55 174,145 100,190 26,145 26,55" fill="none" stroke="currentColor" strokeWidth="1" />
                  {/* Clipboard structure with checks and lines */}
                  <rect x="65" y="45" width="70" height="90" rx="8" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
                  <rect x="85" y="37" width="30" height="12" rx="3" fill="currentColor" opacity="0.5" />
                  <circle cx="100" cy="32" r="3" fill="currentColor" opacity="0.5" />
                  {/* Checkmarks & Document lines */}
                  <path d="M 75,69 L 79,73 L 86,65" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  <line x1="92" y1="69" x2="125" y2="69" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                  <path d="M 75,89 L 79,93 L 86,85" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  <line x1="92" y1="89" x2="125" y2="89" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                  <path d="M 75,109 L 79,113 L 86,105" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  <line x1="92" y1="109" x2="125" y2="109" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
                  <text x="100" y="165" textAnchor="middle" fontSize="22" fontWeight="900" letterSpacing="3" fontFamily="var(--font-sora), sans-serif">UKSSC</text>
                </svg>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full transition-colors ${
                    hovered === "ukssc" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {t.ukssc_tag}
                  </span>
                  <span className="text-2xl">📋</span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="font-sora text-2xl font-extrabold text-slate-900">{t.ukssc_title}</h2>
                  <p className="text-xs font-bold text-slate-400">{t.ukssc_full}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{t.ukssc_desc}</p>
              </div>

              <div className="pt-6 relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleExamClick("ukssc"); }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                >
                  {t.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DISCLOSED DEMO STATS BAR */}
      <section className="bg-slate-950 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="font-sora text-3xl md:text-4xl font-extrabold text-white">
                  {s.value}
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-center text-slate-500 italic">
            {t.stats_disclaimer}
          </p>
        </div>
      </section>

      {/* FEATURES DETAILS */}
      <section id="features" className="py-16 md:py-24 px-6 max-w-5xl mx-auto w-full space-y-12">
        <h2 className="font-sora text-2xl sm:text-3xl font-extrabold text-slate-950 leading-snug max-w-lg">
          {t.features_title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:shadow-md transition-all">
              <span className="text-3xl block">{f.icon}</span>
              <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-xs font-sora shadow-sm">
              UI
            </div>
            <div>
              <span className="font-extrabold text-sm text-slate-900 font-sora block">UnInstitutional</span>
              <span className="text-[10px] text-slate-400 font-medium block leading-none">{t.footer_tagline}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {t.footer_copy}
          </p>
          <Link href="/privacy" className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
            {t.footer_privacy}
          </Link>
        </div>
      </footer>

    </div>
  );
}