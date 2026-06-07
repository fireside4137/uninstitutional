/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";

export default function PYQsVaultPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [pyqs, setPyqs] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [isPremium, setIsPremium] = useState(false);
  const [search, setSearch] = useState("");
  
  // Filters
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [activeYear, setActiveYear] = useState("ALL");
  const [activeSubject, setActiveSubject] = useState("ALL");

  useEffect(() => {
    Promise.all([
      fetch("/api/information?type=pyqs").then((res) => res.json()),
      fetch("/api/bookmarks").then((res) => res.json()),
      fetch("/api/dashboard/summary").then((res) => res.json()),
    ])
      .then(([pyqsData, bookmarksData, summaryData]) => {
        setPyqs(pyqsData.pyqs || []);
        setIsPremium(!!summaryData?.user?.isPremium);
        const bMap: Record<string, boolean> = {};
        if (Array.isArray(bookmarksData)) {
          bookmarksData.forEach((b: any) => {
            bMap[`${b.itemType}_${b.itemId}`] = true;
          });
        }
        setBookmarks(bMap);
      })
      .catch((err) => console.error("Error loading PYQs Vault:", err))
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

  // Get unique filters
  const categories = ["ALL", ...Array.from(new Set(pyqs.map((p) => p.examCategory)))];
  const years = ["ALL", ...Array.from(new Set(pyqs.map((p) => String(p.year)))).sort((a, b) => b.localeCompare(a))];
  const subjects = [
    "ALL",
    ...Array.from(
      new Set(
        pyqs.map((p) => (lang === "en" ? p.subjectEn : p.subjectHi || p.subjectEn)).filter(Boolean)
      )
    ),
  ];

  const filteredPyqs = pyqs.filter((p) => {
    const matchesCategory = activeCategory === "ALL" || p.examCategory === activeCategory;
    const matchesYear = activeYear === "ALL" || String(p.year) === activeYear;
    
    const subjName = lang === "en" ? p.subjectEn : p.subjectHi || p.subjectEn;
    const matchesSubject = activeSubject === "ALL" || subjName === activeSubject;

    const searchLower = search.toLowerCase();
    const matchesSearch =
      p.titleEn.toLowerCase().includes(searchLower) ||
      p.titleHi.toLowerCase().includes(searchLower) ||
      p.examName.toLowerCase().includes(searchLower);

    return matchesCategory && matchesYear && matchesSubject && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">
          {lang === "en" ? "Opening PYQs Vault..." : "पीवाईक्यू वॉल्ट खोला जा रहा है..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Previous Year Papers (PYQs)" : "पिछले वर्ष के प्रश्न पत्र (PYQs)"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Download and revise official question papers for Uttarakhand recruitment exams."
            : "उत्तराखंड भर्ती परीक्षाओं के आधिकारिक प्रश्न पत्र डाउनलोड करें और उनका अभ्यास करें।"}
        </p>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={lang === "en" ? "Search papers by exam or description..." : "परीक्षा या विवरण द्वारा प्रश्न पत्र खोजें..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-xs">🔍</span>
        </div>

        {/* Filters Selectors Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "en" ? "Exam Category" : "परीक्षा श्रेणी"}
            </label>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? (lang === "en" ? "All Categories" : "सभी श्रेणियां") : c}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "en" ? "Exam Year" : "परीक्षा वर्ष"}
            </label>
            <select
              value={activeYear}
              onChange={(e) => setActiveYear(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === "ALL" ? (lang === "en" ? "All Years" : "सभी वर्ष") : y}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {lang === "en" ? "Subject/Topic" : "विषय / टॉपिक"}
            </label>
            <select
              value={activeSubject}
              onChange={(e) => setActiveSubject(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? (lang === "en" ? "All Subjects" : "सभी विषय") : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredPyqs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
          <span className="text-3xl block mb-3">🗄️</span>
          <p className="text-xs text-slate-500">
            {lang === "en" ? "No previous year papers match your filter criteria." : "आपके फ़िल्टर मानदंडों से मेल खाने वाला कोई प्रश्न पत्र नहीं मिला।"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPyqs.map((paper) => {
            const isBookmarked = !!bookmarks[`PYQPaper_${paper.id}`];
            const subjName = lang === "en" ? paper.subjectEn : paper.subjectHi || paper.subjectEn;

            return (
              <div
                key={paper.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold px-2 py-0.5 rounded">
                        {paper.examCategory}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-extrabold px-2 py-0.5 rounded">
                        {paper.year}
                      </span>
                      {subjName && (
                        <span className="bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold px-2 py-0.5 rounded">
                          {subjName}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleBookmark(paper.id, "PYQPaper")}
                      className="text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      {isBookmarked ? "⭐" : "☆"}
                    </button>
                  </div>

                  <h4 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                    {lang === "en" ? paper.titleEn : paper.titleHi}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {lang === "en" ? `Exam: ${paper.examName}` : `परीक्षा: ${paper.examName}`}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                  {paper.pdfUrl && (
                    isPremium ? (
                      <a
                        href={paper.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        📥 {lang === "en" ? "Download Paper" : "पेपर डाउनलोड करें"}
                      </a>
                    ) : (
                      <button
                        onClick={() => window.dispatchEvent(new Event("open-billing"))}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                      >
                        🔒 {lang === "en" ? "Unlock Paper (Pro)" : "पेपर अनलॉक करें (प्रो)"}
                      </button>
                    )
                  )}
                  {paper.officialLink && (
                    <a
                      href={paper.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-bold transition-colors text-center cursor-pointer"
                      title={lang === "en" ? "Official Source" : "आधिकारिक स्रोत"}
                    >
                      ↗
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
