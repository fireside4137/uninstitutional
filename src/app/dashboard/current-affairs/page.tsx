/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";
import BookmarkButton from "@/components/dashboard/BookmarkButton";

export default function CurrentAffairsPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    Promise.all([
      fetch("/api/information?type=currentaffairs").then((res) => res.json()),
      fetch("/api/bookmarks").then((res) => res.json()),
    ])
      .then(([caData, bookmarksData]) => {
        setEvents(caData.currentAffairs || []);
        const bMap: Record<string, boolean> = {};
        if (Array.isArray(bookmarksData)) {
          bookmarksData.forEach((b: any) => {
            bMap[`${b.itemType}_${b.itemId}`] = true;
          });
        }
        setBookmarks(bMap);
      })
      .catch((err) => console.error("Error loading Current Affairs:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleBookmark = async (itemId: string, itemType: string) => {
    const key = `${itemType}_${itemId}`;
    const isBookmarked = !!bookmarks[key];

    setBookmarks((prev) => ({ ...prev, [key]: !isBookmarked }));

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, itemType }),
      });
      if (!res.ok) {
        setBookmarks((prev) => ({ ...prev, [key]: isBookmarked }));
      }
    } catch (err) {
      console.error(err);
      setBookmarks((prev) => ({ ...prev, [key]: isBookmarked }));
    }
  };

  const categories = ["ALL", "State", "National", "International", "Schemes", "Sports"];

  const filteredEvents = events.filter((ev) => {
    const matchesCategory = activeCategory === "ALL" || ev.category === activeCategory;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      ev.titleEn.toLowerCase().includes(searchLower) ||
      ev.titleHi.toLowerCase().includes(searchLower) ||
      (ev.summaryEn && ev.summaryEn.toLowerCase().includes(searchLower)) ||
      (ev.summaryHi && ev.summaryHi.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">
          {lang === "en" ? "Opening Current Affairs Digest..." : "सामयिकी संग्रह खोला जा रहा है..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Current Affairs" : "सामयिकी (Current Affairs)"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Short, exam-relevant summaries of regional, national and government policy updates."
            : "क्षेत्रीय, राष्ट्रीय और सरकारी नीतिगत घोषणाओं के संक्षिप्त परीक्षा-उपयोगी सारांश।"}
        </p>
      </div>

      {/* Categories + Search Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {lang === "en" ? cat : cat === "State" ? "राज्य समाचार" : cat === "National" ? "राष्ट्रीय" : cat === "International" ? "अंतर्राष्ट्रीय" : cat === "Schemes" ? "योजनाएं" : "खेल"}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder={lang === "en" ? "Search news & policies..." : "समाचार व नीतियां खोजें..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
          <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
          <span className="text-3xl block mb-3">📰</span>
          <p className="text-xs text-slate-500">
            {lang === "en" ? "No current affairs updates found matching your filters." : "आपके फ़िल्टर से मेल खाने वाला कोई सामयिकी अपडेट नहीं मिला।"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((ev) => {
            const isBookmarked = !!bookmarks[`CurrentAffairsEvent_${ev.id}`];
            const eventDate = ev.eventDate ? new Date(ev.eventDate) : new Date();

            return (
              <div
                key={ev.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold px-2 py-0.5 rounded">
                      {ev.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {eventDate.toLocaleDateString(lang === "en" ? "en" : "hi", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <BookmarkButton
                    isBookmarked={isBookmarked}
                    onClick={() => toggleBookmark(ev.id, "CurrentAffairsEvent")}
                    title={lang === "en" ? "Bookmark News" : "समाचार बुकमार्क करें"}
                  />
                </div>

                <h4 className="font-sora text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                  {lang === "en" ? ev.titleEn : ev.titleHi}
                </h4>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {lang === "en" ? ev.summaryEn : ev.summaryHi}
                </p>

                {ev.source && (
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      {lang === "en" ? `Source: ${ev.source}` : `स्रोत: ${ev.source}`}
                    </span>
                    {ev.sourceUrl && (
                      <a
                        href={ev.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        {lang === "en" ? "Official Reference ↗" : "आधिकारिक संदर्भ ↗"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
