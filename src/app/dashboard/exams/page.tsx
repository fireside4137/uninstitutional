/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";

export default function ExamsHubPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    Promise.all([
      fetch("/api/information?type=calendar").then((res) => res.json()),
      fetch("/api/information?type=links").then((res) => res.json()),
      fetch("/api/bookmarks").then((res) => res.json()),
    ])
      .then(([calendarData, linksData, bookmarksData]) => {
        setCalendar(calendarData.calendar || []);
        setLinks(linksData.links || []);
        const bMap: Record<string, boolean> = {};
        if (Array.isArray(bookmarksData)) {
          bookmarksData.forEach((b: any) => {
            bMap[`${b.itemType}_${b.itemId}`] = true;
          });
        }
        setBookmarks(bMap);
      })
      .catch((err) => console.error("Error loading Exams Hub:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleBookmark = async (itemId: string, itemType: string) => {
    const key = `${itemType}_${itemId}`;
    const isBookmarked = !!bookmarks[key];

    // Optimistic update
    setBookmarks((prev) => ({ ...prev, [key]: !isBookmarked }));

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType }),
      });
      if (!res.ok) {
        // Rollback
        setBookmarks((prev) => ({ ...prev, [key]: isBookmarked }));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
      // Rollback
      setBookmarks((prev) => ({ ...prev, [key]: isBookmarked }));
    }
  };

  const categories = ["ALL", "UKPSC", "UKSSC", "SSC", "UPSC", "BANKING"];

  const filteredCalendar = calendar.filter((item) => {
    const matchesCategory = activeCategory === "ALL" || item.examCategory === activeCategory;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      item.titleEn.toLowerCase().includes(searchLower) ||
      item.titleHi.toLowerCase().includes(searchLower) ||
      item.authorityEn.toLowerCase().includes(searchLower) ||
      item.authorityHi.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">
          {lang === "en" ? "Loading Exams & Schedules..." : "परीक्षा और कार्यक्रम लोड हो रहे हैं..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Exams Hub & Calendar" : "परीक्षा हब और कैलेंडर"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Stay updated on exam dates, application windows, and official portals."
            : "परीक्षा तिथियों, आवेदन समय सीमा और आधिकारिक पोर्टलों की नवीनतम जानकारी प्राप्त करें।"}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={lang === "en" ? "Search exams..." : "परीक्षाएं खोजें..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
          <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            📅 {lang === "en" ? "Exam Schedules & Deadlines" : "परीक्षा अनुसूची और समय सीमा"}
          </h3>

          {filteredCalendar.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
              <span className="text-2xl block mb-2">📁</span>
              <p className="text-xs text-slate-500">
                {lang === "en" ? "No exam events match your filters." : "आपके फ़िल्टर से मेल खाने वाली कोई परीक्षा नहीं है।"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredCalendar.map((item) => {
                const closeDate = item.formCloseDate ? new Date(item.formCloseDate) : null;
                const examDate = item.examDate ? new Date(item.examDate) : null;
                const diffDays = closeDate ? Math.ceil((closeDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                const isBookmarked = !!bookmarks[`ExamEvent_${item.id}`];

                return (
                  <div
                    key={item.id}
                    className="relative bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Category badge */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold px-2.5 py-1 rounded-md">
                        {item.examCategory}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleBookmark(item.id, "ExamEvent")}
                          className="text-xs p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          title={lang === "en" ? "Bookmark" : "बुकमार्क"}
                        >
                          {isBookmarked ? "⭐" : "☆"}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-sora text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                      {lang === "en" ? item.titleEn : item.titleHi}
                    </h4>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold block text-slate-400 mb-0.5">
                          {lang === "en" ? "Conducting Body" : "आयोजक निकाय"}
                        </span>
                        {lang === "en" ? item.authorityEn : item.authorityHi}
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-400 mb-0.5">
                          {lang === "en" ? "Application Window" : "आवेदन की अवधि"}
                        </span>
                        {item.formOpenDate
                          ? new Date(item.formOpenDate).toLocaleDateString(lang === "en" ? "en" : "hi", {
                              month: "short",
                              day: "numeric",
                            })
                          : "?"}{" "}
                        -{" "}
                        {closeDate
                          ? closeDate.toLocaleDateString(lang === "en" ? "en" : "hi", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "?"}
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-400 mb-0.5">
                          {lang === "en" ? "Exam Date" : "परीक्षा तिथि"}
                        </span>
                        {examDate ? (
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {examDate.toLocaleDateString(lang === "en" ? "en" : "hi", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        ) : (
                          <span className="italic">{lang === "en" ? "To be announced" : "घोषणा होना शेष"}</span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold block text-slate-400 mb-0.5">
                          {lang === "en" ? "Status" : "स्थिति"}
                        </span>
                        <span
                          className={`font-semibold ${
                            item.status === "Closing Soon"
                              ? "text-red-600"
                              : item.status === "Applications Open"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {item.status}
                          {item.status === "Closing Soon" && diffDays > 0
                            ? ` (${diffDays} ${lang === "en" ? "days left" : "दिन शेष"})`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {item.applyUrl && (
                        <a
                          href={item.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors text-center"
                        >
                          {lang === "en" ? "Apply Online" : "ऑनलाइन आवेदन करें"}
                        </a>
                      )}
                      {item.notificationUrl && (
                        <a
                          href={item.notificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold transition-colors text-center"
                        >
                          {lang === "en" ? "Official Notification" : "आधिकारिक अधिसूचना"}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Official Links Directories */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            🔗 {lang === "en" ? "Official Commission Links" : "आधिकारिक आयोग लिंक्स"}
          </h3>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 divide-y divide-slate-100 dark:divide-slate-800">
            {links.map((link) => {
              const isBookmarked = !!bookmarks[`OfficialLink_${link.id}`];
              return (
                <div key={link.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {link.category}
                      </span>
                      {link.isTrusted && (
                        <span
                          className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 px-2 py-0.5 rounded"
                          title="Verified Direct Government Link"
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-sora text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors block leading-snug"
                    >
                      {lang === "en" ? link.titleEn : link.titleHi}
                    </a>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {lang === "en" ? link.authorityEn : link.authorityHi}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleBookmark(link.id, "OfficialLink")}
                      className="text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {isBookmarked ? "⭐" : "☆"}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      title={lang === "en" ? "Visit Website" : "वेबसाइट पर जाएं"}
                    >
                      ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
