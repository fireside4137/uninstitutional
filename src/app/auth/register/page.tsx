"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const translations = {
  en: {
    lang_toggle: "हिंदी",
    create_account: "Create your account",
    register_sub: "Join thousands of aspirants preparing smarter.",
    name_label: "Full name",
    name_placeholder: "Ramesh Negi",
    email_label: "Email address",
    email_placeholder: "you@example.com",
    phone_label: "Phone number",
    phone_placeholder: "10-digit mobile number",
    pass_label: "Create password",
    pass_placeholder: "Minimum 8 characters",
    exam_label: "Exam you are preparing for",
    exam_ukpsc: "UKPSC — Uttarakhand Public Service Commission",
    exam_ukssc: "UKSSC — Uttarakhand Subordinate Service Selection",
    register_btn: "Create Account",
    registering: "Creating account...",
    have_account: "Already have an account?",
    login_link: "Login here",
    back_home: "← Back to home",
    terms: "By registering, you agree to our Terms of Service and Privacy Policy.",
    error_fill: "Please fill in all required fields.",
    error_phone: "Please enter a valid 10-digit phone number.",
    error_pass: "Password must be at least 8 characters.",
    success: "Account created! Redirecting...",
  },
  hi: {
    lang_toggle: "English",
    create_account: "अपना खाता बनाएं",
    register_sub: "हजारों उम्मीदवारों के साथ स्मार्ट तैयारी शुरू करें।",
    name_label: "पूरा नाम",
    name_placeholder: "रमेश नेगी",
    email_label: "ईमेल पता",
    email_placeholder: "aap@example.com",
    phone_label: "फोन नंबर",
    phone_placeholder: "10 अंकों का मोबाइल नंबर",
    pass_label: "पासवर्ड बनाएं",
    pass_placeholder: "न्यूनतम 8 अक्षर",
    exam_label: "आप किस परीक्षा की तैयारी कर रहे हैं",
    exam_ukpsc: "UKPSC — उत्तराखंड लोक सेवा आयोग",
    exam_ukssc: "UKSSC — उत्तराखंड अधीनस्थ सेवा चयन आयोग",
    register_btn: "खाता बनाएं",
    registering: "खाता बन रहा है...",
    have_account: "पहले से खाता है?",
    login_link: "यहाँ लॉगिन करें",
    back_home: "← होम पर वापस जाएं",
    terms: "रजिस्टर करके, आप हमारी सेवा की शर्तों और गोपनीयता नीति से सहमत हैं।",
    error_fill: "कृपया सभी आवश्यक फ़ील्ड भरें।",
    error_phone: "कृपया वैध 10 अंकों का फोन नंबर दर्ज करें।",
    error_pass: "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।",
    success: "खाता बन गया! रीडायरेक्ट हो रहा है...",
  },
};

type Lang = "en" | "hi";


