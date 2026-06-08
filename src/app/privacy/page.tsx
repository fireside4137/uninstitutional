"use client";

import { useState } from "react";
import Link from "next/link";

const content = {
  en: {
    lang_toggle: "हिंदी",
    title: "Privacy Policy",
    last_updated: "Last Updated: June 2026",
    intro: "UnInstitutional is committed to being privacy-aware and respecting your personal data. This policy explains what data we collect, why, and how you can control it. We believe in data minimization — we only collect what is necessary to provide our exam preparation services.",
    
    s1_title: "1. What Data We Collect",
    s1_body: "When you register and use UnInstitutional, we collect the following information:",
    s1_items: [
      "Account Information — Your name, email address, and phone number (optional) provided during registration.",
      "Exam Preference — The exam type you are preparing for (UKPSC or UKSSC).",
      "Learning Data — Your daily task progress, quiz attempts, scores, topic completion status, and study streaks.",
      "Reward Points — Points earned, transactions, and redemption history.",
      "Bookmarks — Items you save for later reference.",
      "Profile Picture — An optional image you upload, stored as compressed data.",
      "Technical Data — IP addresses and user agent strings are collected for security logging purposes only.",
    ],

    s2_title: "2. Why We Collect This Data",
    s2_body: "We collect data solely to provide and improve the study experience:",
    s2_items: [
      "To create and maintain your learning account.",
      "To assign daily study tasks tailored to your exam syllabus.",
      "To track your progress and identify strong and weak topics.",
      "To operate the quiz engine, scoring, and performance analytics.",
      "To maintain streaks and reward points for engagement.",
      "To secure the platform against abuse and unauthorized access.",
    ],

    s3_title: "3. How Your Data Is Used",
    s3_body: "Your data is used exclusively within the UnInstitutional platform. We do not sell, rent, or share your personal information with third parties for marketing purposes. Your data is used to: personalize your dashboard, generate progress reports, and operate gamification features like streaks and rewards.",

    s4_title: "4. Password Security",
    s4_body: "Your password is never stored in plain text. We use bcrypt hashing — an industry-standard one-way cryptographic algorithm — to protect your password. Even our administrators cannot view your actual password. We recommend using a strong, unique password for your account.",

    s5_title: "5. Learning Progress Data",
    s5_body: "Your learning data (quiz scores, topic progress, daily tasks) is private to your account. Other users cannot see your individual performance data. We may use anonymized, aggregated statistics (e.g., 'average quiz score across all users') to improve the platform, but this data cannot be traced back to you.",

    s6_title: "6. Who Can Access Your Data",
    s6_body: "Access to your personal data is strictly limited:",
    s6_items: [
      "You — You can view, export, and delete your data at any time from your profile settings.",
      "Platform Administrators — Authorized administrators may access account data for platform maintenance and support. They cannot see your password.",
      "Database Security — We use Row Level Security (RLS) policies on our database to prevent unauthorized data access at the infrastructure level.",
    ],

    s7_title: "7. Security Logging",
    s7_body: "We maintain security logs to protect the platform and its users. These logs record events such as: rate limit violations, unauthorized access attempts, and suspicious activity patterns. Security logs may include your user ID, IP address, and request metadata. Sensitive information like passwords, tokens, and cookies are automatically redacted from all logs. Security logs are retained for platform safety and are not used for marketing.",

    s8_title: "8. Premium & Payment Data",
    s8_body: "Currently, premium upgrades are handled through a simulated billing flow. When real payment processing is implemented in the future, we will: use a trusted third-party payment gateway (e.g., Razorpay), never store your full card details on our servers, and update this privacy policy accordingly before any payment features go live.",

    s9_title: "9. Your Rights — Data Export & Account Deletion",
    s9_body: "We believe you should have full control over your data:",
    s9_items: [
      "Export Your Data — You can download a complete copy of your personal data in JSON format from your profile settings at any time.",
      "Delete Your Account — You can permanently delete your account from your profile settings. This action anonymizes your personal information (name, email, phone, profile picture) and makes your account permanently inaccessible.",
      "Contact Us — For any privacy concerns, you may reach out to us through the platform.",
    ],

    s10_title: "10. Data Storage & Infrastructure",
    s10_body: "Your data is stored on secure cloud infrastructure provided by Supabase (PostgreSQL database) and Vercel (application hosting). These providers maintain their own security certifications and compliance standards. Data is transmitted using HTTPS encryption.",

    s11_title: "11. Changes to This Policy",
    s11_body: "We may update this privacy policy from time to time. When we do, we will update the 'Last Updated' date at the top of this page. We encourage you to review this page periodically. Continued use of the platform after changes constitutes acceptance of the updated policy.",

    disclaimer: "Note: UnInstitutional is a privacy-aware platform that follows data minimization principles. We are continuously improving our privacy practices. This policy does not claim full regulatory compliance with specific data protection laws but reflects our genuine commitment to protecting your data.",
    back_home: "← Back to home",
  },
  hi: {
    lang_toggle: "English",
    title: "गोपनीयता नीति",
    last_updated: "अंतिम अपडेट: जून 2026",
    intro: "UnInstitutional आपकी व्यक्तिगत डेटा का सम्मान करने और गोपनीयता-जागरूक रहने के लिए प्रतिबद्ध है। यह नीति बताती है कि हम कौन सा डेटा एकत्र करते हैं, क्यों, और आप इसे कैसे नियंत्रित कर सकते हैं। हम डेटा न्यूनीकरण में विश्वास करते हैं — हम केवल वही एकत्र करते हैं जो हमारी परीक्षा तैयारी सेवाएं प्रदान करने के लिए आवश्यक है।",
    
    s1_title: "1. हम कौन सा डेटा एकत्र करते हैं",
    s1_body: "जब आप UnInstitutional पर रजिस्टर करते हैं और उपयोग करते हैं, तो हम निम्नलिखित जानकारी एकत्र करते हैं:",
    s1_items: [
      "खाता जानकारी — रजिस्ट्रेशन के दौरान प्रदान किया गया आपका नाम, ईमेल पता, और फ़ोन नंबर (वैकल्पिक)।",
      "परीक्षा वरीयता — आप जिस परीक्षा की तैयारी कर रहे हैं (UKPSC या UKSSC)।",
      "अध्ययन डेटा — आपकी दैनिक कार्य प्रगति, क्विज़ प्रयास, स्कोर, टॉपिक पूर्णता स्थिति, और अध्ययन स्ट्रीक।",
      "इनाम अंक — अर्जित अंक, लेनदेन, और रिडीम्प्शन इतिहास।",
      "बुकमार्क — बाद में संदर्भ के लिए आपके द्वारा सहेजी गई वस्तुएं।",
      "प्रोफ़ाइल फ़ोटो — आपके द्वारा अपलोड की गई वैकल्पिक छवि, संपीड़ित डेटा के रूप में संग्रहीत।",
      "तकनीकी डेटा — IP पते और उपयोगकर्ता एजेंट स्ट्रिंग केवल सुरक्षा लॉगिंग उद्देश्यों के लिए एकत्र किए जाते हैं।",
    ],

    s2_title: "2. हम यह डेटा क्यों एकत्र करते हैं",
    s2_body: "हम केवल अध्ययन अनुभव प्रदान करने और सुधारने के लिए डेटा एकत्र करते हैं:",
    s2_items: [
      "आपका अध्ययन खाता बनाने और बनाए रखने के लिए।",
      "आपके परीक्षा पाठ्यक्रम के अनुसार दैनिक अध्ययन कार्य सौंपने के लिए।",
      "आपकी प्रगति को ट्रैक करने और मजबूत और कमजोर टॉपिक की पहचान करने के लिए।",
      "क्विज़ इंजन, स्कोरिंग, और प्रदर्शन विश्लेषण संचालित करने के लिए।",
      "जुड़ाव के लिए स्ट्रीक और इनाम अंक बनाए रखने के लिए।",
      "दुरुपयोग और अनधिकृत पहुंच से प्लेटफ़ॉर्म को सुरक्षित करने के लिए।",
    ],

    s3_title: "3. आपका डेटा कैसे उपयोग किया जाता है",
    s3_body: "आपका डेटा विशेष रूप से UnInstitutional प्लेटफ़ॉर्म के भीतर उपयोग किया जाता है। हम मार्केटिंग उद्देश्यों के लिए आपकी व्यक्तिगत जानकारी तीसरे पक्ष को नहीं बेचते, किराए पर नहीं देते, या साझा नहीं करते। आपका डेटा इनके लिए उपयोग किया जाता है: आपका डैशबोर्ड वैयक्तिकृत करना, प्रगति रिपोर्ट तैयार करना, और स्ट्रीक और इनाम जैसी गेमिफिकेशन सुविधाएं संचालित करना।",

    s4_title: "4. पासवर्ड सुरक्षा",
    s4_body: "आपका पासवर्ड कभी भी सादे पाठ में संग्रहीत नहीं होता। हम bcrypt हैशिंग — एक उद्योग-मानक एकतरफ़ा क्रिप्टोग्राफ़िक एल्गोरिथम — का उपयोग करके आपके पासवर्ड की सुरक्षा करते हैं। हमारे प्रशासक भी आपका वास्तविक पासवर्ड नहीं देख सकते। हम अनुशंसा करते हैं कि आप अपने खाते के लिए एक मजबूत, अद्वितीय पासवर्ड का उपयोग करें।",

    s5_title: "5. अध्ययन प्रगति डेटा",
    s5_body: "आपका अध्ययन डेटा (क्विज़ स्कोर, टॉपिक प्रगति, दैनिक कार्य) आपके खाते के लिए निजी है। अन्य उपयोगकर्ता आपका व्यक्तिगत प्रदर्शन डेटा नहीं देख सकते। हम प्लेटफ़ॉर्म को बेहतर बनाने के लिए अनाम, समेकित आंकड़ों का उपयोग कर सकते हैं, लेकिन यह डेटा आपसे जोड़ा नहीं जा सकता।",

    s6_title: "6. आपके डेटा तक कौन पहुंच सकता है",
    s6_body: "आपके व्यक्तिगत डेटा तक पहुंच सख्ती से सीमित है:",
    s6_items: [
      "आप — आप अपनी प्रोफ़ाइल सेटिंग्स से कभी भी अपना डेटा देख, निर्यात, और हटा सकते हैं।",
      "प्लेटफ़ॉर्म प्रशासक — अधिकृत प्रशासक प्लेटफ़ॉर्म रखरखाव और सहायता के लिए खाता डेटा तक पहुंच सकते हैं। वे आपका पासवर्ड नहीं देख सकते।",
      "डेटाबेस सुरक्षा — हम बुनियादी ढांचे के स्तर पर अनधिकृत डेटा पहुंच को रोकने के लिए अपने डेटाबेस पर Row Level Security (RLS) नीतियां उपयोग करते हैं।",
    ],

    s7_title: "7. सुरक्षा लॉगिंग",
    s7_body: "हम प्लेटफ़ॉर्म और इसके उपयोगकर्ताओं की सुरक्षा के लिए सुरक्षा लॉग बनाए रखते हैं। ये लॉग रेट लिमिट उल्लंघन, अनधिकृत पहुंच प्रयास, और संदिग्ध गतिविधि पैटर्न जैसी घटनाओं को रिकॉर्ड करते हैं। सुरक्षा लॉग में आपकी उपयोगकर्ता ID, IP पता, और अनुरोध मेटाडेटा शामिल हो सकता है। पासवर्ड, टोकन, और कुकीज़ जैसी संवेदनशील जानकारी सभी लॉग से स्वचालित रूप से हटा दी जाती है। सुरक्षा लॉग प्लेटफ़ॉर्म सुरक्षा के लिए रखे जाते हैं और मार्केटिंग के लिए उपयोग नहीं किए जाते।",

    s8_title: "8. प्रीमियम और भुगतान डेटा",
    s8_body: "वर्तमान में, प्रीमियम अपग्रेड एक अनुकरित बिलिंग प्रवाह के माध्यम से संभाले जाते हैं। जब भविष्य में वास्तविक भुगतान प्रसंस्करण लागू किया जाएगा, तो हम: एक विश्वसनीय तृतीय-पक्ष भुगतान गेटवे (जैसे, Razorpay) का उपयोग करेंगे, आपके पूर्ण कार्ड विवरण हमारे सर्वर पर कभी संग्रहीत नहीं करेंगे, और किसी भी भुगतान सुविधा के लाइव होने से पहले इस गोपनीयता नीति को तदनुसार अपडेट करेंगे।",

    s9_title: "9. आपके अधिकार — डेटा निर्यात और खाता हटाना",
    s9_body: "हम मानते हैं कि आपको अपने डेटा पर पूर्ण नियंत्रण होना चाहिए:",
    s9_items: [
      "अपना डेटा निर्यात करें — आप कभी भी अपनी प्रोफ़ाइल सेटिंग्स से JSON प्रारूप में अपने व्यक्तिगत डेटा की पूर्ण प्रति डाउनलोड कर सकते हैं।",
      "अपना खाता हटाएं — आप अपनी प्रोफ़ाइल सेटिंग्स से स्थायी रूप से अपना खाता हटा सकते हैं। यह कार्रवाई आपकी व्यक्तिगत जानकारी (नाम, ईमेल, फ़ोन, प्रोफ़ाइल फ़ोटो) को अनामिक कर देती है और आपका खाता स्थायी रूप से अगम्य बना देती है।",
      "हमसे संपर्क करें — किसी भी गोपनीयता चिंता के लिए, आप प्लेटफ़ॉर्म के माध्यम से हमसे संपर्क कर सकते हैं।",
    ],

    s10_title: "10. डेटा भंडारण और बुनियादी ढांचा",
    s10_body: "आपका डेटा Supabase (PostgreSQL डेटाबेस) और Vercel (एप्लिकेशन होस्टिंग) द्वारा प्रदान किए गए सुरक्षित क्लाउड बुनियादी ढांचे पर संग्रहीत है। ये प्रदाता अपने स्वयं के सुरक्षा प्रमाणन और अनुपालन मानकों को बनाए रखते हैं। डेटा HTTPS एन्क्रिप्शन का उपयोग करके प्रसारित किया जाता है।",

    s11_title: "11. इस नीति में परिवर्तन",
    s11_body: "हम समय-समय पर इस गोपनीयता नीति को अपडेट कर सकते हैं। जब हम ऐसा करेंगे, तो हम इस पृष्ठ के शीर्ष पर 'अंतिम अपडेट' तिथि को अपडेट करेंगे। हम आपको समय-समय पर इस पृष्ठ की समीक्षा करने के लिए प्रोत्साहित करते हैं। परिवर्तनों के बाद प्लेटफ़ॉर्म का निरंतर उपयोग अपडेट की गई नीति की स्वीकृति माना जाता है।",

    disclaimer: "नोट: UnInstitutional एक गोपनीयता-जागरूक प्लेटफ़ॉर्म है जो डेटा न्यूनीकरण सिद्धांतों का पालन करता है। हम लगातार अपनी गोपनीयता प्रथाओं में सुधार कर रहे हैं। यह नीति विशिष्ट डेटा संरक्षण कानूनों के पूर्ण नियामक अनुपालन का दावा नहीं करती, लेकिन आपके डेटा की सुरक्षा के प्रति हमारी वास्तविक प्रतिबद्धता को दर्शाती है।",
    back_home: "← होम पर वापस जाएं",
  },
};

