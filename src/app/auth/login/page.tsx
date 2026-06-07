
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

const translations = {
  en: {
    lang_toggle: "हिंदी",
    welcome_back: "Welcome back",
    login_sub: "Continue your preparation journey.",
    email_label: "Email address",
    email_placeholder: "you@example.com",
    pass_label: "Password",
    pass_placeholder: "Enter your password",
    forgot: "Forgot password?",
    login_btn: "Login",
    logging_in: "Logging in...",
    no_account: "Don't have an account?",
    register_link: "Register here",
    back_home: "← Back to home",
    preparing_for: "Preparing for",
    error_fill: "Please fill in all fields.",
    error_invalid: "Invalid email or password.",
  },
  hi: {
    lang_toggle: "English",
    welcome_back: "वापस स्वागत है",
    login_sub: "अपनी तैयारी जारी रखें।",
    email_label: "ईमेल पता",
    email_placeholder: "aap@example.com",
    pass_label: "पासवर्ड",
    pass_placeholder: "अपना पासवर्ड दर्ज करें",
    forgot: "पासवर्ड भूल गए?",
    login_btn: "लॉगिन करें",
    logging_in: "लॉगिन हो रहा है...",
    no_account: "खाता नहीं है?",
    register_link: "यहाँ रजिस्टर करें",
    back_home: "← होम पर वापस जाएं",
    preparing_for: "तैयारी कर रहे हैं",
    error_fill: "कृपया सभी फ़ील्ड भरें।",
    error_invalid: "अमान्य ईमेल या पासवर्ड।",
  },
};

type Lang = "en" | "hi";

const examMeta = {
  ukpsc: { label: "UKPSC", color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE" },
  ukssc: { label: "UKSSC", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examParam = (searchParams.get("exam") || "ukpsc") as "ukpsc" | "ukssc";
  const exam = examMeta[examParam] || examMeta.ukpsc;

  const [lang, setLang] = useState<Lang>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError(t.error_fill); return; }
    setLoading(true);

    try {
      // 1. Verify that the user portal matches their registered exam type
      const portalRes = await fetch("/api/auth/check-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, examPortal: examParam.toUpperCase() })
      });

      if (portalRes.ok) {
        const portalData = await portalRes.json();
        if (!portalData.valid) {
          setLoading(false);
          const portalName = portalData.userExam;
          setError(lang === "en" 
            ? `Your account is registered under the ${portalName} portal. Please login there.`
            : `आपका खाता ${portalName} पोर्टल के तहत पंजीकृत है। कृपया वहां से लॉगिन करें।`
          );
          return;
        }
      }
    } catch (err) {
      console.error("Portal verification failed:", err);
    }
   
    const result = await signIn("credentials", {
      email,
      password,
      examPortal: examParam.toUpperCase(),
      redirect: false,
    });
   
    setLoading(false);
   
    if (result?.error) {
      setError(t.error_invalid);
    } else {
      router.push("/dashboard");
    }
  };

  const ringClass = examParam === "ukssc" ? "focus:border-emerald-500 focus:ring-emerald-100/50" : "focus:border-blue-500 focus:ring-blue-100/50";
  const btnClass = examParam === "ukssc" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100";
  const textClass = examParam === "ukssc" ? "text-emerald-600" : "text-blue-600";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top bar */}
      <div className="px-6 py-4 md:px-8 flex justify-between items-center max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 text-decoration-none">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm font-sora shadow-sm">UI</div>
          <span className="font-extrabold text-base text-slate-900 font-sora">UnInstitutional</span>
        </Link>
        <button 
          onClick={() => setLang(lang === "en" ? "hi" : "en")} 
          className="bg-transparent border border-slate-300 hover:bg-slate-50 rounded-full px-4 py-1 text-xs font-semibold text-slate-600 cursor-pointer transition-all"
        >
          {t.lang_toggle}
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6 relative overflow-visible">

          {/* Background Watermark Logo */}
          <div className="absolute -right-12 -top-12 w-64 h-64 pointer-events-none select-none z-0">
            {examParam === "ukssc" ? (
              <svg viewBox="0 0 200 200" className="w-full h-full text-emerald-600/[0.04] fill-current">
                <polygon points="100,5 182,52 182,148 100,195 18,148 18,52" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 3" />
                <polygon points="100,10 174,55 174,145 100,190 26,145 26,55" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M35 130 L75 90 L110 120 L145 80 L170 130 Z" fill="currentColor" opacity="0.3" />
                <path d="M100 65 L100 135 M80 80 L120 80 M80 80 L100 105 L120 80" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.5" />
                <path d="M90 120 L97 127 L115 110" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                <text x="100" y="165" textAnchor="middle" fontSize="22" fontWeight="900" letterSpacing="3" fontFamily="var(--font-sora), sans-serif">UKSSC</text>
              </svg>
            ) : (
              <svg viewBox="0 0 200 200" className="w-full h-full text-blue-600/[0.04] fill-current">
                <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 3" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M30 140 L70 90 L105 125 L145 75 L180 140 Z" fill="currentColor" opacity="0.3" />
                <path d="M50 140 L90 100 L120 128 L155 85 L175 140 Z" fill="currentColor" opacity="0.5" />
                <circle cx="120" cy="80" r="15" fill="currentColor" opacity="0.4" />
                <line x1="120" y1="55" x2="120" y2="45" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <line x1="102" y1="63" x2="95" y2="56" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <line x1="95" y1="80" x2="85" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <line x1="138" y1="63" x2="145" y2="56" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <line x1="145" y1="80" x2="155" y2="80" stroke="currentColor" strokeWidth="2" opacity="0.4" />
                <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
                <text x="100" y="170" textAnchor="middle" fontSize="22" fontWeight="900" letterSpacing="3" fontFamily="var(--font-sora), sans-serif">UKPSC</text>
              </svg>
            )}
          </div>

          {/* Exam badge */}
          <div className="animate-fade-in relative z-10">
            <span 
              className="text-xs font-semibold px-3 py-1.5 rounded-full border shadow-sm transition-all"
              style={{ background: exam.bg, color: exam.color, borderColor: exam.border }}
            >
              {t.preparing_for}: {exam.label}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1 relative z-10">
            <h1 className="font-sora text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.welcome_back}
            </h1>
            <p className="text-sm text-slate-500">{t.login_sub}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.email_label}</label>
              <input
                className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white placeholder-slate-400 outline-none transition-all focus:ring-4 ${ringClass}`}
                type="email"
                placeholder={t.email_placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t.pass_label}</label>
                <a href="#" className={`text-xs font-bold hover:underline ${textClass}`}>{t.forgot}</a>
              </div>
              <div className="relative">
                <input
                  className={`w-full px-3.5 py-2.5 pr-12 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white placeholder-slate-400 outline-none transition-all focus:ring-4 ${ringClass}`}
                  type={showPass ? "text" : "password"}
                  placeholder={t.pass_placeholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-slate-400 hover:text-slate-600 text-xs font-bold" 
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`w-full py-3 rounded-xl text-sm font-extrabold text-white transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none ${btnClass}`}
              disabled={loading}
            >
              {loading ? t.logging_in : t.login_btn}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-xs text-slate-500 relative z-10">
            {t.no_account}{" "}
            <Link href={`/auth/register?exam=${examParam}`} className={`font-bold hover:underline ${textClass}`}>
              {t.register_link}
            </Link>
          </p>

        </div>
      </div>

      {/* Back Link */}
      <div className="py-6 text-center">
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">
          {t.back_home}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm">
        Loading Login Page...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}