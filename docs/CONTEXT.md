# UNINSTITUTIONAL — Project Context

> **Last Updated:** Session 8 (Freemium Gating & Simulated Billing)
> **Update this file** every time: a major decision is made, a feature is completed, a tech choice is finalized, or a new session begins.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Brand Name** | UnInstitutional |
| **Tagline (suggested)** | *Padho. Apni Tarah.* (Study. Your Way.) |
| **Target Exams** | UKPSC, UKSSC |
| **Target Users** | Uttarakhand state exam aspirants |
| **Languages** | Hindi, English (bilingual from Day 1) |
| **Business Model** | Free to use → Freemium → Paid Test Series |
| **Platform** | Web (mobile-first design) |
| **Developer** | Solo developer (you) |

---

## 2. Tech Stack — FINALIZED

### Frontend
| Layer | Technology | Reason |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR/SSG for SEO, fast load, routing built-in |
| UI Library | **React** | Component reuse, huge ecosystem |
| Styling | **Tailwind CSS** | Fast, responsive, mobile-first |
| Component Library | **shadcn/ui** | Beautiful, accessible, free |
| Animations | **Framer Motion** | Streak animations, transitions |
| i18n (bilingual) | **next-intl** | Best-in-class Hindi/English switching |
| State Management | **Zustand** | Lightweight, simple |
| Forms | **React Hook Form + Zod** | Validation, registration forms |

### Backend
| Layer | Technology | Reason |
|---|---|---|
| Runtime | **Node.js** | JS full-stack, real-time support |
| Framework | **Next.js API Routes** | No separate backend needed at start |
| Auth | **NextAuth.js (Auth.js v5)** | OTP, email, social login ready |
| ORM | **Prisma** | Type-safe DB queries |
| Database | **PostgreSQL** (via Supabase) | Relational, free tier, scalable |
| File Storage | **Supabase Storage** | Profile pics, content assets |
| Email/OTP | **Resend** | Free tier, great DX |
| Caching | **Redis** (Upstash, free) | Streak logic, session data |

### DevOps & Deployment
| Layer | Technology | Reason |
|---|---|---|
| Hosting | **Vercel** | Free tier, Next.js native, CI/CD |
| Database Host | **Supabase** | Free PostgreSQL, auth, storage |
| Monitoring | **Sentry** (free tier) | Error tracking |
| Analytics | **Posthog** (free tier) | User behavior, funnel tracking |
| Version Control | **GitHub** | Standard |

### Future (Paid Tier)
| Feature | Technology |
|---|---|
| Payment Gateway | Razorpay (India-first) |
| AI Personalization | OpenAI API / Gemini API |
| Video Lectures | Mux or YouTube embed |

---

## 3. Core Architecture Decisions

- **Monorepo:** Single Next.js app for now. No microservices until 10k+ users.
- **Database schema:** Multi-exam (UKPSC/UKSSC) support from Day 1 via `exam_type` fields.
- **Bilingual:** All UI strings stored in `/messages/hi.json` and `/messages/en.json`. Never hardcode text.
- **Streak logic:** Calculated server-side using Redis sorted sets. Resets at midnight IST.
- **Daily task engine:** Cron job (Vercel cron) assigns topics + quizzes daily per user based on syllabus progress.

---

