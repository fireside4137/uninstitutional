"use client";

import { useLang } from "@/components/providers/LangProvider";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense, useCallback } from "react";

const t = {
  en: {
    title: "Practice Quizzes",
    subtitle: "Sharpen your state exam knowledge with targeted multiple choice tests.",
    dailyChallenge: "Daily Challenge Quiz",
    dailyChallengeSub: "Based on today's target topic. Complete to claim +20 bonus points!",
    startBtn: "Start Quiz",
    subjectsTitle: "All Syllabus Topic Quizzes",
    questions: "questions",
    minutes: "mins",
    backBtn: "← Back",
    points: "points",
    completed: "Completed",
    quizCompletedMsg: "You scored {score} out of {total}!",
    quizCompletedXP: "You earned +{points} XP!",
    closeBtn: "Close & Return",
    prevBtn: "Previous",
    nextBtn: "Next",
    submitBtn: "Submit Quiz",
    timerLabel: "Time Left",
    passingScore: "Passing Score: 60%",
    passedText: "PASSED! Topic Mastered",
    failedText: "FAILED! Under 60%. Try re-reading the topic.",
    explanationHeader: "Question Explanation",
    loadingQuiz: "Loading quiz questions...",
    noQuizzes: "No quizzes available for your current exam course.",
  },
  hi: {
    title: "अभ्यास क्विज़",
    subtitle: "लक्षित बहुविकल्पीय परीक्षणों के साथ अपने राज्य परीक्षा ज्ञान को बढ़ाएं।",
    dailyChallenge: "दैनिक चुनौती क्विज़",
    dailyChallengeSub: "आज के लक्षित विषय पर आधारित। +20 बोनस अंक प्राप्त करने के लिए पूरा करें!",
    startBtn: "क्विज़ शुरू करें",
    subjectsTitle: "सभी पाठ्यक्रम विषय क्विज़",
    questions: "प्रश्न",
    minutes: "मिनट",
    backBtn: "← वापस",
    points: "पॉइंट्स",
    completed: "पूर्ण",
    quizCompletedMsg: "आपने {total} में से {score} स्कोर किया!",
    quizCompletedXP: "आपने +{points} XP अर्जित किए!",
    closeBtn: "बंद करें और वापस जाएं",
    prevBtn: "पिछला",
    nextBtn: "अगला",
    submitBtn: "क्विज़ जमा करें",
    timerLabel: "समय शेष",
    passingScore: "उत्तीर्ण अंक: 60%",
    passedText: "उत्तीर्ण! विषय पर महारत हासिल की",
    failedText: "अनुत्तीर्ण! 60% से कम। विषय को फिर से पढ़ने का प्रयास करें।",
    explanationHeader: "प्रश्न की व्याख्या",
    loadingQuiz: "क्विज़ प्रश्न लोड हो रहे हैं...",
    noQuizzes: "आपके वर्तमान परीक्षा पाठ्यक्रम के लिए कोई क्विज़ उपलब्ध नहीं है।",
  },
};

interface QuizQuestion {
  id: string;
  q: string;
  qHi: string;
  options: string[];
  correct: number;
  explanation: string;
  explanationHi: string;
}

interface Quiz {
  id: string;
  topicId: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  questionsCount: number;
  timeMinutes: number;
  points: number;
  category: string;
  questions?: QuizQuestion[];
}

interface QuizResult {
  score: number;
  correctCount: number;
  totalQuestions: number;
  earnedPoints: number;
  passed: boolean;
}

