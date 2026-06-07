"use client";

import { useLang } from "@/components/providers/LangProvider";
import Link from "next/link";
import { useState, useEffect } from "react";

const t = {
  en: {
    title: "Learning Progress & Analytics",
    subtitle: "Track your real-time syllabus coverage, quiz accuracy rates, and milestones.",
    backBtn: "← Back to Dashboard",
    syllabusCoverage: "Syllabus Coverage",
    accuracyRate: "Average Accuracy",
    questionsSol: "Questions Solved",
    studyHours: "Study Hours",
    subjectProgress: "Subject-wise Coverage",
    strongTopics: "Stellar Performance",
    strongTopicsSub: "Topics where you scored 80% or higher",
    weakTopics: "Requires Attention",
    weakTopicsSub: "Recommended for immediate review and re-reading",
    statsHeader: "Syllabus Milestones",
    accuracyText: "Superb! You are on track to master these exams.",
    topicsDone: "Topics Completed",
    quizzesTaken: "Practice Quizzes Submissions",
    loadingProgress: "Fetching your personalized analytics...",
    noStrong: "Complete topic quizzes with high scores to display strong areas here!",
    noWeak: "Keep taking quizzes! Topics with low accuracy will show up here.",
  },
  hi: {
    title: "सीखने की प्रगति और विश्लेषिकी",
    subtitle: "अपने वास्तविक समय के पाठ्यक्रम कवरेज, क्विज़ सटीकता दर और मील के पत्थर को ट्रैक करें।",
    backBtn: "← डैशबोर्ड पर वापस जाएं",
    syllabusCoverage: "पाठ्यक्रम कवरेज",
    accuracyRate: "औसत सटीकता",
    questionsSol: "हल किए गए प्रश्न",
    studyHours: "अध्ययन के घंटे",
    subjectProgress: "विषयवार कवरेज",
    strongTopics: "उत्कृष्ट प्रदर्शन",
    strongTopicsSub: "वे विषय जहां आपने 80% या उससे अधिक स्कोर किया",
    weakTopics: "ध्यान देने की आवश्यकता है",
    weakTopicsSub: "तत्काल रिवीजन और पुनः पढ़ने के लिए अनुशंसित",
    statsHeader: "पाठ्यक्रम के मील के पत्थर",
    accuracyText: "शानदार! आप इन परीक्षाओं में महारत हासिल करने की राह पर हैं।",
    topicsDone: "पूर्ण विषय",
    quizzesTaken: "प्रस्तुत किए गए अभ्यास क्विज़",
    loadingProgress: "आपकी व्यक्तिगत विश्लेषिकी लोड हो रही है...",
    noStrong: "मजबूत क्षेत्रों को यहां प्रदर्शित करने के लिए उच्च अंकों के साथ विषय क्विज़ पूरा करें!",
    noWeak: "क्विज़ लेते रहें! कम सटीकता वाले विषय यहाँ दिखाई देंगे।",
  },
};

interface SubjectCoverage {
  nameEn: string;
  nameHi: string;
  percent: number;
}

interface WeakTopic {
  name: string;
  reason: string;
}

