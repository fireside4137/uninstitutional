# Admin Resource Management & Map Zoom Implementation Report

This report documents the architectural, security, and interface changes implemented in the **Admin Resource Management** and **Map Zoom** components on the `checkpoint-2-Demo` branch.

---

## 1. Summary of Changes

All changes prioritize demo stability, admin usability, and code safety without refactoring unrelated systems or weakening security/streaks/streaks/RTL/quiz scoring models.

### A. Database Schema
- **Status Field**: Added `status String @default("PUBLISHED")` to resource models: `OfficialLink`, `Notification`, `AnswerKey`, `MapResource`, `GovtLearningLink`, `PYQPaper`, `CurrentAffairsEvent`, and `MagazineResource`.
- **Image Nullability**: Enabled `imageUrl String? @db.Text` in `MapResource` to accommodate PDF-only or pending maps.
- **Audit Logs**: Updated `SecurityEventType` with `ADMIN_CONTENT_CREATED`, `ADMIN_CONTENT_EDITED`, `ADMIN_CONTENT_DELETED`, `ADMIN_USER_PROMOTED`, `ADMIN_USER_DEMOTED`, and `ADMIN_USER_CREATED`.

### B. Backend API Routes
1. **Information API Route (`/api/information`)**:
   - **Validation**: Added Zod refine schema constraints for `MapResource` enforcing that published maps must have either a high-resolution `imageUrl` or a downloadable `pdfUrl`, while draft/pending/unpublished maps can save without either.
   - **GET**: Admins using the `?admin=true` query parameter can see all resources (including drafts), while students only see `status === 'PUBLISHED'`.
   - **PUT**: Fully implements server-side resource editing with Zod validations.
   - **DELETE**: Programmatically cleans up associated student `Bookmark` records using loose-coupling lookups before deleting the parent resource to avoid database constraint conflicts.
   - **Audit Event Logging**: Emits granular security events for all creation, updates, and deletions.

2. **Admin Users API Route (`/api/admin/users`)**:
   - **GET**: Lists users (excluding passwords/hashes) showing `name`, `email`, `role`, `examType`, `isPremium`, and `createdAt`.
   - **POST - PROMOTE/DEMOTE**: Promotes or demotes roles safely. Features server-side checking to prevent an admin from demoting themselves.
   - **POST - CREATE_ADMIN**: Safely creates new, pre-verified administrative accounts with standard streak/reward relations.
   - **Audit Event Logging**: Emits `ADMIN_USER_PROMOTED`, `ADMIN_USER_DEMOTED`, and `ADMIN_USER_CREATED` logs.

### C. Frontend Interface
1. **Resources Hub Page (`src/app/dashboard/resources/page.tsx`)**:
   - **Zoom Lightbox Modal**: Clicking "View Large" opens a custom full-screen lightbox with a floating control panel. Supports zoom scale (+, -, Reset/Fit to Screen) and an "Open Original Image" link.
   - **Fallback Image Rendering**: Implements image load error handling (`onError`) in both cards and modals, replacing broken/missing URLs with the fallback SVG `/resources/maps/placeholder.svg`.

2. **Moderator Control Panel (`src/app/dashboard/admin/page.tsx`)**:
   - **Top Level Navigation Tabs**: Clean switcher between "Upload Resource", "Manage Content", and "User Management".
   - **Manage Content**: List all resources by type, with inline status toggle ("Publish" / "Hide"), Edit Resource Modal (populates fields, formats dates, validates, and updates), and Delete confirmation dialog.
   - **User Management**: Renders responsive lists of users with role toggling. Prevents logged-in admin from demoting themselves. Integrates a dedicated Create Admin form.

---

## 2. Verification & Testing

### A. Automatic Builds & Code Quality
- **Linter Verification**: Executed `npm run lint`. The command succeeded with zero ESLint compile warnings or errors.
- **Production Build Validation**: Executed `npm run build`. The build completed successfully:
  - TypeScript types validated in `17.8s`.
  - Next.js static and dynamic routes compiled successfully.

### B. Security & Audit Logging
All admin mutations were verified to trigger warnings in console logs and successfully insert rows in the `security_logs` database table. The metadata payloads were properly sanitized to automatically redact passwords/hashes.

### C. Troubleshooting Prisma Client Cache (Unknown argument status)

- **Root Cause**:
  Hot reloading in the Next.js development server keeps the `globalThis.prisma` object in memory to prevent establishing multiple database connection pools during file changes. While running `npx prisma db push` and `npx prisma generate` successfully synchronized the database and generated updated typings under `node_modules/@prisma/client`, the active dev server memory cache still held the old PrismaClient instance instantiated before the generator ran. This caused the Prisma engine to throw `Unknown argument status` because the active client instance did not have the new schema attributes loaded.
- **Resolution**:
  1. Synchronized database schema with the model definitions:
     ```bash
     npx prisma db push
     ```
  2. Regenerated local Prisma Client:
     ```bash
     npx prisma generate
     ```
  3. Completely stopped and restarted the Next.js development server:
     ```bash
     npm run dev
     ```
- **Map Publish/Edit Test Result**:
  Successfully validated that creating, editing, toggling publication status (publishing/hiding), and deleting MapResources works properly. Map validation correctly enforces that published maps contain at least a high-resolution image URL or a PDF URL, while drafts save safely without either.
- **Lint/Build Verification**:
  Verified with static build compilations. All TypeScript checks and pages build successfully.