type Lang = "en" | "hi";

interface SectionProps {
  title: string;
  body: string;
  items?: string[];
}

function Section({ title, body, items }: SectionProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-sora text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{body}</p>
      {items && items.length > 0 && (
        <ul className="space-y-2 pl-1">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="text-blue-500 font-bold mt-0.5 shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PrivacyPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = content[lang];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Top bar */}
      <div className="px-6 py-4 md:px-8 flex justify-between items-center max-w-4xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm font-sora shadow-sm">
            UI
          </div>
          <span className="font-extrabold text-base text-slate-900 dark:text-white font-sora">UnInstitutional</span>
        </Link>
        <button
          onClick={() => setLang(lang === "en" ? "hi" : "en")}
          className="bg-transparent border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full px-4 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer transition-all"
        >
          {t.lang_toggle}
        </button>
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-sm space-y-8 transition-colors duration-300">
          {/* Header */}
          <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <h1 className="font-sora text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
                {t.title}
              </h1>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.last_updated}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-2">{t.intro}</p>
          </div>

          {/* Sections */}
          <Section title={t.s1_title} body={t.s1_body} items={t.s1_items} />
          <Section title={t.s2_title} body={t.s2_body} items={t.s2_items} />
          <Section title={t.s3_title} body={t.s3_body} />
          <Section title={t.s4_title} body={t.s4_body} />
          <Section title={t.s5_title} body={t.s5_body} />
          <Section title={t.s6_title} body={t.s6_body} items={t.s6_items} />
          <Section title={t.s7_title} body={t.s7_body} />
          <Section title={t.s8_title} body={t.s8_body} />
          <Section title={t.s9_title} body={t.s9_body} items={t.s9_items} />
          <Section title={t.s10_title} body={t.s10_body} />
          <Section title={t.s11_title} body={t.s11_body} />

          {/* Disclaimer */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic leading-relaxed">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="py-8 text-center">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            {t.back_home}
          </Link>
        </div>
      </main>
    </div>
  );
}