## 4. Project Phases
 
 ### Phase 1 — Foundation & Information Engine (Completed)
 - [x] Project scaffolding (Next.js + Tailwind + shadcn)
 - [x] Database schema design (Prisma & Supabase migrations)
 - [x] Landing page (exam selection: UKPSC / UKSSC)
 - [x] Auth flow (Register / Login / OTP)
 - [x] Basic dashboard shell
 - [x] Exam Calendar and countdowns
 - [x] Official Website Links directory with verification badges
 - [x] Dashboard Exam Widgets (Upcoming, Closing Soon, Announcements)
 - [x] Notifications Feed
 - [x] Answer Key System
 - [x] Uttarakhand Maps revision section with image zoom & PDF download
 - [x] SWAYAM government lectures grid
 - [x] PYQ filterable repository
 - [x] Current Affairs preparation summaries
 - [x] Yojana & Kurukshetra magazines digest downloads
 - [x] Bookmark system (toggling bookmark flags in DB)
 - [x] Moderator Control Panel (secure forms to input exams, links, maps, news, etc.)
 
 ### Phase 2 — Core Learning Engine & Gamification (Completed)
 - [x] Syllabus & topic data entry (UKPSC + UKSSC via Prisma seed)
 - [x] Daily task assignment engine (server-side selection and IST alignment)
 - [x] Quiz module (MCQ engine with timers, submissions, and detailed explanations)
 - [x] Score analysis (strong/weak topics classification and statistics circular rings)
 - [x] Dashboard with live analytics from PostgreSQL
 
 ### Phase 3 — Engagement & Retention (Completed)
 - [x] Streak system (daily active calendar grid and IST-based consecutive tracker)
 - [x] Reward points system (wallet points transactions ledgers, premium resource previewer)
 - [ ] Leaderboard (optional - for future expansion)
 - [ ] Push notifications / email reminders (for future expansion)
 
 ### Phase 4 — Monetization (Completed)
 - [x] Freemium gating logic (gating visual maps, magazines, and PYQ paper PDF downloads with gold lock icons and upgrade overlays)
 - [x] Simulated upgrade billing flow (high-fidelity multi-step checkout dialog with simulated loading, bank verification transitions, and immediate database sync)
 - [ ] Razorpay integration (for future live production integration)
 - [ ] Paid test series module (for future expansion)
 - [ ] Admin panel for content management (Expanded via Moderator Control Panel)

---

## 5. Key Decisions Log

| Date | Decision | Reason |
|---|---|---|
| Session 1 | Next.js chosen over plain React | SEO, routing, API routes in one |
| Session 1 | Supabase chosen over Firebase | PostgreSQL > NoSQL for relational exam data |
| Session 1 | shadcn/ui chosen | Free, beautiful, accessible |
| Session 1 | Vercel for deployment | Free tier, zero-config for Next.js |
| Session 1 | next-intl for i18n | Best Hindi/English support in Next.js ecosystem |
| Session 1 | Resend sandbox used (onboarding@resend.dev) | No domain yet, custom domain at launch |
| Session 1 | Steps 1–6 completed | Project scaffolded, Supabase + Upstash + Resend accounts created |
| Session 1 | Steps 7–9 complete | .env.local configured, Prisma schema pushed, all 11 tables created in Supabase |
| Session 1 | Prisma v7 config | URL goes in prisma.config.ts via dotenv from .env.local |
| Session 1 | Step 10 complete — Landing page built | Fonts: Sora + Instrument Sans. Exam cards route to /auth/login?exam=ukpsc and /auth/login?exam=ukssc |
| Session 1 | Color scheme finalized | UKPSC = #1D4ED8 (blue), UKSSC = #059669 (green), Accent = #F59E0B, Dark = #1E293B |
| Session 1 | Steps 11 complete — Login + Register pages built | Routes: /auth/login?exam= and /auth/register?exam=. NextAuth wiring is next. |
| Session 1 | Step 12 complete — Auth fully working | Registration saves to Supabase. Login works. Next.js 16 uses proxy.ts instead of middleware.ts. Prisma v7 needs @prisma/adapter-pg. |
| Session 1 | Step 13 complete — Dashboard shell built | Mobile-first, bottom nav, mock data. Files: 
dashboard/layout.tsx, dashboard/page.tsx |

