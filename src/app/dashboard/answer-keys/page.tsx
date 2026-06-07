/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";

export default function AnswerKeysPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/information?type=answerkeys").then((res) => res.json()),
      fetch("/api/bookmarks").then((res) => res.json()),
    ])
      .then(([akData, bookmarksData]) => {
        setKeys(akData.answerKeys || []);
        const bMap: Record<string, boolean> = {};
        if (Array.isArray(bookmarksData)) {
          bookmarksData.forEach((b: any) => {
            bMap[`${b.itemType}_${b.itemId}`] = true;
          });
        }
        setBookmarks(bMap);
      })
      .catch((err) => console.error("Error loading Answer Keys:", err))
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

  const filteredKeys = keys.filter((k) => {
    const searchLower = search.toLowerCase();
    return (
      k.titleEn.toLowerCase().includes(searchLower) ||
      k.titleHi.toLowerCase().includes(searchLower) ||
      k.examNameEn.toLowerCase().includes(searchLower) ||
      k.examNameHi.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">
          {lang === "en" ? "Opening Answer Keys Index..." : "उत्तर कुंजी अनुक्रमणिका खोली जा रही है..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Answer Keys Directory" : "उत्तर कुंजी निर्देशिका"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Access official answer keys for recent Uttarakhand exams to verify your answers."
            : "अपने उत्तरों की जांच करने के लिए हालिया उत्तराखंड परीक्षाओं की आधिकारिक उत्तर कुंजी प्राप्त करें।"}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder={lang === "en" ? "Search by exam name or paper title..." : "परीक्षा या प्रश्न पत्र शीर्षक द्वारा खोजें..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      {/* List */}
      {filteredKeys.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
          <span className="text-3xl block mb-3">🔑</span>
          <p className="text-xs text-slate-500">
            {lang === "en" ? "No answer keys found matching your search." : "आपकी खोज से मेल खाने वाली कोई उत्तर कुंजी नहीं मिली।"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredKeys.map((item) => {
            const isBookmarked = !!bookmarks[`AnswerKey_${item.id}`];
            const releaseDate = item.releaseDate ? new Date(item.releaseDate) : new Date();

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {item.isOfficial && (
                      <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded">
                        ✓ Official Key
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {lang === "en" ? "Released: " : "जारी: "}
                      {releaseDate.toLocaleDateString(lang === "en" ? "en" : "hi", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h4 className="font-sora text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-1.5 leading-snug">
                    {lang === "en" ? item.titleEn : item.titleHi}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {lang === "en" ? `Exam: ${item.examNameEn}` : `परीक्षा: ${item.examNameHi}`}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => toggleBookmark(item.id, "AnswerKey")}
                    className="text-xs p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                  >
                    {isBookmarked ? "⭐" : "☆"}
                  </button>
                  {item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors text-center"
                    >
                      📥 {lang === "en" ? "Download Key PDF" : "उत्तर कुंजी डाउनलोड करें"}
                    </a>
                  )}
                  {item.officialLink && (
                    <a
                      href={item.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold transition-colors text-center"
                    >
                      {lang === "en" ? "Source ↗" : "स्रोत ↗"}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
