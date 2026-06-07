"use client";

import { useLang } from "@/components/providers/LangProvider";
import Link from "next/link";
import { useState, useEffect } from "react";

const t = {
  en: {
    title: "Daily Study Tasks",
    subtitle: "Complete your assigned tasks to cover the syllabus, earn points, and build your streak.",
    todayTask: "Today's Assigned Task",
    estimatedTime: "Estimated time",
    startBtn: "Start Reading",
    quizBtn: "Start Quiz",
    completed: "Completed!",
    checklistTitle: "All Syllabus Topics & Progress",
    resourceTitle: "Handpicked Study Material",
    backBtn: "← Back to Dashboard",
    questions: "questions",
    minutes: "mins",
    statusTodo: "Pending",
    statusInProgress: "In Progress",
    statusDone: "Completed",
    streakBonus: "Completion Bonus: +15 XP",
    dailyHeader: "🔥 TODAY'S CHALLENGE",
    noDailyTask: "No active daily task assigned. Check back shortly!",
    readingPaneTitle: "Study Material & Content",
    markCompletedBtn: "Mark as Read & Claim +15 XP",
    readingCompletedSuccess: "Fantastic! You've successfully finished reading this topic and earned +15 XP!",
    backToTopics: "Back to Topics",
  },
  hi: {
    title: "दैनिक अध्ययन कार्य",
    subtitle: "पाठ्यक्रम को कवर करने, अंक अर्जित करने और अपनी स्ट्रीक बनाने के लिए अपने सौंपे गए कार्यों को पूरा करें।",
    todayTask: "आज का सौंपा गया कार्य",
    estimatedTime: "अनुमानित समय",
    startBtn: "पढ़ना शुरू करें",
    quizBtn: "क्विज़ शुरू करें",
    completed: "पूरा हो गया!",
    checklistTitle: "सभी पाठ्यक्रम विषय और प्रगति",
    resourceTitle: "चुनिंदा अध्ययन सामग्री",
    backBtn: "← डैशबोर्ड पर वापस जाएं",
    questions: "प्रश्न",
    minutes: "मिनट",
    statusTodo: "लंबित",
    statusInProgress: "प्रगति पर",
    statusDone: "पूर्ण",
    streakBonus: "पूर्णता बोनस: +15 XP",
    dailyHeader: "🔥 आज की चुनौती",
    noDailyTask: "कोई सक्रिय दैनिक कार्य नहीं सौंपा गया है। जल्द ही दोबारा जांचें!",
    readingPaneTitle: "अध्ययन सामग्री और सामग्री",
    markCompletedBtn: "पढ़ा हुआ चिह्नित करें और +15 XP प्राप्त करें",
    readingCompletedSuccess: "बहुत बढ़िया! आपने इस विषय को सफलतापूर्वक पढ़ना समाप्त कर लिया है और +15 XP अर्जित किए हैं!",
    backToTopics: "विषयों पर वापस जाएं",
  },
};

interface TopicTask {
  id: string;
  title: string;
  titleHi: string;
  content: string | null;
  contentHi: string | null;
  subjectEn: string;
  subjectHi: string;
  estimatedMinutes: number;
  questionsCount: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completed: boolean;
  isDaily: boolean;
}

interface DailyTaskData {
  id: string;
  isCompleted: boolean;
  topic: {
    id: string;
    title: string;
    titleHi: string;
    content: string | null;
    contentHi: string | null;
    estimatedMinutes: number;
    subject: {
      name: string;
      nameHi: string;
    };
    questionsCount: number;
  };
}

