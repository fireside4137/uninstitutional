"use client";

import { useLang } from "@/components/providers/LangProvider";
import Link from "next/link";
import { useState, useEffect } from "react";

const t = {
  en: {
    title: "Rewards & Streaks",
    subtitle: "Study consistently to keep your streak burning and redeem premium materials.",
    backBtn: "← Back",
    streakHeader: "Your Streak Calendar",
    pointsBalance: "Points Balance",
    redeemBtn: "Unlock Resource",
    lockedBtn: "Locked (Need Points)",
    unlockedBtn: "Unlocked! (View Notes)",
    streakCalendarSub: "Streak progress over the past 28 days",
    streakCount: "{count} Day Active Streak",
    longestStreakCount: "Longest Streak: {count} Days",
    pointsCount: "{points} Points",
    catalogTitle: "Premium Resource Shop",
    pointsShort: "PTS",
    insufficientAlert: "Oops! You need more points. Solve quizzes or complete daily reading to earn points!",
    unlockSuccessAlert: "Success! Resource unlocked! You can now access this high-yield content.",
    loadingRewards: "Loading points balance and calendar...",
    viewingTitle: "Unlocked Premium Resource Preview",
  },
  hi: {
    title: "इनाम और स्ट्रीक्स",
    subtitle: "अपनी स्ट्रीक को बनाए रखने और प्रीमियम सामग्री अनलॉक करने के लिए लगातार अध्ययन करें।",
    backBtn: "← वापस",
    streakHeader: "आपका स्ट्रीक कैलेंडर",
    pointsBalance: "पॉइंट्स बैलेंस",
    redeemBtn: "संसाधन अनलॉक करें",
    lockedBtn: "अनलॉक नहीं (पॉइंट्स चाहिए)",
    unlockedBtn: "अनलॉक हो गया! (नोट्स देखें)",
    streakCalendarSub: "पिछले 28 दिनों में स्ट्रीक की प्रगति",
    streakCount: "{count} दिन की सक्रिय स्ट्रीक",
    longestStreakCount: "सबसे लंबी स्ट्रीक: {count} दिन",
    pointsCount: "{points} पॉइंट्स",
    catalogTitle: "प्रीमियम संसाधन की दुकान",
    pointsShort: "अंक",
    insufficientAlert: "ओह! आपको अधिक अंकों की आवश्यकता है। अंक अर्जित करने के लिए क्विज़ हल करें या दैनिक पढ़ाई पूरी करें!",
    unlockSuccessAlert: "सफलता! संसाधन अनलॉक हो गया! अब आप इस महत्वपूर्ण सामग्री को देख सकते हैं।",
    loadingRewards: "पॉइंट्स बैलेंस और कैलेंडर लोड हो रहा है...",
    viewingTitle: "अनलॉक की गई प्रीमियम सामग्री पूर्वावलोकन",
  },
};

const getMonthName = (dateStr: string, language: "en" | "hi") => {
  const date = new Date(dateStr.replace(/-/g, "/"));
  const monthIndex = date.getMonth();
  const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsHi = ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"];
  return language === "en" ? monthsEn[monthIndex] : monthsHi[monthIndex];
};

interface ShopItem {
  id: string;
  nameEn: string;
  nameHi: string;
  cost: number;
  type: string;
  unlocked: boolean;
}

interface StreakGridItem {
  day: number;
  active: boolean;
  dateStr?: string;
  label?: string;
}

