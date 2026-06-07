"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useLang } from "@/components/providers/LangProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useState, useEffect } from "react";

const sidebarItems = [
  { href: "/dashboard",          icon: "⊞", labelEn: "Home",             labelHi: "होम" },
  { href: "/dashboard/tasks",    icon: "📅", labelEn: "Daily Tasks",     labelHi: "दैनिक कार्य" },
  { href: "/dashboard/quiz",     icon: "🎯", labelEn: "Quiz Engine",     labelHi: "क्विज़" },
  { href: "/dashboard/exams",    icon: "🏛️", labelEn: "Exams Hub",       labelHi: "परीक्षा हब" },
  { href: "/dashboard/resources", icon: "📚", labelEn: "Study Material",  labelHi: "अध्ययन सामग्री" },
  { href: "/dashboard/pyqs",     icon: "📜", labelEn: "PYQs Vault",      labelHi: "पीवाईक्यू वॉल्ट" },
  { href: "/dashboard/current-affairs", icon: "📰", labelEn: "Current Affairs",  labelHi: "सामयिकी" },
  { href: "/dashboard/answer-keys", icon: "🔑", labelEn: "Answer Keys",     labelHi: "उत्तर कुंजी" },
  { href: "/dashboard/notifications", icon: "🔔", labelEn: "Notifications",   labelHi: "सूचनाएं" },
  { href: "/dashboard/progress", icon: "📊", labelEn: "My Progress",     labelHi: "प्रगति विश्लेषण" },
  { href: "/dashboard/rewards",  icon: "🔥", labelEn: "Rewards",          labelHi: "इनाम" },
];

