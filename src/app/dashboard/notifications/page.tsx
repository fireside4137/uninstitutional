/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";

export default function NotificationsPage() {
  const { lang } = useLang();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/information?type=notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => console.error("Error loading Notifications:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">
          {lang === "en" ? "Opening Notification Center..." : "सूचना केंद्र खोला जा रहा है..."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Notification Center" : "सूचना केंद्र (Notification Center)"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Important board announcements, syllabus revisions, and exam form deadline alerts."
            : "बोर्ड की महत्वपूर्ण घोषणाएं, संशोधित पाठ्यक्रम, और परीक्षा आवेदन की समय सीमा अलर्ट।"}
        </p>
      </div>

      {/* Notifications Feed */}
      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center">
          <span className="text-3xl block mb-3">🔔</span>
          <p className="text-xs text-slate-500">
            {lang === "en" ? "No notification alerts found." : "कोई सूचना अलर्ट नहीं मिला।"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((item) => {
            const date = item.publishDate ? new Date(item.publishDate) : new Date();

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-xl p-5 shadow-sm transition-all hover:shadow-md relative overflow-hidden flex gap-4 ${
                  item.isNew
                    ? "border-blue-200 dark:border-blue-900/40 bg-gradient-to-r from-white to-blue-50/10 dark:from-slate-900 dark:to-blue-950/5"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Visual Status Indicator */}
                {item.isNew && (
                  <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-600" />
                )}

                <span className="text-2xl flex-shrink-0 mt-0.5">📢</span>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-extrabold px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.isNew && (
                      <span className="bg-blue-600 text-white text-[8px] font-extrabold px-2 py-0.5 rounded">
                        {lang === "en" ? "NEW" : "नया"}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {date.toLocaleDateString(lang === "en" ? "en" : "hi", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h4 className="font-sora text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                    {lang === "en" ? item.titleEn : item.titleHi}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {lang === "en" ? item.contentEn : item.contentHi}
                  </p>

                  {item.linkUrl && (
                    <div className="pt-2">
                      <a
                        href={item.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      >
                        {lang === "en" ? "Click to Open Official Notice ↗" : "आधिकारिक सूचना खोलने के लिए क्लिक करें ↗"}
                      </a>
                    </div>
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