function PasswordStrength({ password }: { password: string }) {
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const colors = ["bg-slate-200", "bg-red-500", "bg-amber-500", "bg-green-500"];
  const textColors = ["text-slate-400", "text-red-500", "text-amber-500", "text-green-500"];
  const labels = ["", "Weak", "Medium", "Strong"];
  return password.length > 0 ? (
    <div className="mt-1.5 flex items-center gap-3">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? colors[strength] : "bg-slate-200"}`} />
        ))}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${textColors[strength]}`}>{labels[strength]}</span>
    </div>
  ) : null;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examParam = (searchParams.get("exam") || "ukpsc") as "ukpsc" | "ukssc";

  const [lang, setLang] = useState<Lang>("en");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [examType, setExamType] = useState<"ukpsc" | "ukssc">(examParam);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone || !password) { setError(t.error_fill); return; }
    if (!/^\d{10}$/.test(phone)) { setError(t.error_phone); return; }
    if (password.length < 8) { setError(t.error_pass); return; }
    setLoading(true);
   
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        password,
        examType: examType.toUpperCase(), // "UKPSC" or "UKSSC"
      }),
    });
   
    const data = await res.json();
    setLoading(false);
   
    if (!res.ok) {
      setError(data.error || t.error_fill);
    } else {
      setSuccess(true);
      setTimeout(() => router.push(`/auth/login?exam=${examType}`), 1500);
    }
  };

  const ringClass = examType === "ukssc" ? "focus:border-emerald-500 focus:ring-emerald-100/50" : "focus:border-blue-500 focus:ring-blue-100/50";
  const btnClass = examType === "ukssc" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100";
  const textClass = examType === "ukssc" ? "text-emerald-600" : "text-blue-600";

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
      <div className="flex-1 flex items-start justify-center p-6 md:p-8">
        <div className="w-full max-w-sm space-y-6">

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="font-sora text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t.create_account}
            </h1>
            <p className="text-sm text-slate-500">{t.register_sub}</p>
          </div>

          {/* Success banner */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-600 font-bold flex items-center gap-2 animate-pulse">
              ✓ {t.success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.name_label}</label>
              <input 
                className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white placeholder-slate-400 outline-none transition-all focus:ring-4 ${ringClass}`}
                type="text" 
                placeholder={t.name_placeholder} 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                autoComplete="name" 
              />
            </div>

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

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.phone_label}</label>
              <input 
                className={`w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white placeholder-slate-400 outline-none transition-all focus:ring-4 ${ringClass}`}
                type="tel" 
                placeholder={t.phone_placeholder} 
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
                autoComplete="tel" 
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.pass_label}</label>
              <div className="relative">
                <input 
                  className={`w-full px-3.5 py-2.5 pr-12 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 bg-white placeholder-slate-400 outline-none transition-all focus:ring-4 ${ringClass}`}
                  type={showPass ? "text" : "password"} 
                  placeholder={t.pass_placeholder} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  autoComplete="new-password" 
                />
                <button 
                  type="button" 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-0 text-slate-400 hover:text-slate-600 text-xs font-bold" 
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Exam Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">{t.exam_label}</label>
              <div className="flex flex-col gap-2">
                {(["ukpsc", "ukssc"] as const).map((ex) => {
                  const isSelected = examType === ex;
                  const borderOption = isSelected 
                    ? (ex === "ukpsc" ? "border-blue-600 bg-blue-50/30" : "border-emerald-600 bg-emerald-50/30") 
                    : "border-slate-200 hover:border-slate-300 bg-white";
                  const radioColor = isSelected 
                    ? (ex === "ukpsc" ? "border-blue-600 bg-blue-600" : "border-emerald-600 bg-emerald-600") 
                    : "border-slate-300 bg-white";
                  return (
                    <button
                      type="button"
                      key={ex}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left cursor-pointer transition-all ${borderOption}`}
                      onClick={() => setExamType(ex)}
                    >
                      {/* Radio dot */}
                      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${radioColor}`}>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                      <div>
                        <div className={`text-sm font-bold ${isSelected ? (ex === "ukssc" ? "text-emerald-700" : "text-blue-700") : "text-slate-800"}`}>
                          {ex.toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {ex === "ukpsc" ? t.exam_ukpsc.split("—")[1].trim() : t.exam_ukssc.split("—")[1].trim()}
                        </div>
                      </div>
                    </button>
                  );
                })}
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
              disabled={loading || success}
            >
              {loading ? t.registering : t.register_btn}
            </button>

            {/* Terms */}
            <p className="text-[10px] text-slate-400 text-center leading-normal pt-1">{t.terms}</p>
          </form>

          {/* Login Link */}
          <p className="text-center text-xs text-slate-500">
            {t.have_account}{" "}
            <Link href={`/auth/login?exam=${examType}`} className={`font-bold hover:underline ${textClass}`}>
              {t.login_link}
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

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-sm">
        Loading Register Page...
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}