export default function TasksPage() {
  const { lang } = useLang();
  const tr = t[lang];

  const [loading, setLoading] = useState(true);
  const [dailyTask, setDailyTask] = useState<DailyTaskData | null>(null);
  const [topics, setTopics] = useState<TopicTask[]>([]);
  const [readingTopic, setReadingTopic] = useState<TopicTask | null>(null);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch tasks data from backend
  const fetchTasksData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const res = await fetch("/api/dashboard/tasks");
      if (res.ok) {
        const data = await res.json();
        setDailyTask(data.dailyTask);
        setTopics(data.topicsList || []);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Already in loading state by default (loading = true), no need to set it again synchronously
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasksData(false)
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  // Update progress action
  const handleProgressAction = async (topicId: string, action: "start_reading" | "complete_reading") => {
    try {
      setActionLoading(topicId);
      const res = await fetch("/api/dashboard/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, action }),
      });
      if (res.ok) {
        const data = await res.json();
        
        // If completed reading, show celebration pop
        if (action === "complete_reading" && data.earnedPoints > 0) {
          setCelebrationMsg(tr.readingCompletedSuccess);
          setTimeout(() => setCelebrationMsg(null), 5000);
        }

        // Refresh all task and progress records from DB
        await fetchTasksData(false);

        // Update the active reading topic state in real-time to reflect new completed state
        if (readingTopic && readingTopic.id === topicId) {
          setReadingTopic((prev) =>
            prev
              ? {
                  ...prev,
                  status: action === "complete_reading" ? "COMPLETED" : "IN_PROGRESS",
                  completed: action === "complete_reading",
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating progress:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartReading = (topic: TopicTask) => {
    setReadingTopic(topic);
    if (topic.status === "NOT_STARTED") {
      handleProgressAction(topic.id, "start_reading");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Skeleton Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-slate-100 rounded-md animate-pulse" />
          </div>
          <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Skeleton Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-slate-200 rounded-full" />
                <div className="h-8 w-12 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
              <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="h-4 w-32 bg-slate-100 rounded-md" />
                <div className="h-8 w-24 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Reading Pane Interface
  if (readingTopic) {
    const title = lang === "en" ? readingTopic.title : readingTopic.titleHi;
    const content = lang === "en" ? readingTopic.content : readingTopic.contentHi;
    const subject = lang === "en" ? readingTopic.subjectEn : readingTopic.subjectHi;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumbs / Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => setReadingTopic(null)}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-3 py-1.5 rounded-lg"
          >
            ← {tr.backToTopics}
          </button>
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
            {subject}
          </span>
        </div>

        {/* Celebrate pop */}
        {celebrationMsg && (
          <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg border border-emerald-400 flex items-center justify-between animate-bounce font-sora font-semibold text-sm">
            <span>🎉 {celebrationMsg}</span>
            <button onClick={() => setCelebrationMsg(null)} className="text-white hover:text-emerald-100">
              ✕
            </button>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sora">
              {title}
            </h1>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
              <span>⏱️ {readingTopic.estimatedMinutes} {tr.minutes}</span>
              <span>•</span>
              <span className="text-blue-600">🎯 {readingTopic.questionsCount} {tr.questions}</span>
            </div>
          </div>

          {/* Actual study text */}
          <div className="prose max-w-none text-slate-700 leading-relaxed font-normal text-sm md:text-base border-t border-b border-slate-100 py-6 whitespace-pre-wrap">
            {content || (
              <p className="italic text-slate-400">
                {lang === "en" ? "Study material is being finalized for this topic. Check back soon!" : "इस विषय के लिए अध्ययन सामग्री को अंतिम रूप दिया जा रहा है। जल्द ही पुनः जांचें!"}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div>
              {readingTopic.status === "COMPLETED" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  ✓ {tr.statusDone}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                  📖 {tr.statusInProgress}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {readingTopic.status !== "COMPLETED" && (
                <button
                  onClick={() => handleProgressAction(readingTopic.id, "complete_reading")}
                  disabled={actionLoading !== null}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold px-5 py-3 rounded-xl shadow-md text-xs tracking-wide transition-all font-sora disabled:opacity-50"
                >
                  {actionLoading === readingTopic.id ? "Saving..." : tr.markCompletedBtn}
                </button>
              )}

              {readingTopic.questionsCount > 0 ? (
                <Link
                  href={`/dashboard/quiz?topicId=${readingTopic.id}`}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-3 rounded-xl shadow-md text-xs text-center transition-all font-sora shrink-0"
                >
                  🎯 {tr.quizBtn}
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Celebration notification if any */}
      {celebrationMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-emerald-500 flex items-center gap-3 animate-bounce font-sora font-semibold">
          <span>🎉 {celebrationMsg}</span>
          <button onClick={() => setCelebrationMsg(null)} className="text-white hover:text-emerald-100">
            ✕
          </button>
        </div>
      )}

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

      {/* Daily Challenge Card (Prominent Header Item) */}
      {dailyTask ? (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/15 border border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/20 to-transparent rounded-bl-full pointer-events-none" />
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-200 shadow-sm animate-pulse">
              {tr.dailyHeader}
            </span>
            <h2 className="text-xl font-bold text-slate-900 font-sora">
              {lang === "en" ? dailyTask.topic.title : dailyTask.topic.titleHi}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {lang === "en" ? dailyTask.topic.subject.name : dailyTask.topic.subject.nameHi}
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs font-semibold text-slate-500">
              <span>⏱️ {dailyTask.topic.estimatedMinutes} {tr.minutes}</span>
              <span>•</span>
              <span>📝 {dailyTask.topic.questionsCount} {tr.questions}</span>
              <span>•</span>
              <span className="text-amber-700">{tr.streakBonus}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 z-10">
            {dailyTask.isCompleted ? (
              <span className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-green-100 border border-green-200 text-green-800 text-xs font-bold px-5 py-3.5 rounded-xl shadow-sm">
                ✓ {tr.completed}
              </span>
            ) : (
              <>
                <button
                  onClick={() => {
                    const mappedTopic = topics.find((t) => t.id === dailyTask.topic.id);
                    if (mappedTopic) {
                      handleStartReading(mappedTopic);
                    } else {
                      // Fallback maps mock structures
                      const formatted: TopicTask = {
                        id: dailyTask.topic.id,
                        title: dailyTask.topic.title,
                        titleHi: dailyTask.topic.titleHi,
                        content: dailyTask.topic.content,
                        contentHi: dailyTask.topic.contentHi,
                        subjectEn: dailyTask.topic.subject.name,
                        subjectHi: dailyTask.topic.subject.nameHi,
                        estimatedMinutes: dailyTask.topic.estimatedMinutes,
                        questionsCount: dailyTask.topic.questionsCount,
                        status: "IN_PROGRESS",
                        completed: false,
                        isDaily: true,
                      };
                      handleStartReading(formatted);
                    }
                  }}
                  className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-5 py-3.5 rounded-xl shadow-md text-xs text-center transition-all font-sora"
                >
                  {tr.startBtn}
                </button>
                {dailyTask.topic.questionsCount > 0 && (
                  <Link
                    href={`/dashboard/quiz?topicId=${dailyTask.topic.id}`}
                    className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-5 py-3.5 rounded-xl shadow-md text-xs text-center transition-all font-sora"
                  >
                    {tr.quizBtn}
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-5 text-center text-slate-500 text-xs font-medium">
          {tr.noDailyTask}
        </div>
      )}

      {/* Topics list */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 font-sora">{tr.checklistTitle}</h2>
        <div className="grid grid-cols-1 gap-4">
          {topics.map((topic) => {
            const isFinished = topic.status === "COMPLETED";
            const title = lang === "en" ? topic.title : topic.titleHi;
            const subject = lang === "en" ? topic.subjectEn : topic.subjectHi;

            return (
              <div
                key={topic.id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
                  isFinished
                    ? "border-green-200 bg-green-50/10"
                    : "border-slate-200 hover:border-blue-200 hover:shadow-md"
                }`}
              >
                <div className={`h-1 w-full ${isFinished ? "bg-green-500" : topic.status === "IN_PROGRESS" ? "bg-amber-500" : "bg-blue-500"}`} />

                <div className="p-5 md:p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                          isFinished
                            ? "bg-green-50 border-green-200 text-green-700"
                            : topic.status === "IN_PROGRESS"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                        }`}
                      >
                        {isFinished
                          ? "✓ " + tr.statusDone
                          : topic.status === "IN_PROGRESS"
                          ? "⏳ " + tr.statusInProgress
                          : "💤 " + tr.statusTodo}
                      </span>
                      {topic.isDaily && (
                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white">
                          {"★ Today's Target"}
                        </span>
                      )}
                      <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mt-2">
                        {subject}
                      </h3>
                      <h2 className="text-base font-bold text-slate-900 font-sora mt-1">
                        {title}
                      </h2>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-center shrink-0">
                      <div className="text-base font-bold text-slate-700">{topic.estimatedMinutes}</div>
                      <div className="text-[9px] uppercase font-extrabold text-slate-400">{tr.minutes}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <span>🎯 {topic.questionsCount} {tr.questions}</span>
                      {!isFinished && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="text-amber-600">{tr.streakBonus}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleStartReading(topic)}
                        disabled={actionLoading !== null}
                        className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isFinished
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                      >
                        {isFinished ? "Re-read Content" : tr.startBtn}
                      </button>

                      {topic.questionsCount > 0 && !isFinished && (
                        <Link
                          href={`/dashboard/quiz?topicId=${topic.id}`}
                          className="flex-1 sm:flex-initial px-4 py-2 border border-blue-200 hover:bg-blue-50 text-blue-600 rounded-xl text-xs font-bold text-center transition-all"
                        >
                          {tr.quizBtn}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
