/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";

export default function ResourcesHubPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [maps, setMaps] = useState<any[]>([]);
  const [govt, setGovt] = useState<any[]>([]);
  const [magazines, setMagazines] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [isPremium, setIsPremium] = useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<"maps" | "govt" | "magazines">("maps");
  // Filter for maps
  const [mapCategory, setMapCategory] = useState("ALL");
  // Zoomed Map Modal
  const [zoomedMap, setZoomedMap] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/information?type=maps").then((res) => res.json()),
      fetch("/api/information?type=govt").then((res) => res.json()),
      fetch("/api/information?type=magazines").then((res) => res.json()),
      fetch("/api/bookmarks").then((res) => res.json()),
      fetch("/api/dashboard/summary").then((res) => res.json()),
    ])
      .then(([mapsData, govtData, magazinesData, bookmarksData, summaryData]) => {
        setMaps(mapsData.maps || []);
        setGovt(govtData.govtLearning || []);
        setMagazines(magazinesData.magazines || []);
        setIsPremium(!!summaryData?.user?.isPremium);
        const bMap: Record<string, boolean> = {};
        if (Array.isArray(bookmarksData)) {
          bookmarksData.forEach((b: any) => {
            bMap[`${b.itemType}_${b.itemId}`] = true;
          });
        }
        setBookmarks(bMap);
      })
      .catch((err) => console.error("Error loading Resources:", err))
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

  const mapCategories = ["ALL", "District Maps", "River Maps", "Geography Maps", "Cultural Maps"];

  const filteredMaps = maps.filter((m) => mapCategory === "ALL" || m.category === mapCategory);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">
          {lang === "en" ? "Loading Study Resources..." : "अध्ययन सामग्री लोड हो रही है..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Resources Hub" : "संसाधन हब"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Visual maps for revision, government SWAYAM lectures, and curated monthly journals."
            : "रिवीजन के लिए मानचित्र, सरकारी स्वयं व्याख्यान, और चुनिंदा मासिक पत्रिकाएं।"}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "maps", labelEn: "🗺️ Visual Maps", labelHi: "🗺️ मानचित्र" },
          { id: "govt", labelEn: "📺 Govt Lectures", labelHi: "📺 सरकारी कक्षाएं" },
          { id: "magazines", labelEn: "📰 Magazines", labelHi: "📰 पत्रिकाएं" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 sm:flex-none px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            {lang === "en" ? tab.labelEn : tab.labelHi}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === "maps" && (
        <div className="space-y-5">
          {/* Map Filters */}
          <div className="flex flex-wrap gap-1.5 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            {mapCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setMapCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  mapCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {lang === "en" ? cat : cat.replace("Maps", "मानचित्र")}
              </button>
            ))}
          </div>

          {/* Maps Grid */}
          {filteredMaps.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              {lang === "en" ? "No maps found in this category." : "इस श्रेणी में कोई मानचित्र नहीं मिला।"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredMaps.map((map) => {
                const isBookmarked = !!bookmarks[`MapResource_${map.id}`];
                return (
                  <div
                    key={map.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col group"
                  >
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={map.imageUrl}
                        alt={map.titleEn}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      />
                      <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                          onClick={() => toggleBookmark(map.id, "MapResource")}
                          className="bg-white/95 dark:bg-slate-900/95 p-1.5 rounded-lg text-xs hover:bg-white transition-colors shadow-sm"
                        >
                          {isBookmarked ? "⭐" : "☆"}
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {map.category}
                        </span>
                        <h4 className="font-sora text-sm font-bold text-slate-900 dark:text-white leading-tight">
                          {lang === "en" ? map.titleEn : map.titleHi}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">
                          {lang === "en" ? map.descriptionEn : map.descriptionHi}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setZoomedMap(map)}
                          className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100/70 transition-colors cursor-pointer"
                        >
                          🔍 {lang === "en" ? "View Large" : "बड़ा देखें"}
                        </button>
                        {map.pdfUrl && (
                          isPremium ? (
                            <a
                              href={map.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
                              title={lang === "en" ? "Download PDF" : "पीडीएफ डाउनलोड करें"}
                            >
                              📥
                            </a>
                          ) : (
                            <button
                              onClick={() => window.dispatchEvent(new Event("open-billing"))}
                              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center cursor-pointer animate-pulse"
                              title={lang === "en" ? "Unlock with Pro" : "प्रो के साथ अनलॉक करें"}
                            >
                              🔒
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "govt" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            📺 {lang === "en" ? "Curated SWAYAM & NPTEL Video Playlists" : "सरकारी व्याख्यान और वीडियो प्लेलिस्ट"}
          </h3>

          {govt.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              {lang === "en" ? "No lecture playlist links added yet." : "अभी कोई व्याख्यान प्लेलिस्ट लिंक नहीं जोड़ा गया है।"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {govt.map((item) => {
                const isBookmarked = !!bookmarks[`GovtLearningLink_${item.id}`];
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                          {item.provider}
                        </span>
                        <button
                          onClick={() => toggleBookmark(item.id, "GovtLearningLink")}
                          className="text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {isBookmarked ? "⭐" : "☆"}
                        </button>
                      </div>

                      <h4 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">
                        {lang === "en" ? item.titleEn : item.titleHi}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                        {lang === "en" ? item.descriptionEn : item.descriptionHi}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
                        📚 {lang === "en" ? item.subjectEn : item.subjectHi}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {lang === "en" ? "Watch Lectures ↗" : "व्याख्यान देखें ↗"}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "magazines" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            📰 {lang === "en" ? "Yojana, Kurukshetra & Official digests" : "योजना, कुरुक्षेत्र और सरकारी पत्रिकाएं"}
          </h3>

          {magazines.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 text-xs">
              {lang === "en" ? "No magazines uploaded yet." : "अभी कोई पत्रिकाएं अपलोड नहीं की गई हैं।"}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {magazines.map((mag) => {
                const isBookmarked = !!bookmarks[`MagazineResource_${mag.id}`];
                return (
                  <div
                    key={mag.id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shadow-sm relative"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">
                          {mag.type}
                        </span>
                        <button
                          onClick={() => toggleBookmark(mag.id, "MagazineResource")}
                          className="text-xs p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          {isBookmarked ? "⭐" : "☆"}
                        </button>
                      </div>

                      <div className="w-full aspect-[4/5] bg-slate-100 dark:bg-slate-950 rounded-lg flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-800/50 mb-4 text-center p-3 relative overflow-hidden">
                        {/* Styled Cover Representation */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />
                        <span className="text-2xl mb-2">📖</span>
                        <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 max-w-[120px] leading-tight">
                          {lang === "en" ? mag.titleEn : mag.titleHi}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">
                          {mag.publishMonth}
                        </div>
                      </div>

                      <h4 className="font-sora text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {lang === "en" ? mag.titleEn : mag.titleHi}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-normal">
                        {lang === "en" ? mag.descriptionEn : mag.descriptionHi}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
                      {isPremium ? (
                        <a
                          href={mag.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors block text-center cursor-pointer"
                        >
                          📥 {lang === "en" ? "Read/Download" : "पढ़ें/डाउनलोड"}
                        </a>
                      ) : (
                        <button
                          onClick={() => window.dispatchEvent(new Event("open-billing"))}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors block text-center cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          🔒 {lang === "en" ? "Unlock Magazine (Pro)" : "पत्रिका अनलॉक करें (प्रो)"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Map Zoom Modal */}
      {zoomedMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setZoomedMap(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 z-10 cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 pr-12">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                {zoomedMap.category}
              </span>
              <h3 className="font-sora text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {lang === "en" ? zoomedMap.titleEn : zoomedMap.titleHi}
              </h3>
            </div>

            {/* Large Image Scrollable Container */}
            <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center min-h-[300px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={zoomedMap.imageUrl}
                alt={zoomedMap.titleEn}
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[70%] leading-normal pr-4">
                {lang === "en" ? zoomedMap.descriptionEn : zoomedMap.descriptionHi}
              </p>
              {zoomedMap.pdfUrl && (
                isPremium ? (
                  <a
                    href={zoomedMap.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    📥 {lang === "en" ? "Download PDF Map" : "मानचित्र डाउनलोड करें"}
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setZoomedMap(null);
                      window.dispatchEvent(new Event("open-billing"));
                    }}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    🔒 {lang === "en" ? "Unlock PDF Map (Pro)" : "मानचित्र अनलॉक करें (प्रो)"}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