// Previews database for premium resources when unlocked
const resourcePreviews: Record<string, { title: string; content: string }> = {
  pdf1: {
    title: "Uttarakhand Budget 2026 Analysis PDF",
    content: `📊 UKPSC High-Yield Budget Summary 2026
---------------------------------------------
1. Total State Expenditure: ₹98,400 Crores.
2. Top Allocation Sectors:
   - Rural Development & Roads: ₹15,400 Crores (Focus on Himalayan highway links)
   - Education & Skill India: ₹12,100 Crores
   - Tourism & Eco-Infrastructure: ₹9,800 Crores
3. Key Fiscal Targets:
   - GSDP Projected Growth: 7.8% (outpacing national hill-states average).
   - Fiscal Deficit target: under 3.2% of GSDP.
4. Uttarakhand GK Special:
   - 'Lakhpati Didi' scheme expansion targeting 1.5 Lakh rural women.
   - Dehradun-Haridwar Metro Corridor budget allocations initialized.`,
  },
  test1: {
    title: "UKPSC Executive Officer Full Mock Test",
    content: `📝 UKPSC Executive Officer Full Mock Exam (Premium Paper)
------------------------------------------------------
Subject: General Studies & General Hindi (Total 100 Qs)

Q1. The famous Chand dynasty capital Champawat lies in which district?
    Answer: Champawat. (Founded by Som Chand in 700 AD).
Q2. Article 243 of the Indian Constitution relates to:
    Answer: Panchayati Raj institutions (73rd Amendment).
Q3. What is the correct संधि-विच्छेद for the word 'सूर्योदय'?
    Answer: सूर्य + उदय (गुण स्वर संधि).

* Full PDF worksheet and interactive answer keys are unlocked for offline learning!`,
  },
  note1: {
    title: "Handwritten Polity Mindmaps (All Articles)",
    content: `🗺️ Handwritten Indian Constitution articles flowchart
------------------------------------------------------
PART III: FUNDAMENTAL RIGHTS (Article 12 to 35)

[Article 12: Definition of State] ---> [Article 13: Laws Inconsistent]
                                               |
                                               v
                                 [Article 14-18: Right to Equality]
                                 - Art 14: Equality before law
                                 - Art 15: No discrimination
                                 - Art 16: Public employment equality
                                 - Art 17: Abolition of untouchability
                                 - Art 18: Abolition of titles

[Article 19-22: Right to Freedom] ---> [Article 23-24: Exploitation]
                                               |
                                               v
                                 [Article 25-28: Religious Freedom]
                                 - Art 25: Practice & propagation
                                 - Art 29-30: Minority rights
                                 - Art 32: Constitutional Remedies (Heart & Soul)`,
  },
};

