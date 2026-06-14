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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Top level navigation tab: "upload" | "manage" | "users"
  const [topTab, setTopTab] = useState<"upload" | "manage" | "users">("upload");

  // State for upload form
  const [activeForm, setActiveForm] = useState<InfoType>("calendar");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [payload, setPayload] = useState<Record<string, any>>({});

  // Manage Content States
  const [manageType, setManageType] = useState<InfoType>("calendar");
  const [contentList, setContentList] = useState<Record<string, any[]>>({});
  const [manageLoading, setManageLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editPayload, setEditPayload] = useState<Record<string, any>>({});
  const [deletingItem, setDeletingItem] = useState<any | null>(null);

  // User Management States
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actioningUser, setActioningUser] = useState<{ user: any; type: "PROMOTE" | "DEMOTE" } | null>(null);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    examType: "UKPSC" as "UKPSC" | "UKSSC",
    phone: "",
  });

  useEffect(() => {
    // Verify user role on load
    fetch("/api/dashboard/summary")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          setAuthorized(true);
          setCurrentUser(data.user);
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

  // --- CRUD Resource List Fetching ---
  const loadResources = async () => {
    setManageLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/information?type=all&admin=true");
      if (res.ok) {
        const data = await res.json();
        setContentList({
          calendar: data.calendar || [],
          link: data.links || [],
          notification: data.notifications || [],
          answerkey: data.answerKeys || [],
          map: data.maps || [],
          govt: data.govtLearning || [],
          pyq: data.pyqs || [],
          currentaffairs: data.currentAffairs || [],
          magazine: data.magazines || [],
        });
      } else {
        setErrorMsg("Failed to load content resources from API.");
      }
    } catch (err) {
      console.error("Failed to load resources:", err);
      setErrorMsg("Connection error while loading resources.");
    } finally {
      setManageLoading(false);
    }
  };

  // Initialize edit modal state with type formatting
  const startEdit = (item: any) => {
    setEditingItem(item);
    const prefilled: Record<string, any> = { ...item };
    
    // Convert SQL date strings to browser-supported YYYY-MM-DD input formats
    const dateFields = ["formOpenDate", "formCloseDate", "examDate", "admitCardDate", "releaseDate", "publishDate", "eventDate"];
    dateFields.forEach((field) => {
      if (prefilled[field]) {
        prefilled[field] = new Date(prefilled[field]).toISOString().split("T")[0];
      }
    });

    setEditPayload(prefilled);
  };

  // Put API Toggle Publish
  const handleTogglePublish = async (item: any, type: InfoType) => {
    const isPublished = item.status === "PUBLISHED" || item.status === "Applications Open" || item.status === "Upcoming";
    let newStatus = "PUBLISHED";
    if (type === "calendar") {
      newStatus = isPublished ? "Closed" : "Upcoming";
    } else {
      newStatus = isPublished ? "UNPUBLISHED" : "PUBLISHED";
    }

    const payloadToSubmit = { ...item, status: newStatus };
    delete payloadToSubmit.id;
    delete payloadToSubmit.createdAt;
    delete payloadToSubmit.updatedAt;
    delete payloadToSubmit.createdBy;
    delete payloadToSubmit.updatedBy;

    try {
      const res = await fetch("/api/information", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type, payload: payloadToSubmit }),
      });
      if (res.ok) {
        setSuccessMsg(lang === "en" ? "Status updated successfully!" : "स्थिति सफलतापूर्वक अपडेट की गई!");
        loadResources();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to update resource status.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to toggle resource status.");
    }
  };

  // Delete API Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    const { id, type } = deletingItem;
    try {
      const res = await fetch(`/api/information?id=${id}&type=${type}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSuccessMsg(lang === "en" ? "Resource deleted successfully." : "संसाधन सफलतापूर्वक हटा दिया गया।");
        setDeletingItem(null);
        loadResources();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to delete resource.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to delete resource.");
    }
  };

  // --- User Management Fetching ---
  const loadUsers = async () => {
    setUsersLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      } else {
        setErrorMsg("Failed to load user records.");
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      setErrorMsg("Connection error while loading users.");
    } finally {
      setUsersLoading(false);
    }
  };

  // Promote / Demote API Mutation
  const handleUserRoleMutation = async () => {
    if (!actioningUser) return;
    const { user, type } = actioningUser;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: type,
          payload: { email: user.email },
        }),
      });
      if (res.ok) {
        setSuccessMsg(
          lang === "en"
            ? `Successfully ${type === "PROMOTE" ? "promoted" : "demoted"} user.`
            : `उपयोगकर्ता को सफलतापूर्वक ${type === "PROMOTE" ? "पदोन्नत" : "अवनत"} किया गया।`
        );
        setActioningUser(null);
        loadUsers();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to modify user role.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
    }
  };

  // Create Admin Form Submit
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ADMIN",
          payload: newAdminForm,
        }),
      });
      if (res.ok) {
        setSuccessMsg(
          lang === "en"
            ? "New Admin account created successfully!"
            : "नया एडमिन खाता सफलतापूर्वक बनाया गया!"
        );
        setNewAdminForm({
          name: "",
          email: "",
          password: "",
          examType: "UKPSC",
          phone: "",
        });
        loadUsers();
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || "Failed to create admin user.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred.");
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
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
          {lang === "en"
            ? "Direct interface to manually input and manage exam date calendars, maps, links and resources."
            : "परीक्षा कैलेंडर, मानचित्र, लिंक और अध्ययन सामग्री को सीधे जोड़ने और प्रबंधित करने का नियंत्रण पैनल।"}
        </p>
      </div>

      {/* Top Level Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "upload", labelEn: "📤 Upload Resource", labelHi: "📤 अपलोड करें" },
          { id: "manage", labelEn: "🛠️ Manage Content", labelHi: "🛠️ प्रबंधन" },
          { id: "users", labelEn: "👥 User Management", labelHi: "👥 उपयोगकर्ता प्रबंधन" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTopTab(tab.id as any);
              setErrorMsg("");
              setSuccessMsg("");
              if (tab.id === "manage") loadResources();
              if (tab.id === "users") loadUsers();
            }}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              topTab === tab.id
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-850 dark:hover:text-white"
            }`}
          >
            {lang === "en" ? tab.labelEn : tab.labelHi}
          </button>
        ))}
      </div>

      {/* Status Alerts */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-650 rounded-xl p-4 text-xs font-bold animate-pulse">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-650 rounded-xl p-4 text-xs font-bold">
          ✓ {successMsg}
        </div>
      )}

      {/* Tab Panel 1: Upload Content */}
      {topTab === "upload" && (
        <div className="space-y-6">
          {/* Select active upload form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
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

          {/* Upload Form */}
          <form
            onSubmit={handleFormSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 text-left shadow-sm"
          >
            <h3 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5">
              {lang === "en" ? "Resource Information Fields" : "संसाधन जानकारी फ़ील्ड"} ({activeForm.toUpperCase()})
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
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
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
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
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
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
                  </select>
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
                  <label className="text-[11px] font-bold text-slate-400 block">High-Res Image URL</label>
                  <input type="url" placeholder="https://" name="imageUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
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
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
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
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
                  </select>
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
                  <input required type="number" placeholder="2026" name="year" onChange={(e) => setPayload(prev => ({ ...prev, year: parseInt(e.target.value, 10) }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">PDF Download URL</label>
                  <input type="url" placeholder="https://" name="pdfUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Official Source URL</label>
                  <input type="url" placeholder="https://" name="officialLink" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Subject Name (English)</label>
                  <input type="text" name="subjectEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Subject Name (Hindi)</label>
                  <input type="text" name="subjectHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
                  </select>
                </div>
              </div>
            )}

            {activeForm === "currentaffairs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Headline (English) *</label>
                  <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Headline (Hindi) *</label>
                  <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Summary Digest (English)</label>
                  <textarea name="summaryEn" rows={4} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Summary Digest (Hindi)</label>
                  <textarea name="summaryHi" rows={4} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Source Name</label>
                  <input type="text" placeholder="e.g. PIB Dehradun" name="source" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Source URL</label>
                  <input type="url" placeholder="https://" name="sourceUrl" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
                  <select required name="category" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
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
                  <input type="date" name="eventDate" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
                  </select>
                </div>
              </div>
            )}

            {activeForm === "magazine" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Journal Title (English) *</label>
                  <input required type="text" name="titleEn" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Journal Title (Hindi) *</label>
                  <input required type="text" name="titleHi" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Description Summary (English)</label>
                  <textarea name="descriptionEn" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Description Summary (Hindi)</label>
                  <textarea name="descriptionHi" rows={2} onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[11px] font-bold text-slate-400 block">Read/Download Link URL *</label>
                  <input required type="url" placeholder="https://" name="url" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Magazine Type *</label>
                  <select required name="type" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="">Select Type</option>
                    <option value="Yojana">Yojana</option>
                    <option value="Kurukshetra">Kurukshetra</option>
                    <option value="India Year Book">India Year Book</option>
                    <option value="Monthly Digest">Monthly Digest</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Publish Month (e.g. May 2026)</label>
                  <input type="text" placeholder="May 2026" name="publishMonth" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                  <select name="status" onChange={handleInputChange} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING">PENDING</option>
                    <option value="UNPUBLISHED">UNPUBLISHED</option>
                  </select>
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
      )}

      {/* Tab Panel 2: Manage Content */}
      {topTab === "manage" && (
        <div className="space-y-6">
          {/* Sub-tabs for content types */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {lang === "en" ? "Select Resource Type to Manage" : "प्रबंधित करने के लिए संसाधन प्रकार चुनें"}
            </label>
            <div className="flex flex-wrap gap-2">
              {formsList.map((item) => (
                <button
                  key={item.type}
                  onClick={() => {
                    setManageType(item.type);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    manageType === item.type
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {lang === "en" ? item.labelEn : item.labelHi}
                </button>
              ))}
            </div>
          </div>

          {/* Resources List Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {manageLoading ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-500">Loading resources...</p>
              </div>
            ) : !contentList[manageType] || contentList[manageType].length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-medium">
                {lang === "en" ? "No records found for this resource type." : "इस संसाधन प्रकार के लिए कोई रिकॉर्ड नहीं मिला।"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="p-4">Title / Info</th>
                      <th className="p-4">Details</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Added By</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {contentList[manageType].map((item) => {
                      const title = lang === "en" ? item.titleEn : item.titleHi;
                      const isPublished = item.status === "PUBLISHED" || item.status === "Applications Open" || item.status === "Upcoming";
                      
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 font-bold text-slate-850 dark:text-slate-200 max-w-[240px] truncate">
                            {title || "Untitled"}
                            {item.year && <span className="ml-1.5 text-slate-450 font-mono">({item.year})</span>}
                          </td>
                          <td className="p-4 text-slate-500">
                            {item.category || item.provider || item.examName || item.examCategory || "N/A"}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                              isPublished
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                            }`}>
                              {item.status || "N/A"}
                            </span>
                          </td>
                          <td className="p-4 text-slate-400 text-[10px] font-mono">
                            {item.createdBy || "System"}
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublish(item, manageType)}
                              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                isPublished
                                  ? "bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-300"
                                  : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 text-emerald-650 dark:text-emerald-400"
                              }`}
                            >
                              {isPublished ? (lang === "en" ? "Hide" : "छिपाएं") : (lang === "en" ? "Publish" : "प्रकाशित")}
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              className="px-2.5 py-1 bg-blue-55 dark:bg-blue-900/20 text-blue-650 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/30 rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              {lang === "en" ? "Edit" : "संपादित"}
                            </button>
                            <button
                              onClick={() => setDeletingItem({ id: item.id, type: manageType, titleEn: item.titleEn, titleHi: item.titleHi })}
                              className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-650 dark:text-red-400 hover:bg-red-100/70 dark:hover:bg-red-900/30 rounded text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              {lang === "en" ? "Delete" : "हटाएं"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Panel 3: User Management */}
      {topTab === "users" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Admin Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 h-fit shadow-sm">
              <h3 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-4">
                {lang === "en" ? "➕ Create Admin User" : "➕ नया एडमिन बनाएं"}
              </h3>
              <form onSubmit={handleCreateAdminSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newAdminForm.name}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
                    placeholder="e.g. Sweta Sharma"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email *</label>
                  <input
                    required
                    type="email"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
                    placeholder="e.g. sharma@uninstitutional.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password *</label>
                  <input
                    required
                    type="password"
                    value={newAdminForm.password}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
                    placeholder="Min 8 characters"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number (Optional)</label>
                  <input
                    type="text"
                    value={newAdminForm.phone || ""}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-200 focus:outline-none"
                    placeholder="10-digit number"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Exam Type *</label>
                  <select
                    value={newAdminForm.examType}
                    onChange={(e) => setNewAdminForm(prev => ({ ...prev, examType: e.target.value as any }))}
                    className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none"
                  >
                    <option value="UKPSC">UKPSC</option>
                    <option value="UKSSC">UKSSC</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-100 dark:shadow-none mt-2 cursor-pointer"
                >
                  Create Admin User
                </button>
              </form>
            </div>

            {/* Users List Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm lg:col-span-2">
              <h3 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 p-4 pb-2.5">
                {lang === "en" ? "👥 Registered Users" : "👥 पंजीकृत उपयोगकर्ता"}
              </h3>
              {usersLoading ? (
                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Loading user database...</p>
                </div>
              ) : usersList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-medium">
                  No registered users found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-4">User Details</th>
                        <th className="p-4">Exam Type</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Premium</th>
                        <th className="p-4">Created At</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList.map((user) => {
                        const isSelf = user.email === currentUser?.email;
                        return (
                          <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-slate-850 dark:text-slate-200">{user.name}</div>
                              <div className="text-[10px] text-slate-450 dark:text-slate-400 font-mono mt-0.5">{user.email}</div>
                            </td>
                            <td className="p-4 text-slate-550 uppercase font-semibold text-[10px]">
                              {user.examType}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                user.role === "ADMIN"
                                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-605 dark:text-slate-400"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                user.isPremium
                                  ? "bg-purple-50 dark:bg-purple-950/40 text-purple-650 dark:text-purple-400"
                                  : "bg-slate-105 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                              }`}>
                                {user.isPremium ? "PRO" : "FREE"}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 text-[10px]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              {isSelf ? (
                                <span className="text-[10px] text-slate-400 italic pr-3 font-semibold">You (Current Admin)</span>
                              ) : (
                                <button
                                  onClick={() => setActioningUser({ user, type: user.role === "ADMIN" ? "DEMOTE" : "PROMOTE" })}
                                  className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    user.role === "ADMIN"
                                      ? "bg-amber-50 dark:bg-amber-900/20 text-amber-650 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                                      : "bg-blue-50 dark:bg-blue-900/20 text-blue-650 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                  }`}
                                >
                                  {user.role === "ADMIN" ? "Demote" : "Promote"}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative text-left">
            {/* Close Button */}
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-600 dark:text-slate-200 z-10 cursor-pointer"
            >
              ✕
            </button>

            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 pr-12 bg-white dark:bg-slate-900">
              <h3 className="font-sora text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {lang === "en" ? `✏️ Edit ${editingItem.category || editingItem.type || manageType} Resource` : `✏️ संपादित करें: ${editingItem.category || editingItem.type || manageType}`}
              </h3>
            </div>

            {/* Scrollable Fields Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setErrorMsg("");
                setSuccessMsg("");
                try {
                  const res = await fetch("/api/information", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: editingItem.id,
                      type: manageType,
                      payload: editPayload,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setSuccessMsg(lang === "en" ? "Record updated successfully!" : "रिकॉर्ड सफलतापूर्वक अपडेट किया गया!");
                    setEditingItem(null);
                    loadResources();
                  } else {
                    setErrorMsg(data.error || "Failed to update record.");
                  }
                } catch (err) {
                  console.error(err);
                  setErrorMsg("An unexpected error occurred.");
                } finally {
                  setLoading(false);
                }
              }}
              className="flex-1 overflow-auto p-6 space-y-4"
            >
              {/* Dynamic form fields depending on manageType */}
              {manageType === "calendar" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Category *</label>
                    <select required name="examCategory" value={editPayload.examCategory || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, examCategory: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="UKPSC">UKPSC</option>
                      <option value="UKSSC">UKSSC</option>
                      <option value="SSC">SSC</option>
                      <option value="UPSC">UPSC</option>
                      <option value="BANKING">BANKING</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Conducting Authority (English) *</label>
                    <input required type="text" name="authorityEn" value={editPayload.authorityEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, authorityEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Conducting Authority (Hindi) *</label>
                    <input required type="text" name="authorityHi" value={editPayload.authorityHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, authorityHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Form Open Date</label>
                    <input type="date" name="formOpenDate" value={editPayload.formOpenDate || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, formOpenDate: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Form Close Date</label>
                    <input type="date" name="formCloseDate" value={editPayload.formCloseDate || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, formCloseDate: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Date</label>
                    <input type="date" name="examDate" value={editPayload.examDate || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, examDate: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Admit Card Date</label>
                    <input type="date" name="admitCardDate" value={editPayload.admitCardDate || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, admitCardDate: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Apply URL</label>
                    <input type="url" placeholder="https://" name="applyUrl" value={editPayload.applyUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, applyUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Notification URL</label>
                    <input type="url" placeholder="https://" name="notificationUrl" value={editPayload.notificationUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, notificationUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="Upcoming">Upcoming</option>
                      <option value="Applications Open">Applications Open</option>
                      <option value="Closing Soon">Closing Soon</option>
                      <option value="Closed">Closed</option>
                      <option value="Exam Completed">Exam Completed</option>
                    </select>
                  </div>
                </div>
              )}

              {manageType === "link" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 block">URL *</label>
                    <input required type="url" placeholder="https://" name="url" value={editPayload.url || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, url: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Authority (English) *</label>
                    <input required type="text" name="authorityEn" value={editPayload.authorityEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, authorityEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Authority (Hindi) *</label>
                    <input required type="text" name="authorityHi" value={editPayload.authorityHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, authorityHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
                    <select required name="category" value={editPayload.category || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, category: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="Official Portal">Official Portal</option>
                      <option value="Results">Results</option>
                      <option value="Admit Card">Admit Card</option>
                      <option value="Recruitment">Recruitment</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" name="isTrusted" checked={!!editPayload.isTrusted} onChange={(e) => setEditPayload(prev => ({ ...prev, isTrusted: e.target.checked }))} id="edit-trusted-chk" />
                    <label htmlFor="edit-trusted-chk" className="text-[11px] font-bold text-slate-400 block cursor-pointer">Mark as Verified/Trusted Badge</label>
                  </div>
                </div>
              )}

              {manageType === "notification" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Content Summary (English)</label>
                    <textarea name="contentEn" rows={3} value={editPayload.contentEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, contentEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Content Summary (Hindi)</label>
                    <textarea name="contentHi" rows={3} value={editPayload.contentHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, contentHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Official Notice Link URL</label>
                    <input type="url" placeholder="https://" name="linkUrl" value={editPayload.linkUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, linkUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
                    <select required name="category" value={editPayload.category || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, category: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="General">General</option>
                      <option value="Admit Card">Admit Card</option>
                      <option value="Results">Results</option>
                      <option value="Answer Key">Answer Key</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" name="isNew" checked={!!editPayload.isNew} onChange={(e) => setEditPayload(prev => ({ ...prev, isNew: e.target.checked }))} id="edit-isNew-chk" />
                    <label htmlFor="edit-isNew-chk" className="text-[11px] font-bold text-slate-400 block cursor-pointer">Mark as New / Flash Badge</label>
                  </div>
                </div>
              )}

              {manageType === "answerkey" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Name (English) *</label>
                    <input required type="text" name="examNameEn" value={editPayload.examNameEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, examNameEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Name (Hindi) *</label>
                    <input required type="text" name="examNameHi" value={editPayload.examNameHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, examNameHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">PDF Download URL</label>
                    <input type="url" placeholder="https://" name="pdfUrl" value={editPayload.pdfUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, pdfUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Official Source URL</label>
                    <input type="url" placeholder="https://" name="officialLink" value={editPayload.officialLink || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, officialLink: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input type="checkbox" name="isOfficial" checked={!!editPayload.isOfficial} onChange={(e) => setEditPayload(prev => ({ ...prev, isOfficial: e.target.checked }))} id="edit-isOfficial-chk" />
                    <label htmlFor="edit-isOfficial-chk" className="text-[11px] font-bold text-slate-400 block cursor-pointer">Mark as Official Key</label>
                  </div>
                </div>
              )}

              {manageType === "map" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Description (English)</label>
                    <textarea name="descriptionEn" rows={2} value={editPayload.descriptionEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, descriptionEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Description (Hindi)</label>
                    <textarea name="descriptionHi" rows={2} value={editPayload.descriptionHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, descriptionHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">High-Res Image URL</label>
                    <input type="url" placeholder="https://" name="imageUrl" value={editPayload.imageUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, imageUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Downloadable PDF URL</label>
                    <input type="url" placeholder="https://" name="pdfUrl" value={editPayload.pdfUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, pdfUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
                    <select required name="category" value={editPayload.category || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, category: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="District Maps">District Maps</option>
                      <option value="River Maps">River Maps</option>
                      <option value="Geography Maps">Geography Maps</option>
                      <option value="Cultural Maps">Cultural Maps</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-55 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                </div>
              )}

              {manageType === "govt" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Description (English)</label>
                    <textarea name="descriptionEn" rows={2} value={editPayload.descriptionEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, descriptionEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Description (Hindi)</label>
                    <textarea name="descriptionHi" rows={2} value={editPayload.descriptionHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, descriptionHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 block">Swayam/Lectures URL *</label>
                    <input required type="url" placeholder="https://" name="url" value={editPayload.url || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, url: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-55 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Provider *</label>
                    <select required name="provider" value={editPayload.provider || "SWAYAM"} onChange={(e) => setEditPayload(prev => ({ ...prev, provider: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="SWAYAM">SWAYAM</option>
                      <option value="NPTEL">NPTEL</option>
                      <option value="IGNOU">IGNOU</option>
                      <option value="DIKSHA">DIKSHA</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Subject (English) *</label>
                    <input required type="text" name="subjectEn" value={editPayload.subjectEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, subjectEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Subject (Hindi) *</label>
                    <input required type="text" name="subjectHi" value={editPayload.subjectHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, subjectHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                </div>
              )}

              {manageType === "pyq" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Paper Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Paper Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Name (e.g. RO/ARO) *</label>
                    <input required type="text" name="examName" value={editPayload.examName || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, examName: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Category *</label>
                    <select required name="examCategory" value={editPayload.examCategory || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, examCategory: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="UKPSC">UKPSC</option>
                      <option value="UKSSC">UKSSC</option>
                      <option value="SSC">SSC</option>
                      <option value="UPSC">UPSC</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Exam Year *</label>
                    <input required type="number" placeholder="2026" name="year" value={editPayload.year || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, year: parseInt(e.target.value, 10) }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">PDF Download URL</label>
                    <input type="url" placeholder="https://" name="pdfUrl" value={editPayload.pdfUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, pdfUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Official Source URL</label>
                    <input type="url" placeholder="https://" name="officialLink" value={editPayload.officialLink || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, officialLink: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Subject Name (English)</label>
                    <input type="text" name="subjectEn" value={editPayload.subjectEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, subjectEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Subject Name (Hindi)</label>
                    <input type="text" name="subjectHi" value={editPayload.subjectHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, subjectHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                </div>
              )}

              {manageType === "currentaffairs" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Headline (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Headline (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Summary Digest (English)</label>
                    <textarea name="summaryEn" rows={4} value={editPayload.summaryEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, summaryEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Summary Digest (Hindi)</label>
                    <textarea name="summaryHi" rows={4} value={editPayload.summaryHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, summaryHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Source Name</label>
                    <input type="text" placeholder="e.g. PIB Dehradun" name="source" value={editPayload.source || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, source: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Source URL</label>
                    <input type="url" placeholder="https://" name="sourceUrl" value={editPayload.sourceUrl || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, sourceUrl: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Category *</label>
                    <select required name="category" value={editPayload.category || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, category: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="State">State</option>
                      <option value="National">National</option>
                      <option value="International">International</option>
                      <option value="Schemes">Schemes</option>
                      <option value="Sports">Sports</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Event Date</label>
                    <input type="date" name="eventDate" value={editPayload.eventDate || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, eventDate: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-750 dark:text-slate-300 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                </div>
              )}

              {manageType === "magazine" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Journal Title (English) *</label>
                    <input required type="text" name="titleEn" value={editPayload.titleEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Journal Title (Hindi) *</label>
                    <input required type="text" name="titleHi" value={editPayload.titleHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, titleHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Description Summary (English)</label>
                    <textarea name="descriptionEn" rows={2} value={editPayload.descriptionEn || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, descriptionEn: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Description Summary (Hindi)</label>
                    <textarea name="descriptionHi" rows={2} value={editPayload.descriptionHi || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, descriptionHi: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-850 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 block">Read/Download Link URL *</label>
                    <input required type="url" placeholder="https://" name="url" value={editPayload.url || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, url: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Magazine Type *</label>
                    <select required name="type" value={editPayload.type || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, type: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="Yojana">Yojana</option>
                      <option value="Kurukshetra">Kurukshetra</option>
                      <option value="India Year Book">India Year Book</option>
                      <option value="Monthly Digest">Monthly Digest</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Publish Month (e.g. May 2026)</label>
                    <input type="text" placeholder="May 2026" name="publishMonth" value={editPayload.publishMonth || ""} onChange={(e) => setEditPayload(prev => ({ ...prev, publishMonth: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-855 dark:text-slate-200 focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-400 block">Status *</label>
                    <select required name="status" value={editPayload.status || "PUBLISHED"} onChange={(e) => setEditPayload(prev => ({ ...prev, status: e.target.value }))} className="w-full border dark:border-slate-800 p-2 rounded text-xs bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 focus:outline-none">
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPUBLISHED">UNPUBLISHED</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-white dark:bg-slate-900 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-250 dark:border-slate-750 text-slate-650 dark:text-slate-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-100 dark:shadow-none"
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <h3 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white mb-2">
              ⚠️ {lang === "en" ? "Delete Resource Confirmation" : "संसाधन हटाने की पुष्टि"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              {lang === "en"
                ? `Are you sure you want to permanently delete "${deletingItem.titleEn || deletingItem.titleHi}"? This action cannot be undone and will also remove all student bookmarks for this item.`
                : `क्या आप वास्तव में "${deletingItem.titleHi || deletingItem.titleEn}" को स्थायी रूप से हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती और इस मद के लिए सभी छात्र बुकमार्क भी हटा देगी।`}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Role Action Confirmation Modal */}
      {actioningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <h3 className="font-sora text-sm font-extrabold text-slate-900 dark:text-white mb-2">
              👤 {actioningUser.type === "PROMOTE" ? "Promote User to Admin" : "Demote User to Student"}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              {lang === "en"
                ? `Are you sure you want to ${actioningUser.type === "PROMOTE" ? "promote" : "demote"} user "${actioningUser.user.name}" (${actioningUser.user.email})?`
                : `क्या आप वास्तव में उपयोगकर्ता "${actioningUser.user.name}" (${actioningUser.user.email}) को ${actioningUser.type === "PROMOTE" ? "पदोन्नत" : "अवनत"} करना चाहते हैं?`}
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setActioningUser(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUserRoleMutation}
                className={`px-4 py-2 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  actioningUser.type === "PROMOTE" ? "bg-blue-600 hover:bg-blue-700" : "bg-amber-600 hover:bg-amber-750"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
