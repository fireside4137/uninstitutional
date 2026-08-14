# UKPSC Content Engine — Implementation Plan

This document outlines the architecture, database mapping, safe seeding strategy, and regression protection plan for integrating the UKPSC Prelims master learning taxonomy into the UnInstitutional platform.

---

## 1. Current Architecture Assessment

An audit of the current Prisma schema shows that the existing models are already highly mature and well-suited to support the UKPSC Prelims learning structure with minimal modifications:

* **Exam Model**: Represents the top-level exam. The `ExamType` enum already contains `UKPSC`, meaning we can directly query and link subjects to this exam type.
* **Subject Model**: Represents subject areas (e.g., History, Geography). It links to the `Exam` model and supports bilingual fields (`name` and `nameHi`).
* **Topic Model**: Holds study content and notes. It supports bilingual title (`title`/`titleHi`) and rich text content (`content`/`contentHi`).
* **Question Model**: Fully supports bilingual questions, options, explanations, difficulty level mapping (using the existing `Difficulty` enum), and past-year question (PYQ) tracking (`isPYQ`, `pyqYear`).
* **Other Entities**: Models like `PYQPaper`, `CurrentAffairsEvent`, and `MapResource` are already defined and ready to support auxiliary content.

---

## 2. Taxonomy Mapping & Paper Representation

### The Paper Layer Challenge
The UKPSC Prelims skeleton divides content into two primary papers:
* **Paper I**: General Studies (150 MCQs, merit-ranking)
* **Paper II**: CSAT / General Aptitude (100 MCQs, qualifying at 33%)

Since the current database has no dedicated `Paper` model or field, we have two primary options:

#### Option A: Add a `paper` field to the `Subject` model (Recommended)
Add an optional `paper` string field directly to the `Subject` model in `schema.prisma`.
* **Prisma Field**: `paper String?` (e.g., `"PAPER_1"` or `"PAPER_2"`).
* **Pros**: Simple, clean, structurally indexed, fully backwards-compatible, and allows the UI to easily filter and group subjects by paper.
* **Cons**: Requires a minor, safe database push (`npx prisma db push`).

#### Option B: Prefix subject naming (Alternative)
Represent the paper directly inside the subject title (e.g., `Subject.name = "GS Paper I: History of India"`).
* **Pros**: Requires absolutely zero schema changes or database pushes.
* **Cons**: Less structured; requires string matching or parsing on the frontend to filter papers.

> [!NOTE]
> **Plan Selection**: We recommend **Option A** because adding an optional field is an additive, safe operation with zero risk of breaking existing data.

---

## 3. Schema Recommendations

### Proposed Prisma Schema Modification
We propose adding the `paper` field to the `Subject` model:

```diff
model Subject {
  id         String   @id @default(uuid())
  examId     String
  name       String
  nameHi     String
+  paper      String?  // Classifies subject under "PAPER_1" or "PAPER_2"
  orderIndex Int      @default(0)
  createdAt  DateTime @default(now())

  // Relations
  exam   Exam    @relation(fields: [examId], references: [id], onDelete: Cascade)
  topics Topic[]

  @@map("subjects")
}
```

No modifications are required on `Topic`, `Question`, or other models. The existing `Difficulty` enum (`EASY`, `MEDIUM`, `HARD`) will be used to map the skeleton's difficulty levels (`BASIC` -> `EASY`, `INTERMEDIATE` -> `MEDIUM`, `ADVANCED` -> `HARD`), avoiding database enum migrations.

---

## 4. Safe Seeding Strategy

To ensure that seeding new content never crashes the application, duplicates records, or corrupts existing data, we will follow a strict **Static UUID Upsert Strategy**:

1. **Predefined Static UUIDs**: Every exam, subject, and topic in our seed configuration will be assigned a hardcoded, static UUID.
2. **Idempotency via Upsert**: The seed script will use Prisma's `upsert` operation. If a record with that static UUID already exists, Prisma will update its content in place. If it doesn't exist, it will create it.
3. **No Blind Deletions**: The seed script will never run `deleteMany()` or clear existing tables, preserving student progress, logs, and user data.
4. **Rollback capability**: In the event that a seed batch needs to be removed, a separate cleanup script can target and delete only the records associated with our static UUIDs.

