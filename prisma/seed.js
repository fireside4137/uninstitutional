/* eslint-disable */
// ================================================
// UNINSTITUTIONAL — Database Seeder
// ================================================
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clear existing exam/subject/topic/question data
  // Clean order matters to respect foreign keys
  await prisma.bookmark.deleteMany();
  await prisma.examEvent.deleteMany();
  await prisma.officialLink.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.answerKey.deleteMany();
  await prisma.mapResource.deleteMany();
  await prisma.govtLearningLink.deleteMany();
  await prisma.pYQPaper.deleteMany();
  await prisma.currentAffairsEvent.deleteMany();
  await prisma.magazineResource.deleteMany();

  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.exam.deleteMany();

  console.log("🧹 Cleaned old exam, subject, topic, question, and information hub records.");

  // 2. Create Exams
  const examUkpsc = await prisma.exam.create({
    data: {
      name: "UKPSC",
      fullName: "Uttarakhand Public Service Commission",
      fullNameHi: "उत्तराखंड लोक सेवा आयोग",
      description: "Exams for administrative and executive state-level officer posts.",
    },
  });

  const examUkssc = await prisma.exam.create({
    data: {
      name: "UKSSC",
      fullName: "Uttarakhand Subordinate Service Selection Commission",
      fullNameHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग",
      description: "Group C exams for technical, clerical, and field posts in Uttarakhand.",
    },
  });

  console.log("🏆 Created Exams: UKPSC & UKSSC.");

  // 3. Create Subjects for UKPSC
  const subjUkpscGS = await prisma.subject.create({
    data: {
      examId: examUkpsc.id,
      name: "General Studies",
      nameHi: "सामान्य अध्ययन",
      orderIndex: 1,
    },
  });

  // 4. Create Subjects for UKSSC
  const subjUksscGK = await prisma.subject.create({
    data: {
      examId: examUkssc.id,
      name: "Uttarakhand General Knowledge",
      nameHi: "उत्तराखंड सामान्य ज्ञान",
      orderIndex: 1,
    },
  });

  const subjUksscHindi = await prisma.subject.create({
    data: {
      examId: examUkssc.id,
      name: "General Hindi",
      nameHi: "सामान्य हिन्दी",
      orderIndex: 2,
    },
  });

  console.log("📚 Created Subjects for UKPSC & UKSSC.");

  // 5. Create Topics for General Studies (UKPSC)
  const topicPolity = await prisma.topic.create({
    data: {
      subjectId: subjUkpscGS.id,
      title: "Indian Polity — Fundamental Rights",
      titleHi: "भारतीय राजव्यवस्था — मौलिक अधिकार",
      content: "Fundamental Rights are enshrined in Part III of the Constitution of India (Articles 12 to 35). They guarantee civil liberties such that all Indians can lead their lives in peace and harmony. These include Equality before law, Freedom of Speech, Right to Life and Personal Liberty, and Right to Constitutional Remedies under Article 32.",
      contentHi: "मौलिक अधिकारों का वर्णन भारत के संविधान के भाग III (अनुच्छेद 12 से 35) में किया गया है। ये प्रत्येक नागरिक को नागरिक स्वतंत्रता की गारंटी देते हैं ताकि सभी भारतीय शांति और सद्भाव से रह सकें। इनमें कानून के समक्ष समानता, भाषण की स्वतंत्रता, जीवन और व्यक्तिगत स्वतंत्रता का अधिकार, और अनुच्छेद 32 के तहत संवैधानिक उपचारों का अधिकार शामिल हैं।",
      estimatedMinutes: 20,
      orderIndex: 1,
    },
  });

  const topicKatyuri = await prisma.topic.create({
    data: {
      subjectId: subjUkpscGS.id,
      title: "Uttarakhand History — Katyuri Dynasty",
      titleHi: "उत्तराखंड का इतिहास — कत्यूरी राजवंश",
      content: "The Katyuri Dynasty was an ancient ruling house of Uttarakhand, ruling from Kartikeyapura between the 8th and 12th centuries AD. Founded by Vasantan, the dynasty is celebrated for its monumental stone temple architecture, particularly the temples in Joshimath and Baijnath Valley.",
      contentHi: "कत्यूरी राजवंश उत्तराखंड का एक प्राचीन शासक घराना था, जिसने 8वीं से 12वीं शताब्दी ईस्वी के बीच कार्तिकेयपुर से शासन किया था। वसंतन द्वारा स्थापित, यह राजवंश अपने विशाल पत्थर के मंदिर वास्तुकला के लिए प्रसिद्ध है, विशेष रूप से जोशीमठ और बैजनाथ घाटी के मंदिर।",
      estimatedMinutes: 25,
      orderIndex: 2,
    },
  });

  // 6. Create Topics for Uttarakhand GK (UKSSC)
  const topicChand = await prisma.topic.create({
    data: {
      subjectId: subjUksscGK.id,
      title: "Uttarakhand GK — Chand Dynasty of Kumaon",
      titleHi: "उत्तराखंड सामान्य ज्ञान — कुमाऊं का चंद राजवंश",
      content: "The Chand Dynasty ruled the Kumaon region of Uttarakhand from the 10th to the 18th century AD. Som Chand was the founder, setting up the kingdom in Champawat. Later, Almora was made the capital. They introduced administrative reforms, land settlement systems, and patronized regional art.",
      contentHi: "चंद राजवंश ने 10वीं से 18वीं शताब्दी ईस्वी तक उत्तराखंड के कुमाऊं क्षेत्र पर शासन किया। सोम चंद इसके संस्थापक थे, जिन्होंने चंपावत में साम्राज्य स्थापित किया था। बाद में, अल्मोड़ा को राजधानी बनाया गया। उन्होंने प्रशासनिक सुधार, भूमि बंदोबस्त प्रणाली शुरू की और क्षेत्रीय कला को संरक्षण दिया।",
      estimatedMinutes: 20,
      orderIndex: 1,
    },
  });

  // 7. Create Topics for Hindi (UKSSC)
  const topicSandhi = await prisma.topic.create({
    data: {
      subjectId: subjUksscHindi.id,
      title: "Hindi Grammar — Sandhi Rules",
      titleHi: "हिन्दी व्याकरण — संधि के नियम",
      content: "Sandhi refers to the joining of two sounds or letters when they come together. There are three main types of Sandhi in Hindi: Swar Sandhi (Vowel Joining), Vyanjan Sandhi (Consonant Joining), and Visarga Sandhi. Understanding Sandhi is crucial for spelling and compound word identification.",
      contentHi: "संधि का अर्थ दो वर्णों के मेल से होने वाले विकार से है। हिन्दी में संधि के तीन मुख्य प्रकार हैं: स्वर संधि, व्यंजन संधि और विसर्ग संधि। वर्तनी और यौगिक शब्दों की पहचान के लिए संधि को समझना अत्यंत आवश्यक है।",
      estimatedMinutes: 15,
      orderIndex: 1,
    },
  });

  console.log("📝 Created Topics.");

  // 8. Create Questions for Polity (Fundamental Rights)
  await prisma.question.createMany({
    data: [
      {
        topicId: topicPolity.id,
        text: "Which Article of the Indian Constitution is referred to as the 'Heart and Soul' of the Constitution by Dr. B.R. Ambedkar?",
        textHi: "डॉ. बी.आर. अम्बेडकर द्वारा भारतीय संविधान के किस अनुच्छेद को संविधान का 'हृदय और आत्मा' कहा गया है?",
        optionA: "Article 14 (Equality before law)",
        optionAHi: "अनुच्छेद 14 (कानून के समक्ष समानता)",
        optionB: "Article 19 (Right to Freedom)",
        optionBHi: "अनुच्छेद 19 (स्वतंत्रता का अधिकार)",
        optionC: "Article 21 (Right to Life)",
        optionCHi: "अनुच्छेद 21 (जीवन का अधिकार)",
        optionD: "Article 32 (Right to Constitutional Remedies)",
        optionDHi: "अनुच्छेद 32 (संवैधानिक उपचारों का अधिकार)",
        correctOption: "D",
        explanation: "Dr. B.R. Ambedkar declared Article 32 as the heart and soul of the Constitution because it provides the right to petition the Supreme Court directly to enforce Fundamental Rights.",
        explanationHi: "डॉ. बी.आर. अम्बेडकर ने अनुच्छेद 32 को संविधान का हृदय और आत्मा घोषित किया क्योंकि यह मौलिक अधिकारों को लागू करने के लिए सीधे सर्वोच्च न्यायालय में याचिका दायर करने का अधिकार प्रदान करता है।",
        difficulty: "MEDIUM",
        isPYQ: true,
        pyqYear: 2021,
      },
      {
        topicId: topicPolity.id,
        text: "Right to Education (RTE) was added as a Fundamental Right under Article 21A by which Constitutional Amendment Act?",
        textHi: "शिक्षा का अधिकार (RTE) किस संविधान संशोधन अधिनियम द्वारा अनुच्छेद 21A के तहत मौलिक अधिकार के रूप में जोड़ा गया था?",
        optionA: "44th Amendment Act, 1978",
        optionAHi: "44वां संशोधन अधिनियम, 1978",
        optionB: "86th Amendment Act, 2002",
        optionBHi: "86वां संशोधन अधिनियम, 2002",
        optionC: "91st Amendment Act, 2003",
        optionCHi: "91वां संशोधन अधिनियम, 2003",
        optionD: "103rd Amendment Act, 2019",
        optionDHi: "103वां संशोधन अधिनियम, 2019",
        correctOption: "B",
        explanation: "The 86th Amendment Act in 2002 inserted Article 21A, making free and compulsory education for children between the ages of 6 and 14 a Fundamental Right.",
        explanationHi: "2002 में 86वें संशोधन अधिनियम द्वारा अनुच्छेद 21A जोड़ा गया, जिससे 6 से 14 वर्ष की आयु के बच्चों के लिए मुफ्त और अनिवार्य शिक्षा को मौलिक अधिकार बनाया गया।",
        difficulty: "EASY",
        isPYQ: false,
      },
    ],
  });

  // 9. Create Questions for Katyuri Dynasty
  await prisma.question.createMany({
    data: [
      {
        topicId: topicKatyuri.id,
        text: "Who was the historical founder of the Katyuri Dynasty in Uttarakhand?",
        textHi: "उत्तराखंड में कत्यूरी राजवंश का ऐतिहासिक संस्थापक कौन था?",
        optionA: "Som Chand",
        optionAHi: "सोम चंद",
        optionB: "Vasantan",
        optionBHi: "वसंतन",
        optionC: "Kanakpal",
        optionCHi: "कनकपाल",
        optionD: "Kharak Dev",
        optionDHi: "खड़क देव",
        correctOption: "B",
        explanation: "Vasantan is documented as the historic founder of the unified Katyuri Dynasty, setting up the early capital at Kartikeyapura in Joshimath.",
        explanationHi: "वसंतन को एकीकृत कत्यूरी राजवंश के ऐतिहासिक संस्थापक के रूप में प्रलेखित किया गया है, जिन्होंने जोशीमठ में कार्तिकेयपुर में प्रारंभिक राजधानी स्थापित की थी।",
        difficulty: "MEDIUM",
        isPYQ: true,
        pyqYear: 2019,
      },
      {
        topicId: topicKatyuri.id,
        text: "Where was the initial capital of the Katyuri Dynasty situated before it was shifted to Baijnath Valley?",
        textHi: "बैजनाथ घाटी में स्थानांतरित होने से पहले कत्यूरी राजवंश की प्रारंभिक राजधानी कहाँ स्थित थी?",
        optionA: "Champawat",
        optionAHi: "चंपावत",
        optionB: "Srinagar Garhwal",
        optionBHi: "श्रीनगर गढ़वाल",
        optionC: "Kartikeyapura (Joshimath)",
        optionCHi: "कार्तिकेयपुर (जोशीमठ)",
        optionD: "Almora",
        optionDHi: "अल्मोड़ा",
        correctOption: "C",
        explanation: "The Katyuris initially ruled from Kartikeyapura (near modern Joshimath) before shifting down to the fertile Katyur Valley (Baijnath) in Bageshwar.",
        explanationHi: "कत्यूरी शुरू में कार्तिकेयपुर (आधुनिक जोशीमठ के पास) से शासन करते थे और बाद में बागेश्वर की उपजाऊ कत्यूरी घाटी (बैजनाथ) में स्थानांतरित हो गए।",
        difficulty: "MEDIUM",
        isPYQ: false,
      },
    ],
  });

  // 10. Create Questions for Chand Dynasty (UKSSC)
  await prisma.question.createMany({
    data: [
      {
        topicId: topicChand.id,
        text: "Which Chand ruler established Almora as the official capital of the Kumaon kingdom, moving it from Champawat?",
        textHi: "किस चंद शासक ने चंपावत से हटाकर अल्मोड़ा को कुमाऊं साम्राज्य की आधिकारिक राजधानी के रूप में स्थापित किया था?",
        optionA: "Som Chand",
        optionAHi: "सोम चंद",
        optionB: "Rudra Chand",
        optionBHi: "रुद्र चंद",
        optionC: "Kalyan Chand Balo",
        optionCHi: "बालो कल्याण चंद",
        optionD: "Gyan Chand",
        optionDHi: "ज्ञान चंद",
        correctOption: "C",
        explanation: "Balo Kalyan Chand constructed the Lal Mandi fort at Almora and officially shifted the Chand dynasty capital from Champawat to Almora in 1563 AD.",
        explanationHi: "बालो कल्याण चंद ने अल्मोड़ा में लाल मंडी किले का निर्माण कराया और 1563 ईस्वी में चंद राजवंश की राजधानी को चंपावत से अल्मोड़ा स्थानांतरित कर दिया।",
        difficulty: "HARD",
        isPYQ: true,
        pyqYear: 2022,
      },
    ],
  });

  // 11. Create Questions for Sandhi Rules (Hindi)
  await prisma.question.createMany({
    data: [
      {
        topicId: topicSandhi.id,
        text: "What type of Swar Sandhi is found in the word 'Himalaya' (Him + Alaya)?",
        textHi: "'हिमालय' (हिम + आलय) शब्द में किस प्रकार की स्वर संधि पाई जाती है?",
        optionA: "Dirgha Sandhi (दीर्घ संधि)",
        optionAHi: "दीर्घ संधि",
        optionB: "Guna Sandhi (गुण संधि)",
        optionBHi: "गुण संधि",
        optionC: "Vriddhi Sandhi (वृद्धि संधि)",
        optionCHi: "वृद्धि संधि",
        optionD: "Yan Sandhi (यण संधि)",
        optionDHi: "यण संधि",
        correctOption: "A",
        explanation: "In 'Him + Alaya', the joining vowel sounds 'a' + 'aa' fuse into 'aa', which is the signature rule of Dirgha Swar Sandhi.",
        explanationHi: "'हिम + आलय' में 'अ' + 'आ' मिलकर 'आ' बनते हैं, जो दीर्घ स्वर संधि का मूल नियम है।",
        difficulty: "EASY",
        isPYQ: false,
      },
    ],
  });

  console.log("✨ Created Questions for all topics.");
  console.log("✨ Created Questions for all topics.");

  // 6. Seed Information Hubs Data

  // 6a. Seeding Exam Events
  const dateOpen = new Date();
  dateOpen.setDate(dateOpen.getDate() - 10);
  const dateCloseSoon = new Date();
  dateCloseSoon.setDate(dateCloseSoon.getDate() + 5);
  const dateExam = new Date();
  dateExam.setDate(dateExam.getDate() + 45);

  const dateCloseSoon2 = new Date();
  dateCloseSoon2.setDate(dateCloseSoon2.getDate() + 2);
  const dateExam2 = new Date();
  dateExam2.setDate(dateExam2.getDate() + 30);

  const dateFutureOpen = new Date();
  dateFutureOpen.setDate(dateFutureOpen.getDate() + 15);
  const dateFutureClose = new Date();
  dateFutureClose.setDate(dateFutureClose.getDate() + 40);
  const dateFutureExam = new Date();
  dateFutureExam.setDate(dateFutureExam.getDate() + 90);

  await prisma.examEvent.createMany({
    data: [
      {
        titleEn: "UKPSC Combined State Upper Subordinate Services Exam 2026",
        titleHi: "यूकेपीएससी संयुक्त राज्य ऊपरी अधीनस्थ सेवा परीक्षा 2026",
        examCategory: "UKPSC",
        authorityEn: "Uttarakhand Public Service Commission",
        authorityHi: "उत्तराखंड लोक सेवा आयोग",
        formOpenDate: dateOpen,
        formCloseDate: dateCloseSoon,
        examDate: dateExam,
        admitCardDate: new Date(dateExam.getTime() - 10 * 24 * 60 * 60 * 1000),
        applyUrl: "https://psc.uk.gov.in",
        notificationUrl: "https://psc.uk.gov.in/notifications",
        status: "Closing Soon",
        createdBy: "System",
      },
      {
        titleEn: "UKSSC Forest Guard and Environmental Specialist Recruitment 2026",
        titleHi: "यूकेएसएससी वन रक्षक और पर्यावरण विशेषज्ञ भर्ती 2026",
        examCategory: "UKSSC",
        authorityEn: "Uttarakhand Subordinate Service Selection Commission",
        authorityHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग",
        formOpenDate: dateOpen,
        formCloseDate: dateCloseSoon2,
        examDate: dateExam2,
        admitCardDate: new Date(dateExam2.getTime() - 7 * 24 * 60 * 60 * 1000),
        applyUrl: "https://sssc.uk.gov.in",
        notificationUrl: "https://sssc.uk.gov.in/notifications",
        status: "Closing Soon",
        createdBy: "System",
      },
      {
        titleEn: "SSC Combined Graduate Level (CGL) Exam 2026",
        titleHi: "एसएससी संयुक्त स्नातक स्तरीय (CGL) परीक्षा 2026",
        examCategory: "SSC",
        authorityEn: "Staff Selection Commission",
        authorityHi: "कर्मचारी चयन आयोग",
        formOpenDate: dateFutureOpen,
        formCloseDate: dateFutureClose,
        examDate: dateFutureExam,
        applyUrl: "https://ssc.gov.in",
        notificationUrl: "https://ssc.gov.in/notifications",
        status: "Upcoming",
        createdBy: "System",
      },
    ],
  });

  // 6b. Seeding Official Links
  await prisma.officialLink.createMany({
    data: [
      {
        titleEn: "UKPSC Official Website",
        titleHi: "यूकेपीएससी आधिकारिक वेबसाइट",
        url: "https://psc.uk.gov.in",
        authorityEn: "Uttarakhand Public Service Commission",
        authorityHi: "उत्तराखंड लोक सेवा आयोग",
        category: "Official Portal",
        isTrusted: true,
        createdBy: "System",
      },
      {
        titleEn: "UKSSC Official Portal",
        titleHi: "यूकेएसएससी आधिकारिक पोर्टल",
        url: "https://sssc.uk.gov.in",
        authorityEn: "Uttarakhand Subordinate Service Selection Commission",
        authorityHi: "उत्तराखंड अधीनस्थ सेवा चयन आयोग",
        category: "Official Portal",
        isTrusted: true,
        createdBy: "System",
      },
      {
        titleEn: "Government of Uttarakhand State Portal",
        titleHi: "उत्तराखंड सरकार राज्य पोर्टल",
        url: "https://uk.gov.in",
        authorityEn: "Govt of Uttarakhand",
        authorityHi: "उत्तराखंड सरकार",
        category: "State Portal",
        isTrusted: true,
        createdBy: "System",
      },
    ],
  });

  // 6c. Seeding Notifications
  await prisma.notification.createMany({
    data: [
      {
        titleEn: "Urgent Warning: UKSSC Forest Guard application closing in 2 days!",
        titleHi: "महत्वपूर्ण चेतावनी: यूकेएसएससी वन रक्षक आवेदन २ दिनों में समाप्त हो रहा है!",
        contentEn: "Make sure to complete your application fees payment and document uploads before the deadline.",
        contentHi: "अंतिम तिथि से पहले अपना आवेदन शुल्क भुगतान और दस्तावेज़ अपलोड पूरा करना सुनिश्चित करें।",
        linkUrl: "https://sssc.uk.gov.in",
        category: "Admit Card",
        isNew: true,
        createdBy: "System",
      },
      {
        titleEn: "Official Release: UKPSC Syllabus for Upper PCS 2026 update",
        titleHi: "आधिकारिक घोषणा: यूकेपीएससी अपर पीसीएस 2026 अपडेट सिलेबस",
        contentEn: "The commission has updated the regional history weightage in Paper II. Click here to read.",
        contentHi: "आयोग ने पेपर II में क्षेत्रीय इतिहास के वेटेज को अपडेट किया है। पढ़ने के लिए यहां क्लिक करें।",
        linkUrl: "https://psc.uk.gov.in",
        category: "General",
        isNew: true,
        createdBy: "System",
      },
    ],
  });

  // 6d. Seeding Answer Keys
  await prisma.answerKey.createMany({
    data: [
      {
        titleEn: "UKPSC Assistant Review Officer (ARO) Preliminary Answer Key 2026",
        titleHi: "यूकेपीएससी सहायक समीक्षा अधिकारी (ARO) प्रारंभिक उत्तर कुंजी 2026",
        examNameEn: "ARO Prelims",
        examNameHi: "एआरओ प्रारंभिक परीक्षा",
        pdfUrl: "https://psc.uk.gov.in/files/aro_answer_key_2026.pdf",
        officialLink: "https://psc.uk.gov.in/results",
        isOfficial: true,
        createdBy: "System",
      },
    ],
  });

  // 6e. Seeding Map Resources
  await prisma.mapResource.createMany({
    data: [
      {
        titleEn: "Uttarakhand Rivers and Basins Geography Map",
        titleHi: "उत्तराखंड की नदियाँ और बेसिन भूगोल मानचित्र",
        descriptionEn: "High-resolution map outlining the paths of Alaknanda, Bhagirathi, Yamuna, and Kali rivers.",
        descriptionHi: "अलकनंदा, भागीरथी, यमुना और काली नदियों के मार्गों को रेखांकित करने वाला उच्च-रिज़ॉल्यूशन मानचित्र।",
        imageUrl: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=800",
        pdfUrl: "https://uninstitutional.com/maps/uk_rivers.pdf",
        category: "River Maps",
        createdBy: "System",
      },
      {
        titleEn: "Uttarakhand District Boundaries and Administrative Divisions",
        titleHi: "उत्तराखंड जिला सीमाएं और प्रशासनिक प्रभाग",
        descriptionEn: "Complete map dividing Garhwal and Kumaon commission divisions and their 13 districts.",
        descriptionHi: "गढ़वाल और कुमाऊं आयोग प्रभागों और उनके 13 जिलों को विभाजित करने वाला संपूर्ण मानचित्र।",
        imageUrl: "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&q=80&w=800",
        pdfUrl: "https://uninstitutional.com/maps/uk_districts.pdf",
        category: "District Maps",
        createdBy: "System",
      },
    ],
  });

  // 6f. Seeding Govt Learning Links
  await prisma.govtLearningLink.createMany({
    data: [
      {
        titleEn: "SWAYAM Lecture Series — Indian Constitutional Law",
        titleHi: "स्वयं व्याख्यान श्रृंखला — भारतीय संवैधानिक कानून",
        descriptionEn: "Bilingual academic video lectures covering fundamental rights, directive principles, and amendments.",
        descriptionHi: "मौलिक अधिकारों, राज्य के नीति निदेशक तत्वों और संशोधनों को कवर करने वाले द्विभाषी व्याख्यान वीडियो।",
        url: "https://swayam.gov.in/explorer?searchText=polity",
        provider: "SWAYAM",
        subjectEn: "Polity",
        subjectHi: "राजव्यवस्था",
        createdBy: "System",
      },
    ],
  });

  // 6g. Seeding PYQs
  await prisma.pYQPaper.createMany({
    data: [
      {
        titleEn: "UKPSC Executive Officer General Studies Question Paper 2023",
        titleHi: "यूकेपीएससी अधिशासी अधिकारी सामान्य अध्ययन प्रश्न पत्र 2023",
        examName: "Executive Officer",
        examCategory: "UKPSC",
        year: 2023,
        pdfUrl: "https://psc.uk.gov.in/files/eo_gs_2023.pdf",
        officialLink: "https://psc.uk.gov.in/old-papers",
        subjectEn: "General Studies",
        subjectHi: "सामान्य अध्ययन",
        createdBy: "System",
      },
      {
        titleEn: "UKSSC VDO/VPDO Recruitment Exam Paper 2021",
        titleHi: "यूकेएसएससी वीडीओ/वीपीडीओ भर्ती परीक्षा पत्र 2021",
        examName: "VDO/VPDO",
        examCategory: "UKSSC",
        year: 2021,
        pdfUrl: "https://sssc.uk.gov.in/files/vdo_2021.pdf",
        officialLink: "https://sssc.uk.gov.in/question-papers",
        subjectEn: "Uttarakhand GK & Hindi",
        subjectHi: "उत्तराखंड सामान्य ज्ञान और हिन्दी",
        createdBy: "System",
      },
    ],
  });

  // 6h. Seeding Current Affairs
  await prisma.currentAffairsEvent.createMany({
    data: [
      {
        titleEn: "Uttarakhand State Budget 2026 Highlights",
        titleHi: "उत्तराखंड राज्य बजट 2026 की मुख्य विशेषताएं",
        summaryEn: "The finance minister announced a major budget allocation of Rs 2,500 Crores for rural development and Himalayan horticulture promotion.",
        summaryHi: "वित्त मंत्री ने ग्रामीण विकास और हिमालयी बागवानी प्रोत्साहन के लिए 2,500 करोड़ रुपये के बड़े बजट आवंटन की घोषणा की।",
        source: "PIB Dehradun",
        sourceUrl: "https://pib.gov.in",
        category: "Schemes",
        eventDate: new Date(),
        createdBy: "System",
      },
      {
        titleEn: "Launch of Self-Employment Scheme for Rural Youth (Mukhya Mantri Swarojgar Yojana)",
        titleHi: "ग्रामीण युवाओं के लिए स्वरोजगार योजना का शुभारंभ (मुख्यमंत्री स्वरोजगार योजना)",
        summaryEn: "Uttarakhand government launches direct subsidy up to 25% for setting up eco-tourism and organic farming units.",
        summaryHi: "उत्तराखंड सरकार ने पर्यावरण-पर्यटन और जैविक खेती इकाइयों की स्थापना के लिए 25% तक प्रत्यक्ष सब्सिडी की शुरुआत की।",
        source: "Uttarakhand Info Portal",
        sourceUrl: "https://information.uk.gov.in",
        category: "Schemes",
        eventDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: "System",
      },
    ],
  });

  // 6i. Seeding Magazines
  await prisma.magazineResource.createMany({
    data: [
      {
        titleEn: "Yojana Magazine May 2026 — Digital Governance in India",
        titleHi: "योजना पत्रिका मई 2026 — भारत में डिजिटल गवर्नेंस",
        descriptionEn: "Curated PDF digest covering technological policies, e-kranti, and rural internet initiatives.",
        descriptionHi: "तकनीकी नीतियों, ई-क्रांति और ग्रामीण इंटरनेट पहलों को कवर करने वाली योजना पत्रिका सारांश पीडीएफ।",
        url: "http://yojana.gov.in",
        type: "Yojana",
        publishMonth: "May 2026",
        createdBy: "System",
      },
    ],
  });

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
