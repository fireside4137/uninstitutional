/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/components/providers/LangProvider";

type InfoType =
  | "calendar"
  | "link"
  | "notification"
  | "answerkey"
  | "map"
  | "govt"
  | "pyq"
  | "currentaffairs"
  | "magazine";

export default function ModeratorPanelPage() {
  const { lang } = useLang();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeForm, setActiveForm] = useState<InfoType>("calendar");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Generic Form Payload State
  const [payload, setPayload] = useState<Record<string, any>>({});

  useEffect(() => {
    // Verify user role on load
    fetch("/api/dashboard/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          setAuthorized(true);
        } else {
          setAuthorized(false);
        }
      })
      .catch(() => setAuthorized(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    }
    setPayload((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/information", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeForm, payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          lang === "en"
            ? "Record successfully added to the database!"
            : "डेटाबेस में रिकॉर्ड सफलतापूर्वक जोड़ा गया!"
        );
        setPayload({});
        // Reset form inputs
        (e.target as HTMLFormElement).reset();
      } else {
        setErrorMsg(data.error || (lang === "en" ? "Failed to save record." : "रिकॉर्ड सहेजने में विफल।"));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(lang === "en" ? "An unexpected error occurred." : "एक अप्रत्याशित त्रुटि हुई।");
    } finally {
      setLoading(false);
    }
  };

  if (authorized === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 font-sora">Checking credentials...</p>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center max-w-md mx-auto p-5">
        <span className="text-4xl">🚫</span>
        <h2 className="font-sora text-lg font-bold text-slate-800 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          You do not have moderator or administrative access to this panel. Please return to the dashboard home page.
        </p>
      </div>
    );
  }

  const formsList: { type: InfoType; labelEn: string; labelHi: string }[] = [
    { type: "calendar", labelEn: "Exam Date", labelHi: "परीक्षा तिथि" },
    { type: "link", labelEn: "Official Link", labelHi: "आधिकारिक लिंक" },
    { type: "notification", labelEn: "Announcement", labelHi: "घोषणा" },
    { type: "answerkey", labelEn: "Answer Key", labelHi: "उत्तर कुंजी" },
    { type: "map", labelEn: "Map Resource", labelHi: "मानचित्र" },
    { type: "govt", labelEn: "SWAYAM Lecture", labelHi: "स्वयं व्याख्यान" },
    { type: "pyq", labelEn: "PYQ Paper", labelHi: "पीवाईक्यू प्रश्न पत्र" },
    { type: "currentaffairs", labelEn: "Current Affairs", labelHi: "सामयिकी" },
    { type: "magazine", labelEn: "Magazine", labelHi: "पत्रिका" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-sora">
          {lang === "en" ? "Moderator Control Panel" : "मॉडरेटर नियंत्रण पैनल"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {lang === "en"
            ? "Direct interface to manually input and manage exam date calendars, maps, links and resources."
            : "परीक्षा कैलेंडर, मानचित्र, लिंक और अध्ययन सामग्री को सीधे जोड़ने और प्रबंधित करने का नियंत्रण पैनल।"}
        </p>
      </div>

      {/* Select active upload form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
          {lang === "en" ? "Select Resource Type to Upload" : "अपलोड करने के लिए संसाधन प्रकार चुनें"}
        </label>
        <div className="flex flex-wrap gap-2">
          {formsList.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                setActiveForm(item.type);
                setPayload({});
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeForm === item.type
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {lang === "en" ? item.labelEn : item.labelHi}
            </button>
          ))}
        </div>
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-xs font-bold">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-xl p-4 text-xs font-bold">
          ✓ {successMsg}
        </div>
      )}

      {/* Upload Form */}
      <form
        onSubmit={handleFormSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 text-left"
      >
        <h3 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
          {lang === "en" ? "Resource Information Fields" : "संसाधन जानकारी फ़ील्ड"} (
          {activeForm.toUpperCase()})
        </h3>

        {/* Dynamic Fields rendering based on activeForm */}
        {activeForm === "calendar" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Category *</label>
              <select required name="examCategory" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Category</option>
                <option value="UKPSC">UKPSC</option>
                <option value="UKSSC">UKSSC</option>
                <option value="SSC">SSC</option>
                <option value="UPSC">UPSC</option>
                <option value="BANKING">BANKING</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Conducting Authority (English) *</label>
              <input required type="text" name="authorityEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Conducting Authority (Hindi) *</label>
              <input required type="text" name="authorityHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Form Open Date</label>
              <input type="date" name="formOpenDate" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Form Close Date</label>
              <input type="date" name="formCloseDate" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Date</label>
              <input type="date" name="examDate" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Admit Card Date</label>
              <input type="date" name="admitCardDate" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Apply URL</label>
              <input type="url" placeholder="https://" name="applyUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Notification URL</label>
              <input type="url" placeholder="https://" name="notificationUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
              <select required name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Applications Open">Applications Open</option>
                <option value="Closing Soon">Closing Soon</option>
                <option value="Closed">Closed</option>
                <option value="Exam Completed">Exam Completed</option>
              </select>
            </div>
          </div>
        )}

        {activeForm === "link" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 block">URL *</label>
              <input required type="url" placeholder="https://" name="url" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Authority (English) *</label>
              <input required type="text" name="authorityEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Authority (Hindi) *</label>
              <input required type="text" name="authorityHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
              <select required name="category" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Category</option>
                <option value="Official Portal">Official Portal</option>
                <option value="Results">Results</option>
                <option value="Admit Card">Admit Card</option>
                <option value="Recruitment">Recruitment</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-4">
              <input type="checkbox" name="isTrusted" defaultChecked onChange={handleInputChange} id="trusted-chk" />
              <label htmlFor="trusted-chk" className="text-[11px] font-bold text-slate-400 block cursor-pointer">Mark as Verified/Trusted Badge</label>
            </div>
          </div>
        )}

        {activeForm === "notification" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Content Summary (English)</label>
              <textarea name="contentEn" rows={3} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Content Summary (Hindi)</label>
              <textarea name="contentHi" rows={3} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Official Notice Link URL</label>
              <input type="url" placeholder="https://" name="linkUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
              <select required name="category" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="Admit Card">Admit Card</option>
                <option value="Results">Results</option>
                <option value="Answer Key">Answer Key</option>
              </select>
            </div>
          </div>
        )}

        {activeForm === "answerkey" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Name (English) *</label>
              <input required type="text" name="examNameEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Name (Hindi) *</label>
              <input required type="text" name="examNameHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">PDF Download URL</label>
              <input type="url" placeholder="https://" name="pdfUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Official Source URL</label>
              <input type="url" placeholder="https://" name="officialLink" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>
        )}

        {activeForm === "map" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Description (English)</label>
              <textarea name="descriptionEn" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Description (Hindi)</label>
              <textarea name="descriptionHi" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">High-Res Image URL *</label>
              <input required type="url" placeholder="https://" name="imageUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Downloadable PDF URL</label>
              <input type="url" placeholder="https://" name="pdfUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
              <select required name="category" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Category</option>
                <option value="District Maps">District Maps</option>
                <option value="River Maps">River Maps</option>
                <option value="Geography Maps">Geography Maps</option>
                <option value="Cultural Maps">Cultural Maps</option>
              </select>
            </div>
          </div>
        )}

        {activeForm === "govt" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Description (English)</label>
              <textarea name="descriptionEn" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Description (Hindi)</label>
              <textarea name="descriptionHi" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 block">Swayam/Lectures URL *</label>
              <input required type="url" placeholder="https://" name="url" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Provider *</label>
              <select required name="provider" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="SWAYAM">SWAYAM</option>
                <option value="NPTEL">NPTEL</option>
                <option value="IGNOU">IGNOU</option>
                <option value="DIKSHA">DIKSHA</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Subject (English) *</label>
              <input required type="text" name="subjectEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Subject (Hindi) *</label>
              <input required type="text" name="subjectHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>
        )}

        {activeForm === "pyq" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Paper Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Paper Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Name (e.g. RO/ARO) *</label>
              <input required type="text" name="examName" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Category *</label>
              <select required name="examCategory" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Category</option>
                <option value="UKPSC">UKPSC</option>
                <option value="UKSSC">UKSSC</option>
                <option value="SSC">SSC</option>
                <option value="UPSC">UPSC</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Exam Year *</label>
              <input required type="number" placeholder="2026" name="year" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">PDF Download URL</label>
              <input type="url" placeholder="https://" name="pdfUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Official Source URL</label>
              <input type="url" placeholder="https://" name="officialLink" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Subject Name (English)</label>
              <input type="text" name="subjectEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Subject Name (Hindi)</label>
              <input type="text" name="subjectHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>
        )}

        {activeForm === "currentaffairs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Headline (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Headline (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Summary Digest (English)</label>
              <textarea name="summaryEn" rows={4} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Summary Digest (Hindi)</label>
              <textarea name="summaryHi" rows={4} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Source Name</label>
              <input type="text" placeholder="e.g. PIB Dehradun" name="source" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Source URL</label>
              <input type="url" placeholder="https://" name="sourceUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
              <select required name="category" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Category</option>
                <option value="State">State</option>
                <option value="National">National</option>
                <option value="International">International</option>
                <option value="Schemes">Schemes</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Event Date</label>
              <input type="date" name="eventDate" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none" />
            </div>
          </div>
        )}

        {activeForm === "magazine" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Journal Title (English) *</label>
              <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Journal Title (Hindi) *</label>
              <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Description Summary (English)</label>
              <textarea name="descriptionEn" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Description Summary (Hindi)</label>
              <textarea name="descriptionHi" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-400 block">Read/Download Link URL *</label>
              <input required type="url" placeholder="https://" name="url" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Magazine Type *</label>
              <select required name="type" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                <option value="">Select Type</option>
                <option value="Yojana">Yojana</option>
                <option value="Kurukshetra">Kurukshetra</option>
                <option value="India Year Book">India Year Book</option>
                <option value="Monthly Digest">Monthly Digest</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 block">Publish Month (e.g. May 2026)</label>
              <input type="text" placeholder="May 2026" name="publishMonth" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-100 dark:shadow-none"
          >
            {loading
              ? (lang === "en" ? "Saving Record..." : "सहेजा जा रहा है...")
              : (lang === "en" ? "Publish & Upload" : "प्रकाशित और अपलोड करें")}
          </button>
        </div>
      </form>
    </div>
  );
}
