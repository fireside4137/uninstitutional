# UKPSC Content Engine — MVP Seed Report

**Date:** 2026-06-09  
**Target Exam:** UKPSC Combined State Civil / Upper Subordinate Services (Preliminary Examination)  
**Phase:** Content Engine — Stage 1 & 2 (Taxonomy + Small Seed Batch)  
**Status:** ✅ COMPLETE

---

## 1. Schema Changes

### `Subject` model — new optional field

```prisma
paper  String?   // e.g. "PAPER_1" or "PAPER_2"
```

- **Additive only** — no existing fields were removed or renamed.
- Migration method: `prisma db push` (no destructive migration file generated).
- `prisma generate` was re-run to regenerate the Prisma Client.

---

## 2. Seed Script

**File:** `prisma/seed-ukpsc-mvp.ts`  
**Runner:** `ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-ukpsc-mvp.ts`

### Idempotency Strategy
- All records identified by stable `slug` / `code` fields (defined as `@unique` in schema).
- Uses `upsert` with `where: { slug }` — safe to re-run without duplicating data.
- No `deleteMany` calls anywhere in the script.

---

## 3. Seeded Records

### Exam
| Field | Value |
|-------|-------|
| ID (stable UUID) | `fac0cea0-c70f-4b36-89f9-10058c4c8074` |
| Name | UKPSC Combined State Civil Services |
| Name (Hindi) | उत्तराखंड लोक सेवा आयोग संयुक्त राज्य सिविल सेवा |
| Slug | `ukpsc-civil-services` |

### Subjects (5 MVP subjects)

| # | Slug | Name (EN) | Name (HI) | Paper |
|---|------|-----------|-----------|-------|
| 1 | `ukpsc-uttarakhand-gk` | Uttarakhand Specific Knowledge | उत्तराखंड विशिष्ट ज्ञान | PAPER_1 |
| 2 | `ukpsc-geography` | Geography | भूगोल | PAPER_1 |
| 3 | `ukpsc-indian-polity` | Indian Polity and Governance | भारतीय राज्यव्यवस्था एवं शासन | PAPER_1 |
| 4 | `ukpsc-current-affairs` | Current Affairs | समसामयिक घटनाएं | PAPER_1 |
| 5 | `ukpsc-hindi-language` | Hindi Language (Basic) | हिन्दी भाषा (मूलभूत) | PAPER_1 |

### Topics (1 per subject = 5 total)

| Subject | Topic Slug | Topic Name (EN) |
|---------|-----------|-----------------|
| Uttarakhand GK | `ukpsc-uk-history` | History of Uttarakhand |
| Geography | `ukpsc-geo-physical` | Physical Geography of India |
| Indian Polity | `ukpsc-polity-constitution` | Indian Constitution — Basics |
| Current Affairs | `ukpsc-ca-national` | National Current Affairs |
| Hindi Language | `ukpsc-hindi-grammar` | Hindi Grammar Fundamentals |

Each topic includes:
- Bilingual name (EN + HI)
- Bilingual short notes (EN + HI)
- Difficulty: `EASY`

### MCQs (5 per topic = 25 total)

Each question includes:
- Bilingual question text (EN + HI)
- 4 bilingual options (EN + HI)
- Correct answer index
- Bilingual explanation (EN + HI)
- Difficulty: `EASY`

All 25 questions are beginner-friendly, suitable for UKPSC Prelims Stage 1 preparation.

---

## 4. Verification Results

### Seed Output
```
🌱 Starting UKPSC MVP database seeding...
🏆 Exam UKPSC upserted. ID: fac0cea0-c70f-4b36-89f9-10058c4c8074
📚 Upserted 5 MVP Subjects.
📝 Upserted 5 MVP Topics.
❓ Upserted 25 MVP Questions.
🎉 UKPSC MVP seeding completed successfully!
```

### Build Output (`npm run build`)
```
▲ Next.js 16.2.4 (Turbopack)
✓ Compiled successfully in 8.5s
✓ TypeScript — no errors
✓ Generating static pages using 7 workers (33/33) in 709ms
```

All 33 routes verified (static + dynamic). Full route table:

| Route | Type |
|-------|------|
| `/` | Static |
| `/auth/login`, `/auth/register` | Static |
| `/dashboard` | Static |
| `/dashboard/admin` | Static |
| `/dashboard/quiz` | Static |
| `/dashboard/progress` | Static |
| `/dashboard/rewards` | Static |
| `/dashboard/tasks` | Static |
| `/dashboard/bookmarks` (answer-keys, pyqs, resources) | Static |
| `/dashboard/current-affairs` | Static |
| `/dashboard/exams` | Static |
| `/dashboard/notifications` | Static |
| `/privacy` | Static |
| All `/api/*` routes | Dynamic (server-rendered) |

### Lint Output (`npm run lint`)
```
✓ ESLint — 0 errors, 0 warnings
```

---

## 5. Safety Guarantees

| Concern | Status |
|---------|--------|
| User progress data | ✅ Untouched |
| Quiz attempts | ✅ Untouched |
| Rewards / XP | ✅ Untouched |
| Bookmarks | ✅ Untouched |
| Security logs | ✅ Untouched |
| Privacy / GDPR data | ✅ Untouched |
| RLS policies | ✅ Untouched |
| Authentication | ✅ Untouched |
| Premium subscriptions | ✅ Untouched |
| Existing schema fields | ✅ Untouched (additive only) |

---

## 6. What Was NOT Seeded (Intentional)

Per the implementation plan, the following were **deliberately deferred** to Stage 3+:

- Full UKPSC syllabus (all 30+ subjects)
- Paper II subjects (CSAT)
- PYQ question bank
- Heavy notes / PDFs
- Current Affairs archives
- Hundreds of MCQs per topic
- Full Uttarakhand GK subtopic tree

---

## 7. Next Steps (Stage 3)

1. **Test quiz flow in browser** — navigate to `/dashboard/quiz`, select UKPSC exam/subject/topic, attempt the 5 seeded MCQs.
2. **Verify progress tracking** — check that quiz attempts are recorded for a test user.
3. **Admin verification** — log in as admin and confirm subjects/topics appear in admin panel.
4. **Expand content incrementally** — add 1 more topic per subject at a time, with 5 MCQs each, re-running the idempotent seed script.
5. **After 3 topics/subject verified** — proceed to seed remaining subjects from the UKPSC_PRELIMS_MASTER_LEARNING_SKELETON.

---

*This report was generated automatically after successful MVP seed execution on 2026-06-09.*
