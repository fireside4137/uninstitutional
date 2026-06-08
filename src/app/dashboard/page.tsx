/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLang } from "@/components/providers/LangProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const t = {
  en: {
    greeting: "Good morning",
    sub: "Ready to study today?",
    streak_label: "Day Streak",
    points_label: "Points",
    task_title: "Today's Task",
    task_sub: "Complete your daily topic + quiz",
    task_btn: "Start Today's Task →",
    no_task: "All done for today! Check back tomorrow.",
    progress_title: "Your Progress",
    syllabus: "Syllabus covered",
    topics_done: "Topics done",
    quizzes_done: "Quizzes done",
    strong_title: "Strong Topics",
    weak_title: "Needs Revision",
    no_data: "Complete some quizzes to see your analysis.",
    exam_badge: "Preparing for",
    quick_title: "Quick Actions",
    q1: "Previous Year Papers",
    q2: "My Notes",
    q3: "Leaderboard",
    q4: "Settings",
    coming_soon: "Coming soon",
    loading: "Loading Dashboard...",
  },
  hi: {
    greeting: "सुप्रभात",
    sub: "क्या आज पढ़ने के लिए तैयार हैं?",
    streak_label: "दिन की स्ट्रीक",
    points_label: "पॉइंट्स",
    task_title: "आज का कार्य",
    task_sub: "दैनिक टॉपिक + क्विज़ पूरा करें",
    task_btn: "आज का कार्य शुरू करें →",
    no_task: "आज के सभी कार्य पूरे हो गए! कल दोबारा जांचें।",
    progress_title: "आपकी प्रगति",
    syllabus: "सिलेबस कवर",
    topics_done: "टॉपिक पूरे",
    quizzes_done: "क्विज़ पूरे",
    strong_title: "मजबूत टॉपिक",
    weak_title: "रिवीजन जरूरी",
    no_data: "विश्लेषण देखने के लिए कुछ क्विज़ पूरे करें।",
    exam_badge: "तैयारी कर रहे हैं",
    quick_title: "त्वरित क्रियाएं",
    q1: "पिछले वर्ष के प्रश्न",
    q2: "मेरे नोट्स",
    q3: "लीडरबोर्ड",
    q4: "सेटिंग्स",
    coming_soon: "जल्द आ रहा है",
    loading: "डैशबोर्ड लोड हो रहा है...",
  },
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function DashboardPage() {
  const { lang } = useLang();
  const tr = t[lang];
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [showSettings, setShowSettings] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [billingStep, setBillingStep] = useState<"pricing" | "processing" | "success">("pricing");
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Privacy & Data state
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard summary:", err);
        setLoading(false);
      });

    const handleOpenSettings = () => {
      setShowSettings(true);
    };
    const handleOpenBilling = () => {
      setShowBilling(true);
      setBillingStep("pricing");
    };
    window.addEventListener("open-settings", handleOpenSettings);
    window.addEventListener("open-billing", handleOpenBilling);
    return () => {
      window.removeEventListener("open-settings", handleOpenSettings);
      window.removeEventListener("open-billing", handleOpenBilling);
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimeTypes.includes(file.type)) {
      setErrorMsg(
        lang === "en" 
          ? "Only JPG, PNG, and WEBP images are allowed." 
          : "केवल JPG, PNG और WEBP छवियों की अनुमति है।"
      );
      return;
    }
    
    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMsg(
        lang === "en" 
          ? "Image size should be less than 1.5MB." 
          : "छवि का आकार 1.5MB से कम होना चाहिए।"
      );
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const base64 = await compressImage(file);
      const res = await fetch("/api/user/profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (res.ok) {
        const d = await res.json();
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              image: d.image,
            },
          };
        });
        setSuccessMsg(
          lang === "en" 
            ? "Profile picture updated successfully!" 
            : "प्रोफ़ाइल फ़ोटो सफलतापूर्वक अपडेट हो गई!"
        );
        window.dispatchEvent(new Event("profile-updated"));
      } else {
        const d = await res.json();
        setErrorMsg(
          lang === "en" 
            ? d.error || "Failed to upload image." 
            : d.error || "छवि अपलोड करने में विफल।"
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(
        lang === "en" 
          ? "An error occurred." 
          : "एक त्रुटि हुई।"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/user/profile-picture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });

      if (res.ok) {
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              image: null,
            },
          };
        });
        setSuccessMsg(lang === "en" ? "Profile picture removed successfully!" : "प्रोफ़ाइल फ़ोटो सफलतापूर्वक हटा दी गई!");
        window.dispatchEvent(new Event("profile-updated"));
      } else {
        setErrorMsg(lang === "en" ? "Failed to remove image." : "छवि हटाने में विफल।");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "en" ? "An error occurred." : "एक त्रुटि हुई।");
    } finally {
      setUploading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setBillingStep("processing");
    setErrorMsg("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const res = await fetch("/api/user/upgrade", {
        method: "POST",
      });
      if (res.ok) {
        setBillingStep("success");
        setData((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            user: {
              ...prev.user,
              isPremium: true,
            },
          };
        });
        window.dispatchEvent(new Event("profile-updated"));
      } else {
        setBillingStep("pricing");
        setErrorMsg(lang === "en" ? "Failed to verify transaction. Try again." : "लेनदेन सत्यापित करने में विफल। दोबारा प्रयास करें।");
      }
    } catch (err) {
      console.error(err);
      setBillingStep("pricing");
      setErrorMsg(lang === "en" ? "An error occurred during payment." : "भुगतान के दौरान एक त्रुटि हुई।");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">{tr.loading}</p>
      </div>
    );
  }

  const user = data?.user || {
    name: "User",
    examType: "UKPSC",
    streak: 0,
    points: 0,
    topicsDone: 0,
    quizzesDone: 0,
    syllabusPercent: 0,
    isPremium: false,
  };

  const dailyTask = data?.dailyTask;
  const strongTopics = data?.strongTopics || [];
  const weakTopics = data?.weakTopics || [];
  const upcomingExams = data?.upcomingExams || [];
  const formsClosingSoon = data?.formsClosingSoon || [];
  const latestAnnouncements = data?.latestAnnouncements || [];

  const examColor = user.examType === "UKPSC" ? "#1D4ED8" : "#059669";
  const examBg = user.examType === "UKPSC" ? "#EFF6FF" : "#ECFDF5";

  const handleExportData = async () => {
    setExportLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/user/export-data");
      if (!res.ok) {
        setErrorMsg(lang === "en" ? "Failed to export data." : "डेटा निर्यात करने में विफल।");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().split("T")[0];
      a.download = `uninstitutional-my-data-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg(lang === "en" ? "Data exported successfully!" : "डेटा सफलतापूर्वक निर्यात हो गया!");
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "en" ? "An error occurred while exporting data." : "डेटा निर्यात करते समय एक त्रुटि हुई।");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setDeleteLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        setShowSettings(false);
        // Sign out and redirect to landing page
        await signOut({ redirect: false });
        router.push("/");
      } else {
        const d = await res.json();
        setErrorMsg(d.error || (lang === "en" ? "Failed to delete account." : "खाता हटाने में विफल।"));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "en" ? "An error occurred." : "एक त्रुटि हुई।");
    } finally {
      setDeleteLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? tr.greeting
      : hour < 17
      ? lang === "en"
        ? "Good afternoon"
        : "नमस्ते"
      : lang === "en"
      ? "Good evening"
      : "शुभ संध्या";

  return (
    <div style={{ padding: "1rem" }}>
      {/* Greeting + exam badge */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {greeting}, {user.name} 👋
            </h1>
            {user.isPremium && (
              <span style={{ background: "#FEF3C7", color: "#D97706", border: "1px solid #FCD34D", fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 10, letterSpacing: "0.05em" }}>
                👑 PRO
              </span>
            )}
          </div>
          <span style={{ background: examBg, color: examColor, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
            {user.examType}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "#64748B" }}>{tr.sub}</p>
      </div>

      {/* Streak + Points row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.25rem" }}>
        {/* Streak */}
        <Link href="/dashboard/rewards" style={{ textDecoration: "none" }}>
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "1rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔥</div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, color: "#F59E0B", lineHeight: 1 }}>{user.streak}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontWeight: 500 }}>{tr.streak_label}</div>
            </div>
          </div>
        </Link>
        {/* Points */}
        <Link href="/dashboard/rewards" style={{ textDecoration: "none" }}>
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "1rem", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>⭐</div>
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 700, color: "#059669", lineHeight: 1 }}>{user.points}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2, fontWeight: 500 }}>{tr.points_label}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Today's Task card */}
      {dailyTask ? (
        <div style={{ background: "#fff", border: `1.5px solid ${examColor}22`, borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem", position: "relative", overflow: "hidden" }}>
          {/* Accent bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: examColor, borderRadius: "16px 16px 0 0" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{tr.task_title}</p>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.3 }}>
                {lang === "en" ? dailyTask.topic.title : dailyTask.topic.titleHi}
              </h2>
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                {lang === "en" ? dailyTask.topic.subject.name : dailyTask.topic.subject.nameHi}
              </p>
            </div>
            <div style={{ background: examBg, borderRadius: 10, padding: "6px 10px", textAlign: "center", flexShrink: 0, marginLeft: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: examColor }}>{dailyTask.topic.estimatedMinutes}</div>
              <div style={{ fontSize: 9, color: examColor, fontWeight: 600 }}>MIN</div>
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
            <span style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#475569" }}>
              📝 {dailyTask.topic.questionsCount} {lang === "en" ? "questions" : "प्रश्न"}
            </span>
            <span style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 20, padding: "3px 10px", fontSize: 11, color: "#475569" }}>
              {dailyTask.isCompleted ? (
                <span className="text-green-600 font-bold">✓ {lang === "en" ? "Completed!" : "पूरा हो गया!"}</span>
              ) : (
                <span>📖 {lang === "en" ? "Read + Quiz" : "पढ़ें + क्विज़"}</span>
              )}
            </span>
          </div>

          <Link
            href="/dashboard/tasks"
            style={{
              display: "block",
              textAlign: "center",
              background: examColor,
              color: "#fff",
              borderRadius: 10,
              padding: "11px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
          >
            {tr.task_btn}
          </Link>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.5rem", marginBottom: "1.25rem", textAlign: "center" }}>
          <p style={{ fontSize: 18 }}>🎉</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginTop: 8 }}>{tr.no_task}</p>
        </div>
      )}

      {/* Progress */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: "0.75rem" }}>{tr.progress_title}</p>

        {/* Syllabus bar */}
        <div style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>{tr.syllabus}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: examColor }}>{user.syllabusPercent}%</span>
          </div>
          <div style={{ height: 6, background: "#F1F5F9", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ width: `${user.syllabusPercent}%`, height: "100%", background: examColor, borderRadius: 10, transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "'Sora', sans-serif" }}>{user.topicsDone}</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>{tr.topics_done}</div>
          </div>
          <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", fontFamily: "'Sora', sans-serif" }}>{user.quizzesDone}</div>
            <div style={{ fontSize: 11, color: "#94A3B8" }}>{tr.quizzes_done}</div>
          </div>
        </div>
      </div>

      {/* Strong / Weak topics */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: "0.75rem" }}>
          {lang === "en" ? "Topic Analysis" : "टॉपिक विश्लेषण"}
        </p>

        {strongTopics.length === 0 && weakTopics.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", padding: "1rem 0" }}>{tr.no_data}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {strongTopics.map((topic: string) => (
              <div key={topic} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#F0FDF4", borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>💪</span>
                <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>{topic}</span>
              </div>
            ))}
            {weakTopics.map((topic: any) => (
              <div key={topic.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#FEF2F2", borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>📌</span>
                <span style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>
                  {topic.name} ({topic.reason})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Alerts & Announcements */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "1.25rem", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", margin: 0 }}>
            {lang === "en" ? "Exam Alerts & Announcements" : "परीक्षा अलर्ट और घोषणाएं"}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/dashboard/exams" style={{ fontSize: 11, fontWeight: 600, color: examColor, textDecoration: "none" }}>
              {lang === "en" ? "Exams Hub →" : "परीक्षा हब →"}
            </Link>
            <Link href="/dashboard/notifications" style={{ fontSize: 11, fontWeight: 600, color: examColor, textDecoration: "none" }}>
              {lang === "en" ? "Notifications →" : "सूचनाएं →"}
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Upcoming Exams and Closing Forms widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upcoming Exams */}
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px", border: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>🏛️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                  {lang === "en" ? "Upcoming Exams" : "आगामी परीक्षाएं"}
                </span>
              </div>
              {upcomingExams.length === 0 ? (
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{lang === "en" ? "No exams scheduled" : "कोई परीक्षा निर्धारित नहीं है"}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {upcomingExams.map((ex: any) => {
                    const diffDays = ex.examDate ? Math.ceil((new Date(ex.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    return (
                      <div key={ex.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "8px 10px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#1E293B", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {lang === "en" ? ex.titleEn : ex.titleHi}
                          </div>
                          <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                            {ex.examDate ? new Date(ex.examDate).toLocaleDateString(lang === "en" ? "en" : "hi", { month: "short", day: "numeric", year: "numeric" }) : ""}
                          </div>
                        </div>
                        <span style={{ background: examBg, color: examColor, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>
                          {diffDays > 0 ? `${diffDays} ${lang === "en" ? "days to go" : "दिन बाकी"}` : (lang === "en" ? "Completed" : "पूरा हुआ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Forms Closing Soon */}
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px", border: "1px solid #F1F5F9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                  {lang === "en" ? "Forms Closing Soon" : "आवेदन की अंतिम तिथि"}
                </span>
              </div>
              {formsClosingSoon.length === 0 ? (
                <p style={{ fontSize: 11, color: "#94A3B8" }}>{lang === "en" ? "No closing forms" : "कोई अंतिम तिथि नहीं है"}</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {formsClosingSoon.map((f: any) => {
                    const diffDays = f.formCloseDate ? Math.ceil((new Date(f.formCloseDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    const alertColor = diffDays <= 3 ? "#DC2626" : "#D97706";
                    const alertBg = diffDays <= 3 ? "#FEF2F2" : "#FFFBEB";
                    return (
                      <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "8px 10px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#1E293B", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {lang === "en" ? f.titleEn : f.titleHi}
                          </div>
                          <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>
                            {lang === "en" ? "Close: " : "बंद: "}{f.formCloseDate ? new Date(f.formCloseDate).toLocaleDateString(lang === "en" ? "en" : "hi", { month: "short", day: "numeric" }) : ""}
                          </div>
                        </div>
                        {f.applyUrl ? (
                          <a href={f.applyUrl} target="_blank" rel="noopener noreferrer" style={{ background: alertBg, color: alertColor, fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 6, textDecoration: "none", border: `1px solid ${alertColor}33` }}>
                            {diffDays > 0 ? `${diffDays}d ${lang === "en" ? "left" : "शेष"}` : (lang === "en" ? "Apply" : "आवेदन")}
                          </a>
                        ) : (
                          <span style={{ background: alertBg, color: alertColor, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>
                            {diffDays > 0 ? `${diffDays}d ${lang === "en" ? "left" : "शेष"}` : (lang === "en" ? "Closed" : "बंद")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Latest Announcements */}
          <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "12px", border: "1px solid #F1F5F9" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 14 }}>🔔</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#334155" }}>
                {lang === "en" ? "Latest Announcements" : "नवीनतम घोषणाएं"}
              </span>
            </div>
            {latestAnnouncements.length === 0 ? (
              <p style={{ fontSize: 11, color: "#94A3B8" }}>{lang === "en" ? "No announcements" : "कोई घोषणा नहीं है"}</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {latestAnnouncements.map((ann: any) => (
                  <div key={ann.id} style={{ display: "flex", gap: 10, background: "#fff", padding: "10px", borderRadius: 8, border: "1px solid #E2E8F0" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>📢</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#1E293B" }}>
                          {lang === "en" ? ann.titleEn : ann.titleHi}
                        </span>
                        <span style={{ fontSize: 9, color: "#94A3B8", flexShrink: 0 }}>
                          {ann.publishDate ? new Date(ann.publishDate).toLocaleDateString(lang === "en" ? "en" : "hi", { month: "short", day: "numeric" }) : ""}
                        </span>
                      </div>
                      <p style={{ fontSize: 10.5, color: "#64748B", marginTop: 4, lineHeight: 1.4 }}>
                        {lang === "en" ? ann.contentEn : ann.contentHi}
                      </p>
                      {ann.linkUrl && (
                        <a href={ann.linkUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", fontSize: 10, color: examColor, fontWeight: 600, marginTop: 4, textDecoration: "none" }}>
                          {lang === "en" ? "Read Official Notice →" : "आधिकारिक सूचना पढ़ें →"}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: "0.75rem" }}>{tr.quick_title}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: "📄", label: lang === "en" ? "Previous Papers" : "पिछले पेपर", disabled: true },
            { icon: "📝", label: lang === "en" ? "My Notes" : "मेरे नोट्स", disabled: true },
            { icon: "🏆", label: lang === "en" ? "Leaderboard" : "लीडरबोर्ड", disabled: true },
            { icon: "⚙️", label: lang === "en" ? "Settings" : "सेटिंग्स", disabled: false },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => {
                if (!item.disabled) {
                  setShowSettings(true);
                }
              }}
              style={{
                background: "#fff",
                border: item.disabled ? "1px solid #E2E8F0" : `1.5px solid ${examColor}55`,
                borderRadius: 12,
                padding: "14px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: item.disabled ? "default" : "pointer",
                opacity: item.disabled ? 0.7 : 1,
                transition: "all 0.2s",
              }}
              className={item.disabled ? "" : "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{item.label}</div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>
                  {item.disabled ? tr.coming_soon : (lang === "en" ? "Manage Profile" : "प्रोफ़ाइल प्रबंधित करें")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Settings / Profile Picture Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 transition-colors duration-300 relative text-left">
            {/* Close icon */}
            <button 
              onClick={() => {
                setShowSettings(false);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-bold text-base cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sora">
                {lang === "en" ? "Profile Settings" : "प्रोफ़ाइल सेटिंग्स"}
              </h3>
              
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 dark:border-slate-800 shadow-inner flex items-center justify-center text-3xl font-extrabold text-blue-700 bg-blue-50 relative overflow-hidden shrink-0">
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed max-w-[250px]">
                  {lang === "en" 
                    ? "Upload a photo (JPEG/PNG, max 1.5MB) or remove it to return to your initials." 
                    : "एक फ़ोटो अपलोड करें (JPEG/PNG, अधिकतम 1.5MB) या नाम के पहले अक्षर के लिए इसे हटा दें।"}
                </p>
              </div>
            </div>

            {/* Status Alerts */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-center text-xs font-semibold font-sans">
                ⚠️ {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl p-3 text-center text-xs font-semibold font-sans">
                ✓ {successMsg}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <input 
                type="file" 
                id="avatar-file-input" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
                disabled={uploading}
              />
              <button
                onClick={() => document.getElementById("avatar-file-input")?.click()}
                disabled={uploading}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                  user.examType === "UKSSC" 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none" 
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-100 dark:shadow-none"
                }`}
              >
                📷 {lang === "en" ? "Upload New Photo" : "नई फ़ोटो अपलोड करें"}
              </button>
              
              {user.image && (
                <button
                  onClick={handleRemovePhoto}
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer"
                >
                  🗑️ {lang === "en" ? "Remove Current Photo" : "वर्तमान फ़ोटो हटाएं"}
                </button>
              )}

              <button
                onClick={() => {
                  setShowSettings(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                disabled={uploading}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                {lang === "en" ? "Close" : "बंद करें"}
              </button>
            </div>

            {/* ── Privacy & Data Section ── */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  🔒 {lang === "en" ? "Privacy & Data" : "गोपनीयता और डेटा"}
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
                  {lang === "en" ? "Manage your personal data and privacy preferences." : "अपने व्यक्तिगत डेटा और गोपनीयता प्राथमिकताओं को प्रबंधित करें।"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                {/* View Privacy Policy */}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="w-full py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors text-center no-underline flex items-center justify-center gap-1.5"
                >
                  📄 {lang === "en" ? "View Privacy Policy" : "गोपनीयता नीति देखें"}
                </Link>

                {/* Export My Data */}
                <button
                  onClick={handleExportData}
                  disabled={exportLoading}
                  className="w-full py-2 rounded-xl border border-blue-200 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {exportLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      {lang === "en" ? "Downloading data..." : "डेटा डाउनलोड हो रहा है..."}
                    </>
                  ) : (
                    <>
                      📥 {lang === "en" ? "Export My Data" : "मेरा डेटा निर्यात करें"}
                    </>
                  )}
                </button>

                {/* Delete Account */}
                <button
                  onClick={() => {
                    setShowDeleteConfirm(true);
                    setDeleteInput("");
                    setErrorMsg("");
                  }}
                  className="w-full py-2 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  ⚠️ {lang === "en" ? "Delete Account" : "खाता हटाएं"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 transition-colors duration-300 relative text-left">
            {/* Close */}
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteInput("");
                setErrorMsg("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-bold text-base cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-3">
              <span className="text-4xl block">⚠️</span>
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 font-sora">
                {lang === "en" ? "Delete Your Account?" : "अपना खाता हटाएं?"}
              </h3>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-3 text-xs text-red-600 dark:text-red-400 font-semibold leading-relaxed text-left space-y-1">
                <p>{lang === "en" ? "This action cannot be undone. Your account will be permanently deleted and all personal information will be anonymized." : "यह कार्रवाई पूर्ववत नहीं की जा सकती। आपका खाता स्थायी रूप से हटा दिया जाएगा और सभी व्यक्तिगत जानकारी अनामिक कर दी जाएगी।"}</p>
                <p>{lang === "en" ? "You will lose: your profile, learning progress, quiz history, reward points, streaks, and bookmarks." : "आप खो देंगे: अपनी प्रोफ़ाइल, अध्ययन प्रगति, क्विज़ इतिहास, इनाम अंक, स्ट्रीक, और बुकमार्क।"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {lang === "en" ? "Type DELETE to confirm:" : "पुष्टि के लिए DELETE टाइप करें:"}
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-800 placeholder-slate-300 dark:placeholder-slate-600 outline-none transition-all focus:ring-4 focus:ring-red-100/50 dark:focus:ring-red-900/30 focus:border-red-400"
                autoComplete="off"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-center text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                  setErrorMsg("");
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "रद्द करें"}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shadow-red-200 dark:shadow-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {lang === "en" ? "Deleting..." : "हटाया जा रहा है..."}
                  </>
                ) : (
                  <>{lang === "en" ? "Confirm Delete" : "हटाने की पुष्टि करें"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Simulated Upgrade to Premium Modal ── */}
      {showBilling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800 dark:text-slate-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5 transition-colors duration-300 relative text-left">
            {/* Close Button */}
            <button 
              onClick={() => {
                setShowBilling(false);
                setErrorMsg("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors font-bold text-base cursor-pointer"
            >
              ✕
            </button>

            {billingStep === "pricing" && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-4xl block">👑</span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sora">
                    {lang === "en" ? "Upgrade to Aspirant Pro" : "एस्पिरेंट प्रो में अपग्रेड करें"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === "en" 
                      ? "Get unlimited offline access and unlock premium study resources." 
                      : "असीमित ऑफ़लाइन पहुंच प्राप्त करें और प्रीमियम अध्ययन सामग्री अनलॉक करें।"}
                  </p>
                </div>

                {/* Price Card */}
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-4 text-center space-y-1.5 relative overflow-hidden">
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full select-none">
                    BEST VALUE
                  </div>
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-500">ASPIRANT PRO</div>
                  <div className="font-sora text-3xl font-extrabold text-slate-800 dark:text-white">
                    ₹299 <span className="text-xs font-medium text-slate-400">/ {lang === "en" ? "year" : "वर्ष"}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {lang === "en" ? "Billed annually. Cancel anytime." : "वार्षिक शुल्क। कभी भी रद्द करें।"}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{lang === "en" ? "Download all Map Revision PDFs in high resolution" : "सभी मानचित्र रिवीजन पीडीएफ उच्च रिज़ॉल्यूशन में डाउनलोड करें"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{lang === "en" ? "Download all Yojana & Kurukshetra journals" : "सभी योजना और कुरुक्षेत्र पत्रिकाओं को डाउनलोड करें"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{lang === "en" ? "Download full PYQ Previous Year papers PDF vault" : "पूर्ण पीवाईक्यू पिछले वर्ष के पेपर पीडीएफ डाउनलोड करें"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{lang === "en" ? "Unlimited access to answer key sheets" : "उत्तर कुंजी शीट्स तक असीमित पहुंच"}</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-center text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <button 
                  onClick={handleUpgradeToPro}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-100 dark:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  💳 {lang === "en" ? "Pay ₹299 & Upgrade" : "₹299 भुगतान करें और अपग्रेड करें"}
                </button>
              </div>
            )}

            {billingStep === "processing" && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="font-sora text-sm font-bold text-slate-800 dark:text-white">
                    {lang === "en" ? "Processing Transaction..." : "लेनदेन संसाधित हो रहा है..."}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {lang === "en" ? "Securing connection and verifying mock gateway tokens." : "सुरक्षित कनेक्शन स्थापित किया जा रहा है..."}
                  </p>
                </div>
              </div>
            )}

            {billingStep === "success" && (
              <div className="text-center py-6 space-y-4">
                <span className="text-5xl block animate-bounce">🎉</span>
                <div className="space-y-1">
                  <h4 className="font-sora text-base font-extrabold text-slate-800 dark:text-white">
                    {lang === "en" ? "Upgrade Successful!" : "अपग्रेड सफल रहा!"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                    {lang === "en" 
                      ? "Congratulations! You are now an Aspirant Pro member. Enjoy unlimited PDF downloads." 
                      : "बधाई हो! अब आप एस्पिरेंट प्रो सदस्य हैं। असीमित पीडीएफ डाउनलोड का आनंद लें।"}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowBilling(false);
                    setErrorMsg("");
                  }}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {lang === "en" ? "Done" : "ठीक है"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}