function QuizPageContent() {
  const { lang } = useLang();
  const tr = t[lang];
  const searchParams = useSearchParams();
  const router = useRouter();

  const queryTopicId = searchParams.get("topicId");

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    const questionsLength = quiz.questions?.length || 0;
    setSelectedAnswers(new Array(questionsLength).fill(-1));
    setResults(null);
    setTimeLeft(quiz.timeMinutes * 60);
  };

  // Fetch all quizzes from backend
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/quiz");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data || []);

        // If a topicId was provided in search query, find and launch that quiz directly
        if (queryTopicId) {
          const matched = data.find((q: Quiz) => q.topicId === queryTopicId);
          if (matched) {
            startQuiz(matched);
          } else {
            // If not found in standard list, fetch topic quiz directly from API
            const directRes = await fetch(`/api/dashboard/quiz?topicId=${queryTopicId}`);
            if (directRes.ok) {
              const directQuiz = await directRes.json();
              startQuiz(directQuiz);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTopicId]);

  const handleSubmitQuiz = useCallback(async () => {
    if (!activeQuiz) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/dashboard/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: activeQuiz.topicId,
          selectedAnswers,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults({
          score: data.score,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions,
          earnedPoints: data.earnedPoints,
          passed: data.passed,
        });
      }
    } catch (err) {
      console.error("Error grading quiz:", err);
    } finally {
      setSubmitting(false);
    }
  }, [activeQuiz, selectedAnswers]);

  // Handle active countdown timer
  useEffect(() => {
    if (!activeQuiz || results) return;

    if (timeLeft <= 0) {
      // Auto-submit on timeout
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, timeLeft, results, handleSubmitQuiz]);

  const handleSelectOption = (optIndex: number) => {
    const updated = [...selectedAnswers];
    updated[currentQIndex] = optIndex;
    setSelectedAnswers(updated);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

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
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-semibold animate-pulse">
          {tr.loadingQuiz}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!activeQuiz ? (
        <>
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

          {/* Daily Challenge Card if present */}
          {quizzes.filter(q => q.category === "Daily").map(quiz => (
            <div 
              key={quiz.id}
              className="bg-gradient-to-br from-amber-500/10 to-orange-500/15 border border-amber-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse">
                  🔥 {tr.dailyChallenge}
                </span>
                <h2 className="text-xl font-bold text-slate-800 font-sora">
                  {lang === "en" ? quiz.titleEn : quiz.titleHi}
                </h2>
                <p className="text-xs text-slate-600">
                  {lang === "en" ? quiz.descEn : quiz.descHi}
                </p>
                <div className="flex items-center gap-3 pt-2 text-xs font-bold text-slate-500">
                  <span>📝 {quiz.questionsCount} {tr.questions}</span>
                  <span>•</span>
                  <span>⏱️ {quiz.timeMinutes} {tr.minutes}</span>
                  <span>•</span>
                  <span className="text-amber-700">⭐ +{quiz.points} {tr.points}</span>
                </div>
              </div>
              <button 
                onClick={() => startQuiz(quiz)}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold px-6 py-3 rounded-xl shadow-md text-xs shrink-0 transition-all font-sora z-10"
              >
                {tr.startBtn}
              </button>
            </div>
          ))}

          {/* Subject Quizzes Grid */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800 font-sora">{tr.subjectsTitle}</h2>
            {quizzes.filter(q => q.category !== "Daily").length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.filter(q => q.category !== "Daily").map(quiz => (
                  <div 
                    key={quiz.id}
                    className="bg-white border border-slate-200 hover:border-blue-200 hover:shadow-md rounded-2xl p-5 transition-all flex flex-col justify-between gap-4 shadow-sm"
                  >
                    <div>
                      <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-slate-200/50">
                        {quiz.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 font-sora mt-2">
                        {lang === "en" ? quiz.titleEn : quiz.titleHi}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        {lang === "en" ? quiz.descEn : quiz.descHi}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex gap-2 text-[10px] font-bold text-slate-400">
                        <span>⏱️ {quiz.timeMinutes}m</span>
                        <span>•</span>
                        <span>⭐ {quiz.points} XP</span>
                      </div>
                      <button 
                        onClick={() => startQuiz(quiz)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {tr.startBtn} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center text-slate-500 text-xs">
                {tr.noQuizzes}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Active Quiz Panel */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto">
          {/* Top Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (confirm(lang === "en" ? "Are you sure you want to exit the quiz? Progress will be lost." : "क्या आप वाकई क्विज़ से बाहर निकलना चाहते हैं? प्रगति खो जाएगी।")) {
                    setActiveQuiz(null);
                    router.push("/dashboard/quiz");
                  }
                }}
                className="text-slate-400 hover:text-white transition-colors text-lg"
              >
                ✕
              </button>
              <h3 className="font-bold text-sm md:text-base font-sora">
                {lang === "en" ? activeQuiz.titleEn : activeQuiz.titleHi}
              </h3>
            </div>
            {!results && (
              <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>⏱️</span>
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}
          </div>

          {!results ? (
            /* Question Body */
            <div className="p-6 md:p-8 space-y-6">
              {/* Question Count Header */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                <span>Question {currentQIndex + 1} of {(activeQuiz.questions || []).length}</span>
                <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${((currentQIndex + 1) / (activeQuiz.questions || []).length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-bold text-slate-800 leading-snug font-sora">
                {lang === "en" ? activeQuiz.questions?.[currentQIndex]?.q : activeQuiz.questions?.[currentQIndex]?.qHi}
              </h2>

              {/* Options */}
              <div className="space-y-3">
                {(activeQuiz.questions?.[currentQIndex]?.options || []).map((option: string, index: number) => {
                  const isSelected = selectedAnswers[currentQIndex] === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(index)}
                      className={`w-full text-left p-4 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected 
                          ? "border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-600/10 shadow-sm" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                          isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 text-slate-500 bg-white"
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                >
                  {tr.prevBtn}
                </button>

                {currentQIndex < (activeQuiz.questions || []).length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    disabled={selectedAnswers[currentQIndex] === -1}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
                  >
                    {tr.nextBtn}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={selectedAnswers.includes(-1) || submitting}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-md disabled:opacity-40"
                  >
                    {submitting ? "Submitting..." : tr.submitBtn}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Results Panel */
            <div className="p-8 text-center space-y-6 max-h-[80vh] overflow-y-auto">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto shadow-md ${
                results.passed ? "bg-green-100 text-green-600 border border-green-200" : "bg-red-100 text-red-500 border border-red-200"
              }`}>
                {results.passed ? "🎉" : "💪"}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-800 font-sora">
                  {results.passed ? tr.passedText : tr.failedText}
                </h2>
                <p className="text-slate-600 font-bold text-sm">
                  {tr.quizCompletedMsg
                    .replace("{score}", results.correctCount.toString())
                    .replace("{total}", results.totalQuestions.toString())}
                </p>
                {results.earnedPoints > 0 ? (
                  <p className="text-sm text-green-600 font-extrabold">
                    {tr.quizCompletedXP.replace("{points}", results.earnedPoints.toString())}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 font-bold">
                    {tr.passingScore} (Score: {results.score}%)
                  </p>
                )}
              </div>

              {/* Review questions details */}
              <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-4 text-left divide-y divide-slate-200">
                {(activeQuiz.questions || []).map((q, i) => {
                  const wasCorrect = selectedAnswers[i] === q.correct;
                  const explanation = lang === "en" ? q.explanation : q.explanationHi;
                  
                  return (
                    <div key={q.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <p className="text-xs font-bold text-slate-800 font-sora">
                        Q{i+1}: {lang === "en" ? q.q : q.qHi}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-bold px-2 py-0.5 rounded ${
                          wasCorrect ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {wasCorrect ? "✓ Correct" : "✕ Incorrect"}
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600 font-semibold">
                          {lang === "en" ? "Correct answer" : "सही उत्तर"}: <strong className="text-slate-900">{q.options[q.correct]}</strong>
                        </span>
                      </div>

                      {/* Display explanation */}
                      {explanation && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 text-xs text-slate-600 space-y-1">
                          <span className="font-extrabold text-blue-800 uppercase tracking-wider text-[9px] block">
                            💡 {tr.explanationHeader}
                          </span>
                          <p className="leading-relaxed">{explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setActiveQuiz(null);
                  router.push("/dashboard/quiz");
                }}
                className="w-full max-w-xs bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md text-xs font-sora"
              >
                {tr.closeBtn}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 font-semibold animate-pulse">
          Loading Quiz interface...
        </div>
      </div>
    }>
      <QuizPageContent />
    </Suspense>
  );
}