export default function RewardsPage() {
  const { lang } = useLang();
  const tr = t[lang];

  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakGrid, setStreakGrid] = useState<StreakGridItem[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [activePreview, setActivePreview] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Fetch rewards balance and shop items from backend
  const fetchRewardsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/rewards");
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points);
        setCurrentStreak(data.currentStreak);
        setLongestStreak(data.longestStreak);
        setStreakGrid(data.streakGrid || []);
        setShopItems(data.shopItems || []);
      }
    } catch (err) {
      console.error("Error loading rewards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRewardsData();
  }, []);

  const buyItem = async (id: string, cost: number) => {
    if (points < cost) {
      showNotification("error", tr.insufficientAlert);
      return;
    }

    try {
      setPurchasingId(id);
      const res = await fetch("/api/dashboard/rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id, cost }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPoints(data.remainingPoints);
          showNotification("success", tr.unlockSuccessAlert);
          
          // Refresh catalog state from DB
          await fetchRewardsData();
        }
      } else {
        const errorData = await res.json();
        showNotification("error", errorData.error || "Transaction failed");
      }
    } catch (err) {
      console.error("Redemption error:", err);
    } finally {
      setPurchasingId(null);
    }
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
          {tr.loadingRewards}
        </div>
      </div>
    );
  }

  // Find weekday offset of oldest day
  const oldestDateStr = streakGrid[0]?.dateStr;
  const oldestWeekday = oldestDateStr ? new Date(oldestDateStr.replace(/-/g, "/")).getDay() : 0;
  
  const startMonth = oldestDateStr ? getMonthName(oldestDateStr, lang) : "";
  const newestDateStr = streakGrid[streakGrid.length - 1]?.dateStr;
  const endMonth = newestDateStr ? getMonthName(newestDateStr, lang) : "";
  const year = newestDateStr ? new Date(newestDateStr.replace(/-/g, "/")).getFullYear() : new Date().getFullYear();
  
  const monthLabel = startMonth && endMonth && startMonth !== endMonth
    ? `${startMonth} - ${endMonth} ${year}`
    : `${endMonth} ${year}`;

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

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Streak card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between border border-orange-400">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold text-amber-100 tracking-wider">Active Streak Journey</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-sora">
              {tr.streakCount.replace("{count}", currentStreak.toString())}
            </h2>
            <p className="text-xs text-amber-50 font-medium">
              {tr.longestStreakCount.replace("{count}", longestStreak.toString())}
            </p>
          </div>
          <span className="text-5xl animate-bounce shrink-0">🔥</span>
        </div>

        {/* Points balance */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md flex items-center justify-between border border-emerald-400">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold text-emerald-100 tracking-wider">{tr.pointsBalance}</span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-sora">
              {tr.pointsCount.replace("{points}", points.toString())}
            </h2>
            <p className="text-xs text-emerald-50 font-medium">Earn more points by solving practice quizzes and completing readings!</p>
          </div>
          <span className="text-5xl shrink-0">⭐</span>
        </div>
      </div>

      {/* Grid layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Streak grid calendar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-1 shadow-sm transition-colors duration-300">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-sora">{tr.streakHeader}</h2>
            {monthLabel && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {monthLabel}
              </span>
            )}
          </div>

          <div className="space-y-2">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {(lang === "en" ? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] : ["र", "सो", "मं", "बु", "गु", "शु", "श"]).map((wd) => (
                <div key={wd} className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {wd}
                </div>
              ))}
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding empty cells for weekday offset */}
              {Array.from({ length: oldestWeekday }).map((_, idx) => (
                <div key={`pad-${idx}`} className="aspect-square rounded-lg bg-transparent border border-transparent" />
              ))}
              {streakGrid.map((day) => (
                <div
                  key={day.day}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border transition-all ${
                    day.active
                      ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300 shadow-sm ring-2 ring-amber-500/10"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title={day.dateStr ? `${day.dateStr}: ${day.active ? "Active" : "Inactive"}` : `Day ${day.day}: ${day.active ? "Active" : "Inactive"}`}
                >
                  {day.label !== undefined ? day.label : day.day}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-800/50 text-[10px] leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
            {"📅 Keep your daily momentum! A single daily reading marks another active grid box."}
          </div>
        </div>

        {/* Shop/Resources */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 lg:col-span-2 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 font-sora">{tr.catalogTitle}</h2>
          <div className="space-y-4">
            {shopItems.map((item) => (
              <div 
                key={item.id}
                className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  item.unlocked 
                    ? "bg-emerald-50/10 border-emerald-200 shadow-sm" 
                    : "bg-white border-slate-200 hover:border-emerald-100 hover:shadow-md"
                }`}
              >
                <div className="space-y-1">
                  <span className={`inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    item.unlocked 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}>
                    {item.type}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 font-sora">
                    {lang === "en" ? item.nameEn : item.nameHi}
                  </h3>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span>⭐</span>
                    <span>{item.cost} {tr.pointsShort}</span>
                  </div>
                </div>

                {item.unlocked ? (
                  <button
                    onClick={() => setActivePreview(item.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm transition-all"
                  >
                    {tr.unlockedBtn}
                  </button>
                ) : (
                  <button
                    onClick={() => buyItem(item.id, item.cost)}
                    disabled={points < item.cost || purchasingId !== null}
                    className={`font-extrabold px-4 py-2.5 rounded-xl text-xs shrink-0 transition-all ${
                      points >= item.cost 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md border border-emerald-400" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    }`}
                  >
                    {purchasingId === item.id ? "Unlocking..." : points >= item.cost ? tr.redeemBtn : tr.lockedBtn}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Unlocked Notes Overlay Drawer */}
      {activePreview && resourcePreviews[activePreview] && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[85vh]">
            <div className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm font-sora">
                📖 {tr.viewingTitle}
              </h3>
              <button 
                onClick={() => setActivePreview(null)}
                className="text-slate-400 hover:text-white text-lg transition-colors font-bold"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-base font-extrabold text-slate-800 font-sora border-b border-slate-100 pb-2">
                {resourcePreviews[activePreview].title}
              </h2>
              <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                {resourcePreviews[activePreview].content}
              </pre>
            </div>
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end">
              <button
                onClick={() => setActivePreview(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-white border border-slate-200 shadow-2xl rounded-2xl px-5 py-4 max-w-sm transition-all duration-300 transform translate-y-0 scale-100 animate-slide-in">
          <div className={`p-2 rounded-xl text-white shrink-0 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {notification.type === 'success' ? (lang === 'en' ? 'Success' : 'सफलता') : (lang === 'en' ? 'Alert' : 'चेतावनी')}
            </h4>
            <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-relaxed">
              {notification.message}
            </p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-auto p-1 hover:bg-slate-50 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