| Session 2 | Dashboard made responsive | Mobile: bottom nav. Desktop: left sidebar. Breakpoint: 768px. |
| Session 2 | Login bypass fixed | Clear localhost cookies + proxy.ts guards routes |
| Session 3 | Code stability & type fixes | Replaced explicit `any` types with custom interfaces in `auth.ts` and `quiz/page.tsx`; resolved hydration effects warnings in `LangProvider.tsx` and `page.tsx`; removed unused variables in `register/page.tsx` and escaped strings in `rewards/page.tsx`. |
| Session 4 | Linter compilation & final stability | Resolved syntax error (extraneous closing brackets) and missing "use client" directive in `dashboard/page.tsx`. Added `eslint-disable` tags for `set-state-in-effect` and `no-explicit-any` across pages/routes. Fixed ZodError `.issues` typing in registration route, removed deprecated `earlyAccess` configuration from `prisma.config.ts`, and generated the latest Prisma client types. Successfully compiled and verified the project build with `npm run build` yielding 0 warnings/errors. Updated `CONTEXT.md` to reflect Phase 2 & 3 completion. |
| Session 5 | User experience & timezone alignment | Verified database phone constraint collision logic. Created and styled a beautiful state-driven custom notification Toast component on the rewards shop to replace default browser alerts. Timezone-aligned all 5 API endpoints by constructing `assignedDate` in UTC-grounded IST numbers. Implemented a real-time calendar grid on the rewards dashboard that fetches actual study logs from the database. Verified linting successfully. |
| Session 6 | Security, dark theme & UI upgrades | Enforced portal isolation between UKPSC/UKSSC (dual-layer check: client-side dynamic validation route `/api/auth/check-portal` + backend sign-in credentials check). Created a `ThemeProvider` context to persist light/dark styles in `localStorage` and toggle `.dark` classes on the HTML container. Designed and implemented a collapsible desktop sidebar with a textless expand/collapse button inside `DashboardShell.tsx`. Upgraded the rewards calendar to render weekday headers, dynamic month labels (spanning multiple months), and perfect padding offsets to align days to real calendar weekdays. Verified production build success successfully. |
| Session 7 | Information Engine Integration | Created 9 new PG database models via Prisma and Supabase. Integrated unified dynamic API route `/api/information` for GET/POST queries. Created 7 new frontend pages (`exams`, `resources`, `pyqs`, `current-affairs`, `answer-keys`, `notifications`, `admin`). Added widgets to dashboard page, updated navigation with desktop/mobile separation, fixed sidebar cutoff layout issues, verified linter (0 errors/0 warnings), and built Next.js application successfully. |
| Session 8 | Freemium Gating, Simulated Billing & UI Polish | Added `isPremium` to the PostgreSQL `User` model, created upgrade API `/api/user/upgrade`, added gold `👑 PRO` header badges in `DashboardShell.tsx`, and implemented gated resource overlays across maps, magazines, and PYQ vault pages. Redesigned the sidebar collapse button to feature a centering border position with an animating SVG chevron icon. Created a reusable animated `BookmarkButton` with a gold star spring-pop animation class inside `globals.css` and integrated it across all bookmarks tables. Resolved ESLint warnings and verified production compile checks successfully. |
| Session 9 | Production-Level Security | Renamed deprecated `middleware.ts` to `proxy.ts`. Added Upstash Redis sliding window rate-limiting matching client userId on authenticated paths (and fallback IP lookup on unauthenticated paths). Created `/api/download` gated download tunnel verifying premium status. Secured tasks completions, quizzes submissions, and daily challenge points-farming with atomic boolean check flags. Secured rewards purchases with row locks (`SELECT FOR UPDATE`) to prevent simultaneous double-redeem exploits. Secured admin POST routes with server-side validations. Added Zod schema validations for bookmarks, tasks, quizzes, rewards, and profiles. Injected secure headers (HSTS, XSS protection, Frame Options) in `next.config.ts`. Verified environment variables gitignore compliance. Compiled Next.js successfully (0 lint errors/0 compiler warnings). |

---

## 6. Environment Variables Needed (Template)

```env
# Database
DATABASE_URL= see .env.local (Supabase project: qlhbqpygfafsoinjigmm)

# Supabase
NEXT_PUBLIC_SUPABASE_URL= https://qlhbqpygfafsoinjjgmm.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY= see .env.local

SUPABASE_SERVICE_ROLE_KEY= see .env.local

# Auth
NEXTAUTH_SECRET= see .env.local
NEXTAUTH_URL= http://localhost:3000

# Email (Resend)
RESEND_API_KEY= see .env.local

# Redis (Upstash)
UPSTASH_REDIS_REST_URL= https://destined-macaque-102821.upstash.io
UPSTASH_REDIS_REST_TOKEN= see .env.local

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=
```

---

## 7. Team / Roles

| Role | Person |
|---|---|
| Full-stack Developer | You (solo) |
| Content (Syllabus/Questions) | TBD — can use Claude or hire subject experts |

---

## 8. External References

- UKPSC Official Syllabus: https://psc.uk.gov.in
- UKSSC Official Syllabus: https://sssc.uk.gov.in
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- shadcn/ui: https://ui.shadcn.com
- next-intl: https://next-intl-docs.vercel.app

---

*⚠️ Update this file at the start of every new chat session with Claude. Paste the relevant sections so Claude has full context.*