---

## 5. MVP Content Batch

We will seed a minimal, high-value MVP batch to test the entire learning engine without polluting the database:

### MVP Batch Structure (5 Subjects, 1 Topic each, 5 MCQs per Topic)

| Subject (English / Hindi) | MVP Topic | Sample MCQs |
|---|---|---|
| **Uttarakhand: Specific Knowledge**<br>उत्तराखंड: विशिष्ट ज्ञान | History and Culture of Uttarakhand<br>उत्तराखंड का इतिहास एवं संस्कृति | 5 bilingual questions on dynasties, culture, and geographic significance. |
| **Geography**<br>भूगोल | Physical Geography of India<br>भारत का भौतिक भूगोल | 5 bilingual questions on major rivers, mountain ranges, and climate zones. |
| **Indian Polity and Governance**<br>भारतीय राजव्यवस्था और शासन | Constitution of India: Preamble & Rights<br>भारत का संविधान: प्रस्तावना और अधिकार | 5 bilingual questions on constitution framing, preamble, and fundamental rights. |
| **Current Affairs**<br>सामयिकी | National & International Events of Importance<br>महत्वपूर्ण राष्ट्रीय और अंतर्राष्ट्रीय घटनाक्रम | 5 bilingual questions on major current summits and bilateral agreements. |
| **Hindi Language (Basic)**<br>सामान्य हिंदी (बुनियादी) | Hindi Grammar and Usage<br>हिंदी व्याकरण और उपयोग | 5 bilingual questions testing basic sandhi, samas, and shabda bhed. |

---

## 6. Bilingual Content Strategy

* **Storage**: We will continue using the existing dual-language fields (`title` / `titleHi`, `content` / `contentHi`).
* **Graceful Fallbacks**: If a Hindi translation is not provided (`textHi` is null), the frontend will fall back to the English field.
* **Moderator Translation**: Custom uploads will accept both English and Hindi inputs.

---

## 7. Admin / Moderator Workflow

For long-term content management, we propose the following upload architecture:
1. **JSON Upload Schema**: Admin dashboard will support importing content via a structured JSON format matching our data mapping.
2. **Review/Publishing Status**: A future update can add a `status` field to topics/questions (`DRAFT` / `PUBLISHED`) to allow previewing content before making it public to students.

---

## 8. Regression Safety Checklist

Before executing any migrations or seeding, we must verify that the following core workflows are preserved:

- [ ] **Authentication**: Users can register and log in successfully.
- [ ] **Dashboard Shell**: The sidebar, header, and settings modal load correctly.
- [ ] **Daily Tasks**: Today's tasks are generated successfully based on user's exam type.
- [ ] **Quiz Engine**: Quizzes load questions, accept submissions, score correctly, and update history.
- [ ] **Rewards & Streaks**: Completing tasks/quizzes updates streaks and awards reward points.
- [ ] **Bookmarks**: Users can bookmark and retrieve resources.
- [ ] **Premium Downloads**: Access control protects downloads and premium contents.
- [ ] **Privacy & Security Logs**: Security actions (rate limits, deletions, exports) continue logging correctly.

---

## 9. Risk Assessment

* **Build Failure**: If network interfaces are down, fetching Google Fonts at build time might fail.
  * *Mitigation*: Ensure stable connection or use cached next/font resources.
* **Database Contention**: Executing seeds on a live database might temporarily lock tables.
  * *Mitigation*: Run upserts sequentially using transaction batches or a throttled loop.

---

## 10. Open Questions for User Review

Please review the following design decisions before we proceed:

> [!IMPORTANT]
> **Open Question 1**: Do you approve of **Option A** (adding the optional `paper` field to the `Subject` model)? If so, we will run `npx prisma db push` to update the schema. If you prefer **Option B** (no schema changes, prefixing subject titles), please let us know.
>
> **Open Question 2**: Is the MVP batch size (5 subjects, 1 topic each, 5 MCQs per topic) suitable, or would you like to include more topics in the first seed run?