export default function ProgressPage() {
  const { lang } = useLang();
  const tr = t[lang];

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    coverage: 0,
    accuracy: 0,
    solved: 0,
    hours: 0,
    topicsCount: 0,
    quizzesCount: 0,
  });
  const [subjectProgress, setSubjectProgress] = useState<SubjectCoverage[]>([]);
  const [strongTopics, setStrongTopics] = useState<string[]>([]);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);

  // Fetch real-time progress indicators from summary API
  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/summary");
      if (res.ok) {
        const data = await res.json();
        
        setStats({
          coverage: data.user.syllabusPercent || 0,
          accuracy: data.user.avgAccuracy || 0,
          solved: data.user.questionsSolved || 0,
          hours: data.user.studyHours || 0,
          topicsCount: data.user.topicsDone || 0,
          quizzesCount: data.user.quizzesDone || 0,
        });

        setSubjectProgress(data.subjectProgress || []);
        setStrongTopics(data.strongTopics || []);
        setWeakTopics(data.weakTopics || []);
      }
    } catch (err) {
      console.error("Error loading progress page analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProgressData();
  }, []);

  // SVG parameters for progress circles
  const radius = 36;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffsetCov = circumference - (stats.coverage / 100) * circumference;
  const strokeDashoffsetAcc = circumference - (stats.accuracy / 100) * circumference;

  // Custom colors list for subjects
  const subjectColors = [
    { bar: "bg-blue-600", text: "text-blue-600 bg-blue-50" },
    { bar: "bg-purple-600", text: "text-purple-600 bg-purple-50" },
    { bar: "bg-teal-600", text: "text-teal-600 bg-teal-50" },
    { bar: "bg-orange-600", text: "text-orange-600 bg-orange-50" },
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-semibold animate-pulse font-sora text-sm">
          {tr.loadingProgress}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sora">
            {tr.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{tr.subtitle}</p>
        </div>
        <Link 
          href="/dashboard" 
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors self-start md:self-auto bg-blue-50 px-3 py-1.5 rounded-lg"
        >
          {tr.backBtn}
        </Link>
      </div>

      {/* Interactive Core Progress Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coverage Circular Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="-rotate-90">
              <circle
                stroke="#F1F5F9"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#1D4ED8"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset: strokeDashoffsetCov }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out origin-center"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-slate-800 font-sora">{stats.coverage}%</span>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr.syllabusCoverage}</h4>
            <div className="text-sm font-extrabold text-slate-800 mt-0.5">{stats.topicsCount} {lang === "en" ? "Done" : "पूर्ण"}</div>
          </div>
        </div>

        {/* Accuracy Circular Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="relative flex items-center justify-center shrink-0">
            <svg height={radius * 2} width={radius * 2} className="-rotate-90">
              <circle
                stroke="#F1F5F9"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#059669"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset: strokeDashoffsetAcc }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out origin-center"
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-slate-800 font-sora">{stats.accuracy}%</span>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr.accuracyRate}</h4>
            <div className="text-xs font-bold text-emerald-600 mt-0.5">{stats.accuracy >= 60 ? "Proficient" : "Need Review"}</div>
          </div>
        </div>

        {/* Questions card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shrink-0">
            📝
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr.questionsSol}</h4>
            <div className="text-lg font-extrabold text-slate-800 mt-0.5">{stats.solved}</div>
          </div>
        </div>

        {/* Hours card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-xl shrink-0">
            ⏱️
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{tr.studyHours}</h4>
            <div className="text-lg font-extrabold text-slate-800 mt-0.5">{stats.hours} hrs</div>
          </div>
        </div>
      </div>

      {/* Details layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 font-sora">{tr.subjectProgress}</h2>
          <div className="space-y-4">
            {subjectProgress.map((sub, i) => {
              const colorSet = subjectColors[i % subjectColors.length];
              const name = lang === "en" ? sub.nameEn : sub.nameHi;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">
                      {name}
                    </span>
                    <span className="font-extrabold text-slate-900">{sub.percent}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${colorSet.bar}`}
                      style={{ width: `${sub.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone side widget */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white border border-blue-950 rounded-2xl p-6 flex flex-col justify-between gap-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="space-y-2">
            <h2 className="text-xs font-bold font-sora text-blue-200 uppercase tracking-wider">{tr.statsHeader}</h2>
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-white/90">
                ✓ {stats.topicsCount} Topics covered in current syllabus
              </p>
              <p className="text-xs font-semibold text-white/90">
                ✓ {stats.quizzesCount} dynamic quizzes submitted successfully
              </p>
              <p className="text-xs font-semibold text-white/90">
                ⚡ Next Goal: Master 5 additional topics for Premium status badge!
              </p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 border border-white/5 text-[10px] text-white/80 leading-relaxed font-semibold">
            📊 {tr.accuracyText}
          </div>
        </div>
      </div>

      {/* Strong & Weak Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Topics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sora">{tr.strongTopics}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{tr.strongTopicsSub}</p>
            </div>
          </div>
          <div className="space-y-3">
            {strongTopics.length > 0 ? (
              strongTopics.map((topic, idx) => (
                <div key={idx} className="flex justify-between items-center bg-green-50/50 border border-green-100 rounded-xl p-3 shadow-inner">
                  <span className="text-xs font-bold text-slate-700">
                    {topic}
                  </span>
                  <span className="text-[9px] font-extrabold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                    🏆 Stellar (≥80%)
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic pt-2">{tr.noStrong}</p>
            )}
          </div>
        </div>

        {/* Weak Topics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-sora">{tr.weakTopics}</h2>
              <p className="text-[10px] text-slate-400 font-medium">{tr.weakTopicsSub}</p>
            </div>
          </div>
          <div className="space-y-3">
            {weakTopics.length > 0 ? (
              weakTopics.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-red-50/50 border border-red-100 rounded-xl p-3 shadow-inner">
                  <span className="text-xs font-bold text-slate-700">
                    {item.name}
                  </span>
                  <span className="text-[9px] font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                    ⚠️ {item.reason}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic pt-2">{tr.noWeak}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
