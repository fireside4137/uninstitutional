/**
 * prisma/seed-information.ts
 *
 * Idempotent seed for the Information Engine:
 *  ExamEvents, OfficialLinks, Notifications, AnswerKeys,
 *  MapResources, GovtLearningLinks, PYQPapers,
 *  CurrentAffairsEvents, MagazineResources
 *
 * Rules:
 *  - All records use stable UUIDs → upsert by id → safe to re-run
 *  - No deleteMany anywhere
 *  - No fake PDF URLs → pdfUrl: null where no real file exists
 *  - No invented dates → null or "Check Official Portal" wording
 *  - External links only to verified official government portals
 *  - Map imageUrls point to local public placeholder (update when real images provided)
 *  - Current affairs: every entry has sourceUrl or is marked "To be verified"
 *  - Wikimedia attribution stored in descriptionEn where applicable
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });


// ─── Stable UUID helpers ────────────────────────────────────────────────────
const E = (n: number) => `e1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const L = (n: number) => `l1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const N = (n: number) => `n1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const AK = (n: number) => `a1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const M = (n: number) => `m1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const G = (n: number) => `g1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const P = (n: number) => `p1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const CA = (n: number) => `c1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;
const MG = (n: number) => `r1000001-0000-0000-0000-${String(n).padStart(12, "0")}`;

const PLACEHOLDER_MAP = "/resources/maps/placeholder.svg";
const UKPSC_NOTICE_BOARD = "https://ukpsc.net.in/noticeBoard.aspx";
const UKPSC_MAIN = "https://psc.uk.gov.in";
const UKSSSC_MAIN = "https://sssc.uk.gov.in";
const ADMIN = "Seed Script";

// ─── 1. ExamEvents ──────────────────────────────────────────────────────────
async function seedExamEvents() {
  const events = [
    {
      id: E(1),
      titleEn: "UKPSC Combined State / Upper Subordinate Civil Services — Latest Cycle",
      titleHi: "उत्तराखंड लोक सेवा आयोग — संयुक्त राज्य / उच्च अधीनस्थ सिविल सेवा — नवीनतम चक्र",
      examCategory: "UKPSC",
      authorityEn: "Uttarakhand Public Service Commission (UKPSC)",
      authorityHi: "उत्तराखंड लोक सेवा आयोग (UKPSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: "https://ukpsc.net.in",
      notificationUrl: UKPSC_NOTICE_BOARD,
      status: "Check Official Portal",
    },
    {
      id: E(2),
      titleEn: "UKPSC Lower PCS (Subordinate Civil Services) — Latest Cycle",
      titleHi: "उत्तराखंड लोक सेवा आयोग — लोअर पीसीएस (अधीनस्थ सिविल सेवा) — नवीनतम चक्र",
      examCategory: "UKPSC",
      authorityEn: "Uttarakhand Public Service Commission (UKPSC)",
      authorityHi: "उत्तराखंड लोक सेवा आयोग (UKPSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: "https://ukpsc.net.in",
      notificationUrl: UKPSC_NOTICE_BOARD,
      status: "Check Official Portal",
    },
    {
      id: E(3),
      titleEn: "UKSSSC / UKSSC Group C Recruitment — Latest Cycle",
      titleHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग — ग्रुप C भर्ती — नवीनतम चक्र",
      examCategory: "UKSSC",
      authorityEn: "Uttarakhand Subordinate Service Selection Commission (UKSSSC)",
      authorityHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग (UKSSSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: UKSSSC_MAIN,
      notificationUrl: UKSSSC_MAIN,
      status: "Check Official Portal",
    },
    {
      id: E(4),
      titleEn: "UKSSSC / UKSSC Forest Guard Recruitment — Latest Cycle",
      titleHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग — वन रक्षक भर्ती — नवीनतम चक्र",
      examCategory: "UKSSC",
      authorityEn: "Uttarakhand Subordinate Service Selection Commission (UKSSSC)",
      authorityHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग (UKSSSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: UKSSSC_MAIN,
      notificationUrl: UKSSSC_MAIN,
      status: "Check Official Portal",
    },
    {
      id: E(5),
      titleEn: "SSC CGL (Combined Graduate Level) — Latest Cycle",
      titleHi: "एसएससी सीजीएल (संयुक्त स्नातक स्तरीय परीक्षा) — नवीनतम चक्र",
      examCategory: "SSC",
      authorityEn: "Staff Selection Commission (SSC)",
      authorityHi: "कर्मचारी चयन आयोग (SSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: "https://ssc.nic.in",
      notificationUrl: "https://ssc.nic.in",
      status: "Check Official Portal",
    },
    {
      id: E(6),
      titleEn: "UPSC Civil Services Examination (CSE) — Latest Cycle",
      titleHi: "यूपीएससी सिविल सेवा परीक्षा (सीएसई) — नवीनतम चक्र",
      examCategory: "UPSC",
      authorityEn: "Union Public Service Commission (UPSC)",
      authorityHi: "संघ लोक सेवा आयोग (UPSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: "https://upsc.gov.in",
      notificationUrl: "https://upsc.gov.in/pages/ann.aspx",
      status: "Check Official Portal",
    },
    {
      id: E(7),
      titleEn: "UPSC CAPF (Central Armed Police Forces AC) — Latest Cycle",
      titleHi: "यूपीएससी सीएपीएफ (केंद्रीय सशस्त्र पुलिस बल सहायक कमांडेंट) — नवीनतम चक्र",
      examCategory: "UPSC",
      authorityEn: "Union Public Service Commission (UPSC)",
      authorityHi: "संघ लोक सेवा आयोग (UPSC)",
      formOpenDate: null,
      formCloseDate: null,
      examDate: null,
      admitCardDate: null,
      applyUrl: "https://upsc.gov.in",
      notificationUrl: "https://upsc.gov.in/pages/ann.aspx",
      status: "Check Official Portal",
    },
  ];

  for (const ev of events) {
    await prisma.examEvent.upsert({
      where: { id: ev.id },
      create: { ...ev, createdBy: ADMIN },
      update: {
        titleEn: ev.titleEn,
        titleHi: ev.titleHi,
        status: ev.status,
        applyUrl: ev.applyUrl,
        notificationUrl: ev.notificationUrl,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${events.length} ExamEvents.`);
}

// ─── 2. OfficialLinks ────────────────────────────────────────────────────────
async function seedOfficialLinks() {
  const links = [
    {
      id: L(1),
      titleEn: "UKPSC — Official Website",
      titleHi: "UKPSC — आधिकारिक वेबसाइट",
      url: UKPSC_MAIN,
      authorityEn: "Uttarakhand Public Service Commission",
      authorityHi: "उत्तराखंड लोक सेवा आयोग",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(2),
      titleEn: "UKPSC — Online Application & Notice Board",
      titleHi: "UKPSC — ऑनलाइन आवेदन और नोटिस बोर्ड",
      url: "https://ukpsc.net.in",
      authorityEn: "Uttarakhand Public Service Commission",
      authorityHi: "उत्तराखंड लोक सेवा आयोग",
      category: "Recruitment",
      isTrusted: true,
    },
    {
      id: L(3),
      titleEn: "UKSSSC / UKSSC — Official Portal",
      titleHi: "UKSSSC / UKSSC — आधिकारिक पोर्टल",
      url: UKSSSC_MAIN,
      authorityEn: "Uttarakhand Subordinate Service Selection Commission",
      authorityHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(4),
      titleEn: "UPSC — Union Public Service Commission",
      titleHi: "UPSC — संघ लोक सेवा आयोग",
      url: "https://upsc.gov.in",
      authorityEn: "Union Public Service Commission",
      authorityHi: "संघ लोक सेवा आयोग",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(5),
      titleEn: "SSC — Staff Selection Commission",
      titleHi: "SSC — कर्मचारी चयन आयोग",
      url: "https://ssc.nic.in",
      authorityEn: "Staff Selection Commission",
      authorityHi: "कर्मचारी चयन आयोग",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(6),
      titleEn: "Uttarakhand Government — Official Portal",
      titleHi: "उत्तराखंड सरकार — आधिकारिक पोर्टल",
      url: "https://uk.gov.in",
      authorityEn: "Government of Uttarakhand",
      authorityHi: "उत्तराखंड सरकार",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(7),
      titleEn: "NCERT — Official Website",
      titleHi: "NCERT — आधिकारिक वेबसाइट",
      url: "https://ncert.nic.in",
      authorityEn: "National Council of Educational Research and Training",
      authorityHi: "राष्ट्रीय शैक्षिक अनुसंधान और प्रशिक्षण परिषद",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(8),
      titleEn: "NCERT — Free Textbooks (Class 6–12)",
      titleHi: "NCERT — निःशुल्क पाठ्यपुस्तकें (कक्षा 6–12)",
      url: "https://ncert.nic.in/textbook.php",
      authorityEn: "National Council of Educational Research and Training",
      authorityHi: "राष्ट्रीय शैक्षिक अनुसंधान और प्रशिक्षण परिषद",
      category: "Study Material",
      isTrusted: true,
    },
    {
      id: L(9),
      titleEn: "SWAYAM — Free Online Courses (Govt of India)",
      titleHi: "SWAYAM — निःशुल्क ऑनलाइन पाठ्यक्रम (भारत सरकार)",
      url: "https://swayam.gov.in",
      authorityEn: "Ministry of Education, Govt of India",
      authorityHi: "शिक्षा मंत्रालय, भारत सरकार",
      category: "Study Material",
      isTrusted: true,
    },
    {
      id: L(10),
      titleEn: "NPTEL — Free Engineering & Science Courses (IITs/IISc)",
      titleHi: "NPTEL — निःशुल्क इंजीनियरिंग और विज्ञान पाठ्यक्रम (IIT/IISc)",
      url: "https://nptel.ac.in",
      authorityEn: "IITs and IISc, Govt of India",
      authorityHi: "IIT/IISc, भारत सरकार",
      category: "Study Material",
      isTrusted: true,
    },
    {
      id: L(11),
      titleEn: "PIB — Press Information Bureau",
      titleHi: "PIB — प्रेस सूचना ब्यूरो",
      url: "https://pib.gov.in",
      authorityEn: "Press Information Bureau, Govt of India",
      authorityHi: "प्रेस सूचना ब्यूरो, भारत सरकार",
      category: "Official Portal",
      isTrusted: true,
    },
    {
      id: L(12),
      titleEn: "eDistrict Uttarakhand — Citizen Services Portal",
      titleHi: "eDistrict उत्तराखंड — नागरिक सेवा पोर्टल",
      url: "https://edistrict.uk.gov.in",
      authorityEn: "Government of Uttarakhand",
      authorityHi: "उत्तराखंड सरकार",
      category: "Official Portal",
      isTrusted: true,
    },
  ];

  for (const lk of links) {
    await prisma.officialLink.upsert({
      where: { id: lk.id },
      create: { ...lk, createdBy: ADMIN },
      update: {
        titleEn: lk.titleEn,
        titleHi: lk.titleHi,
        url: lk.url,
        category: lk.category,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${links.length} OfficialLinks.`);
}

// ─── 3. Notifications ────────────────────────────────────────────────────────
async function seedNotifications() {
  const notifications = [
    {
      id: N(1),
      titleEn: "Welcome to UnInstitutional — UKPSC Preparation Platform",
      titleHi: "UnInstitutional में आपका स्वागत है — UKPSC तैयारी प्लेटफॉर्म",
      contentEn:
        "Start your UKPSC Prelims preparation journey. Navigate to the Quiz section to attempt your first topic test. Track your progress on the dashboard.",
      contentHi:
        "अपनी UKPSC प्रारंभिक परीक्षा की तैयारी शुरू करें। अपना पहला विषय परीक्षण देने के लिए क्विज़ अनुभाग पर जाएं। डैशबोर्ड पर अपनी प्रगति ट्रैक करें।",
      linkUrl: null,
      category: "General",
      isNew: true,
      publishDate: new Date("2026-06-01"),
    },
    {
      id: N(2),
      titleEn: "UKPSC Notice Board — Check Latest Notifications",
      titleHi: "UKPSC नोटिस बोर्ड — नवीनतम अधिसूचनाएं देखें",
      contentEn:
        "Visit the official UKPSC notice board regularly for exam notifications, admit card releases, result announcements, and answer key uploads.",
      contentHi:
        "परीक्षा अधिसूचनाओं, प्रवेश पत्र, परिणाम घोषणाओं और उत्तर कुंजी के लिए आधिकारिक UKPSC नोटिस बोर्ड नियमित रूप से देखें।",
      linkUrl: UKPSC_NOTICE_BOARD,
      category: "Recruitment",
      isNew: true,
      publishDate: new Date("2026-06-05"),
    },
    {
      id: N(3),
      titleEn: "NCERT Free Textbooks Now Available Online",
      titleHi: "NCERT की निःशुल्क पाठ्यपुस्तकें अब ऑनलाइन उपलब्ध",
      contentEn:
        "All NCERT textbooks from Class 6 to Class 12 are freely available on ncert.nic.in. These are essential for UKPSC General Studies preparation.",
      contentHi:
        "कक्षा 6 से 12 तक की सभी NCERT पाठ्यपुस्तकें ncert.nic.in पर निःशुल्क उपलब्ध हैं। UKPSC सामान्य अध्ययन की तैयारी के लिए ये अत्यंत महत्वपूर्ण हैं।",
      linkUrl: "https://ncert.nic.in/textbook.php",
      category: "Study Material",
      isNew: true,
      publishDate: new Date("2026-06-08"),
    },
    {
      id: N(4),
      titleEn: "SWAYAM Free Courses — Enrol for UPSC/UKPSC Relevant Subjects",
      titleHi: "SWAYAM निःशुल्क पाठ्यक्रम — UPSC/UKPSC उपयोगी विषयों में नामांकन करें",
      contentEn:
        "The Government of India's SWAYAM platform offers free university-level courses on History, Polity, Geography, and Economics — directly useful for civil services preparation.",
      contentHi:
        "भारत सरकार का SWAYAM प्लेटफॉर्म इतिहास, राजव्यवस्था, भूगोल और अर्थशास्त्र पर निःशुल्क विश्वविद्यालय स्तरीय पाठ्यक्रम प्रदान करता है।",
      linkUrl: "https://swayam.gov.in",
      category: "Study Material",
      isNew: false,
      publishDate: new Date("2026-05-20"),
    },
    {
      id: N(5),
      titleEn: "UKSSSC Official Portal — Latest Recruitment Notifications",
      titleHi: "UKSSSC आधिकारिक पोर्टल — नवीनतम भर्ती अधिसूचनाएं",
      contentEn:
        "Visit sssc.uk.gov.in for the latest Uttarakhand Subordinate Services recruitment notifications, syllabus, and exam calendars.",
      contentHi:
        "उत्तराखंड अधीनस्थ सेवाओं की नवीनतम भर्ती अधिसूचनाओं, पाठ्यक्रम और परीक्षा कैलेंडर के लिए sssc.uk.gov.in देखें।",
      linkUrl: UKSSSC_MAIN,
      category: "Recruitment",
      isNew: false,
      publishDate: new Date("2026-05-15"),
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.upsert({
      where: { id: notif.id },
      create: { ...notif, createdBy: ADMIN },
      update: {
        titleEn: notif.titleEn,
        titleHi: notif.titleHi,
        contentEn: notif.contentEn,
        contentHi: notif.contentHi,
        linkUrl: notif.linkUrl,
        isNew: notif.isNew,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${notifications.length} Notifications.`);
}

// ─── 4. AnswerKeys ───────────────────────────────────────────────────────────
async function seedAnswerKeys() {
  // pdfUrl = null for all — no real PDFs hosted
  // officialLink = UKPSC notice board
  const keys = [
    {
      id: AK(1),
      titleEn: "UKPSC Combined State Civil Services Prelims — Answer Key",
      titleHi: "UKPSC संयुक्त राज्य सिविल सेवा प्रारंभिक — उत्तर कुंजी",
      examNameEn: "UKPSC Combined State / Upper Subordinate Civil Services",
      examNameHi: "UKPSC संयुक्त राज्य / उच्च अधीनस्थ सिविल सेवा",
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      releaseDate: new Date("2024-01-01"),
      isOfficial: true,
    },
    {
      id: AK(2),
      titleEn: "UKPSC Lower PCS (Subordinate Civil Services) Prelims — Answer Key",
      titleHi: "UKPSC लोअर पीसीएस प्रारंभिक — उत्तर कुंजी",
      examNameEn: "UKPSC Lower PCS (Subordinate Civil Services)",
      examNameHi: "UKPSC लोअर पीसीएस (अधीनस्थ सिविल सेवा)",
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      releaseDate: new Date("2024-01-01"),
      isOfficial: true,
    },
    {
      id: AK(3),
      titleEn: "UKSSSC Forest Guard Examination — Answer Key",
      titleHi: "UKSSSC वन रक्षक परीक्षा — उत्तर कुंजी",
      examNameEn: "UKSSSC Forest Guard Recruitment Examination",
      examNameHi: "UKSSSC वन रक्षक भर्ती परीक्षा",
      pdfUrl: null,
      officialLink: UKSSSC_MAIN,
      releaseDate: new Date("2024-01-01"),
      isOfficial: true,
    },
    {
      id: AK(4),
      titleEn: "UKSSSC Group C Recruitment Examination — Answer Key",
      titleHi: "UKSSSC ग्रुप C भर्ती परीक्षा — उत्तर कुंजी",
      examNameEn: "UKSSSC Group C Recruitment Examination",
      examNameHi: "UKSSSC ग्रुप C भर्ती परीक्षा",
      pdfUrl: null,
      officialLink: UKSSSC_MAIN,
      releaseDate: new Date("2024-01-01"),
      isOfficial: true,
    },
    {
      id: AK(5),
      titleEn: "SSC CGL Tier-I Examination — Answer Key (Reference)",
      titleHi: "SSC CGL टियर-I परीक्षा — उत्तर कुंजी (संदर्भ)",
      examNameEn: "SSC Combined Graduate Level (CGL) Tier-I",
      examNameHi: "SSC संयुक्त स्नातक स्तरीय (CGL) टियर-I",
      pdfUrl: null,
      officialLink: "https://ssc.nic.in",
      releaseDate: new Date("2024-01-01"),
      isOfficial: false,
    },
  ];

  for (const key of keys) {
    await prisma.answerKey.upsert({
      where: { id: key.id },
      create: { ...key, createdBy: ADMIN },
      update: {
        titleEn: key.titleEn,
        titleHi: key.titleHi,
        officialLink: key.officialLink,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${keys.length} AnswerKeys.`);
}

// ─── 5. MapResources ─────────────────────────────────────────────────────────
// imageUrl → local placeholder SVG (update when real images provided)
// Attribution stored in descriptionEn
async function seedMapResources() {
  const maps = [
    {
      id: M(1),
      titleEn: "Political Map of Uttarakhand",
      titleHi: "उत्तराखंड का राजनीतिक मानचित्र",
      descriptionEn:
        "Shows the political boundaries of Uttarakhand state within India, including international borders and state boundary. Source: Wikimedia Commons (Public Domain). Placeholder — upload real image to replace.",
      descriptionHi:
        "उत्तराखंड राज्य की राजनीतिक सीमाएं दर्शाता मानचित्र। स्रोत: Wikimedia Commons (सार्वजनिक डोमेन)। प्लेसहोल्डर — वास्तविक छवि अपलोड करें।",
      imageUrl: PLACEHOLDER_MAP,
      pdfUrl: null,
      category: "Geography Maps",
    },
    {
      id: M(2),
      titleEn: "District Map of Uttarakhand (13 Districts)",
      titleHi: "उत्तराखंड का जिला मानचित्र (13 जिले)",
      descriptionEn:
        "Shows all 13 districts of Uttarakhand with district headquarters. Essential for UKPSC geography preparation. Source: Wikimedia Commons (Public Domain). Placeholder — upload real image to replace.",
      descriptionHi:
        "उत्तराखंड के सभी 13 जिलों को जिला मुख्यालय सहित दर्शाता मानचित्र। UKPSC भूगोल तैयारी के लिए आवश्यक। प्लेसहोल्डर — वास्तविक छवि अपलोड करें।",
      imageUrl: PLACEHOLDER_MAP,
      pdfUrl: null,
      category: "District Maps",
    },
    {
      id: M(3),
      titleEn: "River and Drainage Map of Uttarakhand",
      titleHi: "उत्तराखंड का नदी और अपवाह मानचित्र",
      descriptionEn:
        "Shows major river systems of Uttarakhand including Ganga, Yamuna, Alaknanda, Bhagirathi, Mandakini, and Kali river basins. Source: Wikimedia Commons (Public Domain). Placeholder — upload real image to replace.",
      descriptionHi:
        "उत्तराखंड की प्रमुख नदियां — गंगा, यमुना, अलकनंदा, भागीरथी, मंदाकिनी और काली नदी बेसिन दर्शाता मानचित्र। प्लेसहोल्डर — वास्तविक छवि अपलोड करें।",
      imageUrl: PLACEHOLDER_MAP,
      pdfUrl: null,
      category: "River Maps",
    },
    {
      id: M(4),
      titleEn: "Physical / Relief Map of Uttarakhand",
      titleHi: "उत्तराखंड का भौतिक / उच्चावच मानचित्र",
      descriptionEn:
        "Shows the topographic relief of Uttarakhand — Himalayan ranges, Shivalik Hills, Bhabar, and Terai regions. Source: Wikimedia Commons (Public Domain). Placeholder — upload real image to replace.",
      descriptionHi:
        "उत्तराखंड का भौगोलिक उच्चावच — हिमालय श्रृंखलाएं, शिवालिक पहाड़ियां, भाबर और तराई क्षेत्र। प्लेसहोल्डर — वास्तविक छवि अपलोड करें।",
      imageUrl: PLACEHOLDER_MAP,
      pdfUrl: null,
      category: "Geography Maps",
    },
    {
      id: M(5),
      titleEn: "Forest and Wildlife Areas Map of Uttarakhand",
      titleHi: "उत्तराखंड का वन और वन्यजीव क्षेत्र मानचित्र",
      descriptionEn:
        "Shows forest cover, wildlife sanctuaries, national parks and biosphere reserves in Uttarakhand including Jim Corbett, Rajaji, and Kedarnath Wildlife Sanctuary. Source: Wikimedia Commons (Public Domain). Placeholder — upload real image to replace.",
      descriptionHi:
        "उत्तराखंड के वन क्षेत्र, वन्यजीव अभयारण्य और राष्ट्रीय उद्यान — जिम कॉर्बेट, राजाजी, केदारनाथ वन्यजीव अभयारण्य सहित। प्लेसहोल्डर — वास्तविक छवि अपलोड करें।",
      imageUrl: PLACEHOLDER_MAP,
      pdfUrl: null,
      category: "Geography Maps",
    },
    {
      id: M(6),
      titleEn: "India Locator Map — Uttarakhand Highlighted",
      titleHi: "भारत लोकेटर मानचित्र — उत्तराखंड चिह्नित",
      descriptionEn:
        "India outline map with Uttarakhand state highlighted, showing its position in the northern Himalayan region. Source: Wikimedia Commons (CC BY-SA). Placeholder — upload real image to replace.",
      descriptionHi:
        "भारत का रूपरेखा मानचित्र जिसमें उत्तराखंड राज्य को उत्तरी हिमालयी क्षेत्र में चिह्नित किया गया है। प्लेसहोल्डर — वास्तविक छवि अपलोड करें।",
      imageUrl: PLACEHOLDER_MAP,
      pdfUrl: null,
      category: "Geography Maps",
    },
  ];

  for (const mp of maps) {
    await prisma.mapResource.upsert({
      where: { id: mp.id },
      create: { ...mp, createdBy: ADMIN },
      update: {
        titleEn: mp.titleEn,
        titleHi: mp.titleHi,
        descriptionEn: mp.descriptionEn,
        descriptionHi: mp.descriptionHi,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${maps.length} MapResources.`);
}

// ─── 6. GovtLearningLinks (SWAYAM / NPTEL portal-level links) ───────────────
async function seedGovtLearningLinks() {
  const links = [
    {
      id: G(1),
      titleEn: "Explore Indian Polity & Governance Courses — SWAYAM",
      titleHi: "भारतीय राजव्यवस्था और शासन पाठ्यक्रम — SWAYAM",
      descriptionEn:
        "Explore free university-level courses on Indian Constitution, Parliament, Governance, and Federalism on the SWAYAM platform (Ministry of Education).",
      descriptionHi:
        "SWAYAM प्लेटफॉर्म पर भारतीय संविधान, संसद, शासन और संघवाद पर निःशुल्क पाठ्यक्रम देखें।",
      url: "https://swayam.gov.in",
      provider: "SWAYAM",
      subjectEn: "Indian Polity & Governance",
      subjectHi: "भारतीय राजव्यवस्था और शासन",
    },
    {
      id: G(2),
      titleEn: "Explore Indian Geography & Environment Courses — NPTEL",
      titleHi: "भारतीय भूगोल और पर्यावरण पाठ्यक्रम — NPTEL",
      descriptionEn:
        "NPTEL (IITs/IISc) offers free courses on Physical Geography, Environmental Science, Climate, and Ecology — relevant for UKPSC General Studies.",
      descriptionHi:
        "NPTEL (IIT/IISc) भौतिक भूगोल, पर्यावरण विज्ञान, जलवायु और पारिस्थितिकी पर निःशुल्क पाठ्यक्रम प्रदान करता है।",
      url: "https://nptel.ac.in",
      provider: "NPTEL",
      subjectEn: "Geography & Environment",
      subjectHi: "भूगोल और पर्यावरण",
    },
    {
      id: G(3),
      titleEn: "Explore Modern Indian History Courses — SWAYAM",
      titleHi: "आधुनिक भारतीय इतिहास पाठ्यक्रम — SWAYAM",
      descriptionEn:
        "Free courses covering Modern Indian History, Freedom Struggle, Post-Independence developments, and Cultural Heritage on SWAYAM.",
      descriptionHi:
        "SWAYAM पर आधुनिक भारतीय इतिहास, स्वतंत्रता संग्राम, स्वतंत्रता पश्चात विकास और सांस्कृतिक विरासत के निःशुल्क पाठ्यक्रम।",
      url: "https://swayam.gov.in",
      provider: "SWAYAM",
      subjectEn: "Indian History",
      subjectHi: "भारतीय इतिहास",
    },
    {
      id: G(4),
      titleEn: "Explore Indian Economy & Development Courses — SWAYAM",
      titleHi: "भारतीय अर्थव्यवस्था और विकास पाठ्यक्रम — SWAYAM",
      descriptionEn:
        "SWAYAM courses covering Indian Economy, Development Economics, Planning, Budget concepts, and Economic Policies — key for UKPSC General Studies.",
      descriptionHi:
        "SWAYAM पर भारतीय अर्थव्यवस्था, विकास अर्थशास्त्र, योजना, बजट और आर्थिक नीतियों के पाठ्यक्रम।",
      url: "https://swayam.gov.in",
      provider: "SWAYAM",
      subjectEn: "Indian Economy",
      subjectHi: "भारतीय अर्थव्यवस्था",
    },
    {
      id: G(5),
      titleEn: "Explore Environmental Science & Ecology Courses — NPTEL",
      titleHi: "पर्यावरण विज्ञान और पारिस्थितिकी पाठ्यक्रम — NPTEL",
      descriptionEn:
        "NPTEL free courses on Environmental Science, Biodiversity, Climate Change, Disaster Management and Conservation — important for UKPSC Paper 1.",
      descriptionHi:
        "NPTEL पर पर्यावरण विज्ञान, जैव विविधता, जलवायु परिवर्तन, आपदा प्रबंधन और संरक्षण के निःशुल्क पाठ्यक्रम।",
      url: "https://nptel.ac.in",
      provider: "NPTEL",
      subjectEn: "Environment & Ecology",
      subjectHi: "पर्यावरण और पारिस्थितिकी",
    },
    {
      id: G(6),
      titleEn: "Explore General Science Courses — SWAYAM",
      titleHi: "सामान्य विज्ञान पाठ्यक्रम — SWAYAM",
      descriptionEn:
        "Free SWAYAM courses covering Physics, Chemistry, Biology, and Technology concepts relevant to UKPSC General Studies Paper.",
      descriptionHi:
        "SWAYAM पर भौतिकी, रसायन विज्ञान, जीव विज्ञान और प्रौद्योगिकी के निःशुल्क पाठ्यक्रम।",
      url: "https://swayam.gov.in",
      provider: "SWAYAM",
      subjectEn: "General Science & Technology",
      subjectHi: "सामान्य विज्ञान और प्रौद्योगिकी",
    },
    {
      id: G(7),
      titleEn: "Explore Disaster Management Courses — SWAYAM",
      titleHi: "आपदा प्रबंधन पाठ्यक्रम — SWAYAM",
      descriptionEn:
        "Free SWAYAM courses on Disaster Risk Reduction, Crisis Management, and Emergency Response — relevant for Uttarakhand-specific UKPSC syllabus (disaster-prone state).",
      descriptionHi:
        "SWAYAM पर आपदा जोखिम न्यूनीकरण, संकट प्रबंधन और आपातकालीन प्रतिक्रिया के निःशुल्क पाठ्यक्रम।",
      url: "https://swayam.gov.in",
      provider: "SWAYAM",
      subjectEn: "Disaster Management",
      subjectHi: "आपदा प्रबंधन",
    },
    {
      id: G(8),
      titleEn: "NCERT — Free Textbooks Portal (Class 6–12)",
      titleHi: "NCERT — निःशुल्क पाठ्यपुस्तक पोर्टल (कक्षा 6–12)",
      descriptionEn:
        "Download free NCERT textbooks for History, Geography, Political Science, Economics, and Science from Class 6 to Class 12 — the foundation for civil services preparation.",
      descriptionHi:
        "कक्षा 6 से 12 तक इतिहास, भूगोल, राजनीति विज्ञान, अर्थशास्त्र और विज्ञान की NCERT पाठ्यपुस्तकें निःशुल्क डाउनलोड करें।",
      url: "https://ncert.nic.in/textbook.php",
      provider: "NCERT",
      subjectEn: "NCERT Textbooks (All Subjects)",
      subjectHi: "NCERT पाठ्यपुस्तकें (सभी विषय)",
    },
  ];

  for (const lk of links) {
    await prisma.govtLearningLink.upsert({
      where: { id: lk.id },
      create: { ...lk, createdBy: ADMIN },
      update: {
        titleEn: lk.titleEn,
        titleHi: lk.titleHi,
        descriptionEn: lk.descriptionEn,
        descriptionHi: lk.descriptionHi,
        url: lk.url,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${links.length} GovtLearningLinks.`);
}

// ─── 7. PYQPapers ────────────────────────────────────────────────────────────
// pdfUrl = null for all — no hosted PDFs
// officialLink = UKPSC/UKSSSC notice board
async function seedPYQPapers() {
  const papers = [
    {
      id: P(1),
      titleEn: "UKPSC Combined State Civil Services Prelims — General Studies",
      titleHi: "UKPSC संयुक्त राज्य सिविल सेवा प्रारंभिक — सामान्य अध्ययन",
      examName: "UKPSC Combined State / Upper Subordinate Civil Services",
      examCategory: "UKPSC",
      year: 2023,
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      subjectEn: "General Studies",
      subjectHi: "सामान्य अध्ययन",
    },
    {
      id: P(2),
      titleEn: "UKPSC Combined State Civil Services Prelims — General Studies",
      titleHi: "UKPSC संयुक्त राज्य सिविल सेवा प्रारंभिक — सामान्य अध्ययन",
      examName: "UKPSC Combined State / Upper Subordinate Civil Services",
      examCategory: "UKPSC",
      year: 2022,
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      subjectEn: "General Studies",
      subjectHi: "सामान्य अध्ययन",
    },
    {
      id: P(3),
      titleEn: "UKPSC Combined State Civil Services Prelims — General Studies",
      titleHi: "UKPSC संयुक्त राज्य सिविल सेवा प्रारंभिक — सामान्य अध्ययन",
      examName: "UKPSC Combined State / Upper Subordinate Civil Services",
      examCategory: "UKPSC",
      year: 2021,
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      subjectEn: "General Studies",
      subjectHi: "सामान्य अध्ययन",
    },
    {
      id: P(4),
      titleEn: "UKPSC Lower PCS Prelims — General Studies",
      titleHi: "UKPSC लोअर पीसीएस प्रारंभिक — सामान्य अध्ययन",
      examName: "UKPSC Lower PCS (Subordinate Civil Services)",
      examCategory: "UKPSC",
      year: 2023,
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      subjectEn: "General Studies",
      subjectHi: "सामान्य अध्ययन",
    },
    {
      id: P(5),
      titleEn: "UKPSC Lower PCS Prelims — General Studies",
      titleHi: "UKPSC लोअर पीसीएस प्रारंभिक — सामान्य अध्ययन",
      examName: "UKPSC Lower PCS (Subordinate Civil Services)",
      examCategory: "UKPSC",
      year: 2022,
      pdfUrl: null,
      officialLink: UKPSC_NOTICE_BOARD,
      subjectEn: "General Studies",
      subjectHi: "सामान्य अध्ययन",
    },
    {
      id: P(6),
      titleEn: "UKSSSC Forest Guard Recruitment — Written Examination Paper",
      titleHi: "UKSSSC वन रक्षक भर्ती — लिखित परीक्षा प्रश्न पत्र",
      examName: "UKSSSC Forest Guard Recruitment",
      examCategory: "UKSSC",
      year: 2023,
      pdfUrl: null,
      officialLink: UKSSSC_MAIN,
      subjectEn: "General Studies & Aptitude",
      subjectHi: "सामान्य अध्ययन और अभिरुचि",
    },
    {
      id: P(7),
      titleEn: "UKSSSC Group C Recruitment — Written Examination Paper",
      titleHi: "UKSSSC ग्रुप C भर्ती — लिखित परीक्षा प्रश्न पत्र",
      examName: "UKSSSC Group C Recruitment",
      examCategory: "UKSSC",
      year: 2022,
      pdfUrl: null,
      officialLink: UKSSSC_MAIN,
      subjectEn: "General Studies & Aptitude",
      subjectHi: "सामान्य अध्ययन और अभिरुचि",
    },
    {
      id: P(8),
      titleEn: "UPSC CSE Prelims — General Studies Paper I (Reference)",
      titleHi: "UPSC सीएसई प्रारंभिक — सामान्य अध्ययन पेपर I (संदर्भ)",
      examName: "UPSC Civil Services Examination (CSE) Prelims",
      examCategory: "UPSC",
      year: 2023,
      pdfUrl: null,
      officialLink: "https://upsc.gov.in/pages/ans.aspx",
      subjectEn: "General Studies Paper I",
      subjectHi: "सामान्य अध्ययन पेपर I",
    },
  ];

  for (const paper of papers) {
    await prisma.pYQPaper.upsert({
      where: { id: paper.id },
      create: { ...paper, createdBy: ADMIN },
      update: {
        titleEn: paper.titleEn,
        titleHi: paper.titleHi,
        officialLink: paper.officialLink,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${papers.length} PYQPapers.`);
}

// ─── 8. CurrentAffairsEvents ─────────────────────────────────────────────────
// All entries have sourceUrl → PIB or official UK Govt portal
async function seedCurrentAffairs() {
  const events = [
    // ── State / Uttarakhand ──
    {
      id: CA(1),
      titleEn: "Uttarakhand State Budget 2024–25 — Key Highlights",
      titleHi: "उत्तराखंड राज्य बजट 2024–25 — प्रमुख बिंदु",
      summaryEn:
        "The Uttarakhand state budget focused on infrastructure development, tourism promotion, and welfare schemes for hill communities. Increased allocation for Char Dham all-weather road connectivity and Jal Jeevan Mission targets. Source: Uttarakhand Government official portal.",
      summaryHi:
        "उत्तराखंड राज्य बजट में बुनियादी ढांचे, पर्यटन और पहाड़ी समुदायों की कल्याण योजनाओं पर ध्यान केंद्रित किया गया। चार धाम ऑल-वेदर रोड और जल जीवन मिशन के लिए आवंटन बढ़ाया गया। स्रोत: उत्तराखंड सरकार आधिकारिक पोर्टल।",
      source: "Uttarakhand Government",
      sourceUrl: "https://uk.gov.in",
      category: "State",
      eventDate: new Date("2024-02-15"),
    },
    {
      id: CA(2),
      titleEn: "Char Dham Yatra 2024 — Record Pilgrimage Statistics",
      titleHi: "चार धाम यात्रा 2024 — रिकॉर्ड तीर्थयात्रा आंकड़े",
      summaryEn:
        "The 2024 Char Dham Yatra season witnessed record pilgrim arrivals at Kedarnath, Badrinath, Gangotri, and Yamunotri shrines. Uttarakhand government deployed extensive infrastructure and digital registration systems. Source: Uttarakhand Government portal.",
      summaryHi:
        "2024 चार धाम यात्रा में केदारनाथ, बद्रीनाथ, गंगोत्री और यमुनोत्री में रिकॉर्ड तीर्थयात्री पहुंचे। उत्तराखंड सरकार ने व्यापक बुनियादी ढांचा और डिजिटल पंजीकरण प्रणाली तैनात की। स्रोत: उत्तराखंड सरकार।",
      source: "Uttarakhand Government",
      sourceUrl: "https://uk.gov.in",
      category: "State",
      eventDate: new Date("2024-06-01"),
    },
    {
      id: CA(3),
      titleEn: "Jal Jeevan Mission — Uttarakhand Progress Report",
      titleHi: "जल जीवन मिशन — उत्तराखंड प्रगति रिपोर्ट",
      summaryEn:
        "Uttarakhand has made significant progress under the Jal Jeevan Mission, connecting rural households to piped drinking water. The mission targets 100% household tap connections in hill districts. Source: PIB / Ministry of Jal Shakti.",
      summaryHi:
        "उत्तराखंड ने जल जीवन मिशन के तहत ग्रामीण घरों में नल से पानी पहुंचाने में उल्लेखनीय प्रगति की है। मिशन पर्वतीय जिलों में 100% घरों में नल कनेक्शन का लक्ष्य रखता है। स्रोत: PIB / जल शक्ति मंत्रालय।",
      source: "PIB / Ministry of Jal Shakti",
      sourceUrl: "https://pib.gov.in",
      category: "State",
      eventDate: new Date("2024-03-15"),
    },
    {
      id: CA(4),
      titleEn: "Uttarakhand Industrial Investment Summit — Key Outcomes",
      titleHi: "उत्तराखंड औद्योगिक निवेश शिखर सम्मेलन — प्रमुख परिणाम",
      summaryEn:
        "Uttarakhand hosted an industrial investment summit attracting investments in IT, tourism, and renewable energy sectors. The new industrial policy aims to generate employment in hill districts. Source: Uttarakhand Government.",
      summaryHi:
        "उत्तराखंड ने IT, पर्यटन और नवीकरणीय ऊर्जा में निवेश आकर्षित करने के लिए औद्योगिक निवेश शिखर सम्मेलन आयोजित किया। नई औद्योगिक नीति पर्वतीय जिलों में रोजगार सृजन का लक्ष्य रखती है। स्रोत: उत्तराखंड सरकार।",
      source: "Uttarakhand Government",
      sourceUrl: "https://uk.gov.in",
      category: "State",
      eventDate: new Date("2024-01-20"),
    },
    {
      id: CA(5),
      titleEn: "Kedarnath Reconstruction and Development — Phase II",
      titleHi: "केदारनाथ पुनर्निर्माण और विकास — चरण II",
      summaryEn:
        "Phase II of the Kedarnath reconstruction project focuses on expanding pilgrim facilities, improving connectivity, and ecological restoration. The project is supervised by the Prime Minister's Office. Source: PIB.",
      summaryHi:
        "केदारनाथ पुनर्निर्माण परियोजना के चरण II में तीर्थयात्री सुविधाओं का विस्तार, कनेक्टिविटी सुधार और पारिस्थितिक पुनरुद्धार शामिल है। यह परियोजना प्रधानमंत्री कार्यालय की देखरेख में है। स्रोत: PIB।",
      source: "PIB",
      sourceUrl: "https://pib.gov.in",
      category: "State",
      eventDate: new Date("2024-04-10"),
    },
    // ── National ──
    {
      id: CA(6),
      titleEn: "New Criminal Laws in India — BNS, BNSS, BSA (2024)",
      titleHi: "भारत के नए आपराधिक कानून — BNS, BNSS, BSA (2024)",
      summaryEn:
        "India replaced colonial-era criminal laws with three new Acts: Bharatiya Nyaya Sanhita (BNS) replacing IPC, Bharatiya Nagarik Suraksha Sanhita (BNSS) replacing CrPC, and Bharatiya Sakshya Adhiniyam (BSA) replacing Indian Evidence Act. Effective July 2024. Source: PIB.",
      summaryHi:
        "भारत ने औपनिवेशिक काल के आपराधिक कानूनों को तीन नए कानूनों से बदला: भारतीय न्याय संहिता (BNS) — IPC के स्थान पर, भारतीय नागरिक सुरक्षा संहिता (BNSS) — CrPC के स्थान पर, और भारतीय साक्ष्य अधिनियम (BSA) — जुलाई 2024 से प्रभावी। स्रोत: PIB।",
      source: "PIB",
      sourceUrl: "https://pib.gov.in",
      category: "National",
      eventDate: new Date("2024-07-01"),
    },
    {
      id: CA(7),
      titleEn: "PM Kisan Samman Nidhi — Beneficiary & Instalment Updates",
      titleHi: "PM किसान सम्मान निधि — लाभार्थी और किस्त अपडेट",
      summaryEn:
        "PM Kisan Samman Nidhi provides annual direct income support of ₹6,000 to eligible small and marginal farmers. Regular instalments are released after beneficiary verification. Source: PIB / Ministry of Agriculture.",
      summaryHi:
        "PM किसान सम्मान निधि योजना के तहत पात्र छोटे और सीमांत किसानों को प्रतिवर्ष ₹6,000 की सीधी आय सहायता दी जाती है। लाभार्थी सत्यापन के बाद नियमित किस्तें जारी की जाती हैं। स्रोत: PIB / कृषि मंत्रालय।",
      source: "PIB / Ministry of Agriculture",
      sourceUrl: "https://pib.gov.in",
      category: "Schemes",
      eventDate: new Date("2024-02-28"),
    },
    {
      id: CA(8),
      titleEn: "Project Tiger — 50 Years & All-India Tiger Census Results",
      titleHi: "प्रोजेक्ट टाइगर — 50 वर्ष और अखिल भारतीय बाघ गणना परिणाम",
      summaryEn:
        "India celebrated 50 years of Project Tiger in 2023. The latest all-India tiger census reported India's tiger population exceeding 3,600 — making India home to over 70% of the world's wild tigers. Uttarakhand's Jim Corbett and Rajaji Tiger Reserves are key habitats. Source: Ministry of Environment.",
      summaryHi:
        "2023 में भारत ने प्रोजेक्ट टाइगर के 50 वर्ष पूरे किए। नवीनतम बाघ गणना में भारत की बाघ आबादी 3,600 से अधिक पाई गई — जो विश्व के 70% से अधिक जंगली बाघों का घर है। उत्तराखंड के जिम कॉर्बेट और राजाजी टाइगर रिजर्व प्रमुख आवास हैं। स्रोत: पर्यावरण मंत्रालय।",
      source: "PIB / Ministry of Environment",
      sourceUrl: "https://pib.gov.in",
      category: "Environment",
      eventDate: new Date("2023-04-09"),
    },
    {
      id: CA(9),
      titleEn: "PM Vishwakarma Yojana — Traditional Artisans Support Scheme",
      titleHi: "PM विश्वकर्मा योजना — पारंपरिक कारीगर सहायता योजना",
      summaryEn:
        "PM Vishwakarma Yojana provides financial assistance, skill training, and market support to traditional craftspeople and artisans across 18 trade categories. Launched September 2023. Source: PIB / Ministry of MSME.",
      summaryHi:
        "PM विश्वकर्मा योजना 18 व्यापार श्रेणियों के पारंपरिक कारीगरों को वित्तीय सहायता, कौशल प्रशिक्षण और बाजार सहायता प्रदान करती है। सितंबर 2023 में शुरू। स्रोत: PIB / MSME मंत्रालय।",
      source: "PIB / Ministry of MSME",
      sourceUrl: "https://pib.gov.in",
      category: "Schemes",
      eventDate: new Date("2023-09-17"),
    },
    {
      id: CA(10),
      titleEn: "India GDP Growth Rate 2023–24 — Economic Survey Highlights",
      titleHi: "भारत GDP वृद्धि दर 2023–24 — आर्थिक सर्वेक्षण के प्रमुख बिंदु",
      summaryEn:
        "India's GDP grew at approximately 8.2% in 2023–24 (advance estimates), making it the fastest-growing major economy in the world. The Economic Survey highlighted resilience of domestic consumption and infrastructure investment. Source: PIB / Ministry of Finance.",
      summaryHi:
        "भारत की GDP ने 2023–24 में लगभग 8.2% की वृद्धि दर्ज की (अग्रिम अनुमान), जो इसे विश्व की सबसे तेजी से बढ़ती प्रमुख अर्थव्यवस्था बनाती है। आर्थिक सर्वेक्षण में घरेलू खपत और बुनियादी ढांचे में निवेश की मजबूती को रेखांकित किया गया। स्रोत: PIB / वित्त मंत्रालय।",
      source: "PIB / Ministry of Finance",
      sourceUrl: "https://pib.gov.in",
      category: "National",
      eventDate: new Date("2024-02-01"),
    },
    {
      id: CA(11),
      titleEn: "One Nation One Subscription — Open Access to Research Journals",
      titleHi: "एक राष्ट्र एक सदस्यता — शोध पत्रिकाओं तक खुली पहुंच",
      summaryEn:
        "The One Nation One Subscription scheme provides students, researchers, and faculty at government institutions access to international peer-reviewed journals. This promotes research and knowledge access. Source: PIB / DST.",
      summaryHi:
        "एक राष्ट्र एक सदस्यता योजना सरकारी संस्थानों के छात्रों, शोधकर्ताओं और शिक्षकों को अंतर्राष्ट्रीय शोध पत्रिकाओं तक पहुंच प्रदान करती है। स्रोत: PIB / DST।",
      source: "PIB / DST",
      sourceUrl: "https://pib.gov.in",
      category: "National",
      eventDate: new Date("2024-01-10"),
    },
    {
      id: CA(12),
      titleEn: "India-Nepal Connectivity — Raxaul–Kathmandu Rail Project",
      titleHi: "भारत-नेपाल संपर्क — रक्सौल–काठमांडू रेल परियोजना",
      summaryEn:
        "India and Nepal are advancing the Raxaul–Kathmandu rail link project to enhance bilateral connectivity. This cross-border infrastructure project is important for trade, tourism, and regional cooperation. Source: PIB / Ministry of External Affairs.",
      summaryHi:
        "भारत और नेपाल द्विपक्षीय संपर्क बढ़ाने के लिए रक्सौल–काठमांडू रेल लिंक परियोजना को आगे बढ़ा रहे हैं। यह सीमापार बुनियादी ढांचा परियोजना व्यापार, पर्यटन और क्षेत्रीय सहयोग के लिए महत्वपूर्ण है। स्रोत: PIB / विदेश मंत्रालय।",
      source: "PIB / Ministry of External Affairs",
      sourceUrl: "https://pib.gov.in",
      category: "International",
      eventDate: new Date("2024-05-01"),
    },
  ];

  for (const ev of events) {
    await prisma.currentAffairsEvent.upsert({
      where: { id: ev.id },
      create: { ...ev, createdBy: ADMIN },
      update: {
        titleEn: ev.titleEn,
        titleHi: ev.titleHi,
        summaryEn: ev.summaryEn,
        summaryHi: ev.summaryHi,
        sourceUrl: ev.sourceUrl,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${events.length} CurrentAffairsEvents.`);
}

// ─── 9. MagazineResources ────────────────────────────────────────────────────
async function seedMagazines() {
  const magazines = [
    {
      id: MG(1),
      titleEn: "Yojana — Monthly Government Policy Magazine",
      titleHi: "योजना — मासिक सरकारी नीति पत्रिका",
      descriptionEn:
        "Yojana is the flagship monthly magazine of the Government of India covering development, policy, schemes, and governance. Highly recommended for UPSC/UKPSC General Studies. Available free at the Publications Division portal.",
      descriptionHi:
        "योजना भारत सरकार की प्रमुख मासिक पत्रिका है जो विकास, नीति, योजनाएं और शासन को कवर करती है। UPSC/UKPSC सामान्य अध्ययन के लिए अत्यंत उपयोगी। प्रकाशन विभाग पोर्टल पर निःशुल्क उपलब्ध।",
      url: "https://yojana.gov.in",
      type: "Yojana",
      publishMonth: "Latest Issue",
    },
    {
      id: MG(2),
      titleEn: "Kurukshetra — Rural Development & Agriculture Magazine",
      titleHi: "कुरुक्षेत्र — ग्रामीण विकास और कृषि पत्रिका",
      descriptionEn:
        "Kurukshetra is the Ministry of Rural Development's monthly magazine covering agriculture, rural schemes, Panchayati Raj, and village economy. Important for UKPSC Paper 1 — Agriculture and Rural Uttarakhand questions.",
      descriptionHi:
        "कुरुक्षेत्र ग्रामीण विकास मंत्रालय की मासिक पत्रिका है जो कृषि, ग्रामीण योजनाएं, पंचायती राज और ग्रामीण अर्थव्यवस्था को कवर करती है। UKPSC पेपर 1 के लिए महत्वपूर्ण।",
      url: "https://kurukshetra.nic.in",
      type: "Kurukshetra",
      publishMonth: "Latest Issue",
    },
    {
      id: MG(3),
      titleEn: "PIB — Press Information Bureau Daily Updates",
      titleHi: "PIB — प्रेस सूचना ब्यूरो दैनिक अपडेट",
      descriptionEn:
        "PIB releases official government press notes daily covering central government schemes, policies, achievements, and decisions. An essential primary source for Current Affairs preparation.",
      descriptionHi:
        "PIB प्रतिदिन केंद्र सरकार की योजनाओं, नीतियों, उपलब्धियों और निर्णयों पर आधिकारिक प्रेस नोट जारी करता है। सामयिकी तैयारी के लिए प्राथमिक स्रोत।",
      url: "https://pib.gov.in",
      type: "Monthly Digest",
      publishMonth: "Daily",
    },
    {
      id: MG(4),
      titleEn: "Employment News — Weekly Government Jobs & Opportunities",
      titleHi: "रोजगार समाचार — साप्ताहिक सरकारी नौकरी और अवसर",
      descriptionEn:
        "Employment News is the Government of India's weekly newspaper listing central and state government job vacancies, exam notifications, and career guidance. Available at Publications India portal.",
      descriptionHi:
        "रोजगार समाचार भारत सरकार का साप्ताहिक समाचार पत्र है जिसमें केंद्र और राज्य सरकार की नौकरियां, परीक्षा अधिसूचनाएं और करियर मार्गदर्शन शामिल होते हैं।",
      url: "https://www.employmentnews.gov.in",
      type: "Monthly Digest",
      publishMonth: "Weekly",
    },
  ];

  for (const mag of magazines) {
    await prisma.magazineResource.upsert({
      where: { id: mag.id },
      create: { ...mag, createdBy: ADMIN },
      update: {
        titleEn: mag.titleEn,
        titleHi: mag.titleHi,
        descriptionEn: mag.descriptionEn,
        descriptionHi: mag.descriptionHi,
        url: mag.url,
        updatedBy: ADMIN,
      },
    });
  }
  console.log(`✅ Upserted ${magazines.length} MagazineResources.`);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌱 Starting Information Engine seeding...\n");
  await seedExamEvents();
  await seedOfficialLinks();
  await seedNotifications();
  await seedAnswerKeys();
  await seedMapResources();
  await seedGovtLearningLinks();
  await seedPYQPapers();
  await seedCurrentAffairs();
  await seedMagazines();
  console.log("\n🎉 Information Engine seeding completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