const mobileNavItems = [
  { href: "/dashboard",          icon: "⊞", labelEn: "Home",     labelHi: "होम" },
  { href: "/dashboard/tasks",    icon: "📅", labelEn: "Tasks",    labelHi: "कार्य" },
  { href: "/dashboard/quiz",     icon: "🎯", labelEn: "Quiz",     labelHi: "क्विज़" },
  { href: "/dashboard/resources", icon: "📚", labelEn: "Study",    labelHi: "अध्ययन" },
  { href: "/dashboard/notifications", icon: "🔔", labelEn: "Notif",   labelHi: "सूचना" },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { lang, handleLangChange } = useLang();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; image: string | null; role?: string; isPremium?: boolean } | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/dashboard/summary");
      if (res.ok) {
        const d = await res.json();
        if (d?.user) {
          setUserProfile({ name: d.user.name, image: d.user.image, role: d.user.role, isPremium: d.user.isPremium });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile in Shell:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    
    const handleProfileUpdate = () => {
      fetchProfile();
    };
    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };
  const toggleLang = () => handleLangChange(lang === "en" ? "hi" : "en");

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-200 antialiased font-sans transition-colors duration-300">
      
      {/* ── Desktop Sidebar ── */}
      <aside 
        className={`hidden md:flex md:flex-col md:fixed md:top-0 md:left-0 md:bottom-0 ${
          isCollapsed ? "w-[70px]" : "w-[220px]"
        } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-6 z-50 transition-all duration-300 ease-in-out`}
      >
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute top-4 ${
            isCollapsed ? "right-2" : "right-4"
          } w-6 h-6 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer z-50`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>

        <Link 
          href="/dashboard" 
          className={`flex items-center gap-2 ${isCollapsed ? "px-4" : "px-5"} mb-8 transition-all duration-300 cursor-pointer`}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm font-sora shadow-sm shrink-0">
            UI
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-base text-slate-900 dark:text-white font-sora transition-opacity duration-300">
              UnInstitutional
            </span>
          )}
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto space-y-1 px-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {(userProfile?.role === "ADMIN" 
            ? [
                ...sidebarItems,
                { href: "/dashboard/admin", icon: "🛠️", labelEn: "Moderator Panel", labelHi: "मॉडरेटर पैनल" }
              ]
            : sidebarItems
          ).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 ${
                  isCollapsed ? "justify-center px-2 py-3" : "px-4 py-2.5"
                } rounded-lg text-sm font-semibold transition-all ${
                  active 
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold border-l-4 border-blue-600 rounded-l-none" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
                title={isCollapsed ? (lang === "en" ? item.labelEn : item.labelHi) : undefined}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <span className="transition-opacity duration-300">
                    {lang === "en" ? item.labelEn : item.labelHi}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Bottom Controls */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 px-3 space-y-1.5">
          {!isCollapsed ? (
            <>
              {!userProfile?.isPremium && (
                <button 
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-extrabold text-amber-600 dark:text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded-lg transition-all text-left cursor-pointer" 
                  onClick={() => window.dispatchEvent(new Event("open-billing"))}
                >
                  <span>👑</span>
                  <span>{lang === "en" ? "Upgrade to Pro" : "प्रो में अपग्रेड करें"}</span>
                </button>
              )}
              <button 
                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left" 
                onClick={toggleTheme}
              >
                <span>{theme === "light" ? "🌙" : "☀️"}</span>
                <span>{lang === "en" ? (theme === "light" ? "Dark Mode" : "Light Mode") : (theme === "light" ? "डार्क मोड" : "लाइट मोड")}</span>
              </button>
              <button 
                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all text-left" 
                onClick={toggleLang}
              >
                <span>🌐</span>
                <span>{lang === "en" ? "Switch to हिंदी" : "Switch to English"}</span>
              </button>
              <button 
                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all text-left" 
                onClick={() => setShowSignOutConfirm(true)}
              >
                <span>🚪</span>
                <span>{lang === "en" ? "Sign out" : "साइन आउट"}</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {!userProfile?.isPremium && (
                <button 
                  className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all border border-amber-500/20 cursor-pointer" 
                  onClick={() => window.dispatchEvent(new Event("open-billing"))}
                  title={lang === "en" ? "Upgrade to Pro" : "प्रो में अपग्रेड करें"}
                >
                  👑
                </button>
              )}
              <button 
                className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all" 
                onClick={toggleTheme}
                title={lang === "en" ? (theme === "light" ? "Dark Mode" : "Light Mode") : (theme === "light" ? "डार्क मोड" : "लाइट मोड")}
              >
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              <button 
                className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all" 
                onClick={toggleLang}
                title={lang === "en" ? "Switch to हिंदी" : "Switch to English"}
              >
                🌐
              </button>
              <button 
                className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all" 
                onClick={() => setShowSignOutConfirm(true)}
                title={lang === "en" ? "Sign out" : "साइन आउट"}
              >
                🚪
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main wrapper ── */}
      <div 
        className={`${
          isCollapsed ? "md:ml-[70px]" : "md:ml-[220px]"
        } flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-14 flex items-center justify-between transition-colors duration-300">
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white font-extrabold text-xs font-sora shadow-sm shrink-0">
              UI
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white font-sora">
              UnInstitutional
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button 
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-sm transition-colors cursor-pointer"
              onClick={toggleTheme}
              title={lang === "en" ? (theme === "light" ? "Dark Mode" : "Light Mode") : (theme === "light" ? "डार्क मोड" : "लाइट मोड")}
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            <button 
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-full text-[11px] font-extrabold text-slate-600 dark:text-slate-400 cursor-pointer transition-colors" 
              onClick={toggleLang}
            >
              {lang === "en" ? "हिंदी" : "EN"}
            </button>
            
            <div className="flex items-center gap-2">
              {userProfile?.isPremium && (
                <span 
                  className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase animate-pulse flex items-center gap-1 select-none"
                  title="Premium Subscriber"
                >
                  👑 PRO
                </span>
              )}
              <button 
                className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-xs font-extrabold text-blue-700 dark:text-blue-400 cursor-pointer shadow-sm transition-transform hover:scale-105 active:scale-95 overflow-hidden" 
                onClick={() => window.dispatchEvent(new Event("open-settings"))}
                title={lang === "en" ? "Profile Settings" : "प्रोफ़ाइल सेटिंग्स"}
              >
                {userProfile?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={userProfile.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : "U"
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl w-full mx-auto pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 h-16 flex items-stretch z-40 md:hidden shadow-lg transition-colors duration-300">
        {mobileNavItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex-1 flex flex-col items-center justify-center gap-1 text-center transition-all"
              style={{
                borderTop: active ? "3px solid #2563eb" : "3px solid transparent",
              }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className={`text-[10px] ${active ? "font-bold text-blue-600 dark:text-blue-400" : "font-semibold text-slate-400 dark:text-slate-500"}`}>
                {lang === "en" ? item.labelEn : item.labelHi}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Sign Out Confirmation Modal ── */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-xl space-y-4 transition-colors duration-300">
            <div className="text-center space-y-2">
              <span className="text-3xl">🚪</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sora">
                {lang === "en" ? "Confirm Sign Out" : "साइन आउट की पुष्टि करें"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {lang === "en" 
                  ? "Are you sure you want to sign out of UnInstitutional?" 
                  : "क्या आप निश्चित रूप से साइन आउट करना चाहते हैं?"}
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {lang === "en" ? "Cancel" : "रद्द करें"}
              </button>
              <button 
                onClick={handleSignOut}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm shadow-red-200 dark:shadow-none cursor-pointer"
              >
                {lang === "en" ? "Sign Out" : "साइन आउट"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}