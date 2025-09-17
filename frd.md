### Functional Requirements Document (FRD) — Investment Exams Platform

Reference: Inspired by [`https://css-questions.com/`](https://css-questions.com/). Exam-only; no teaching or hints.

## 1. Overview
- **Purpose**: An exam platform for investment topics (stocks, bonds, funds, order types, risk, financial statements).
- **Access model**: Authenticated only; all features free.
- **Format**: Categories → Sessions → Ordered single-choice questions (A–D).
- **Exam policy**: Max 2 attempts per question; 10 points per correct; no penalty; highest per question counts.
- **Gamification**: Leaderboards (all-time, weekly, monthly; ties allowed) and badges.
- **Admin**: Content imported via CSV; badges defined dynamically; publish/unpublish controls.

## 2. Goals and Non-Goals
- **Goals**
  - Deliver exam-style assessments with strict rules and zero teaching.
  - Track and display user progress and scores.
  - Provide competitive leaderboards and badge achievements.
  - Simple admin imports and badge management.
- **Non-Goals**
  - No lessons, hints, or coaching content.
  - No social feeds, comments, or forums.
  - No payments or premium tiers.

## 3. Users & Roles
- **End User**: Takes exams, views scores, competes on leaderboards, earns badges.
- **Admin**: Manages categories, sessions, questions via CSV; manages badges; toggles publish state.

## 4. Platform & Constraints
- **Tech**: Next.js (App Router, RSC), TailwindCSS, shadcn/ui, NextAuth (Credentials + Google), MongoDB Atlas, Vercel.
- **Email**: For password reset and notifications (provider TBD: Resend/SendGrid).
- **Scale target**: ~100 users (initial).
- **Images**: Cloudinary planned; can be deferred.
- **SEO**: None (auth-only).

## 5. Core Functional Requirements

### 5.1 Authentication & Accounts
- Email/password and Google sign-in via NextAuth.
- Usernames:
  - Required, lowercase, unique, immutable.
  - Validated on registration; reserved words blocked (admin-configurable).
- No email verification.
- Password reset via email token (expire ≤ 60 minutes).
- Sessions via secure httpOnly cookies.

### 5.2 Navigation & App Shell
- Auth gate wraps all pages.
- Sidebar lists categories and their sessions (ordered, published only).
- Main content area shows selected session’s questions.
- HUD showing session score and total score.

### 5.3 Categories & Sessions
- Categories: title, description, order, published.
- Sessions: title, description, category, order, published, optional prerequisite-session flag.
- All sessions accessible by default; prerequisite enforcement can be toggled per session.

### 5.4 Questions (Single-Choice)
- Each question has: prompt, optional image URL, four options A–D, and a single correctKey.
- Fixed points = 10 per correct answer.
- Questions are displayed without revealing the correct key.
- Optional admin toggle to include explanation text post-result (default off).

### 5.5 Exam Flow & Attempts
- For each question:
  - Display options; user selects one and submits.
  - System validates remaining attempts (1–2).
  - Return result: correct/incorrect, pointsAwarded (0 or 10), attemptIndex.
  - If explanation enabled, include it only after submission.
- Max two attempts per question; highest per question contributes to session score.

### 5.6 Scoring & Progress
- Session score: sum of best-per-question within that session.
- Total score: sum of session scores across all sessions.
- Progress tracking:
  - Questions completed count.
  - Attempt counts per question.
  - Best-per-question map and timestamps.
- Users can revisit sessions; progress updates on each attempt.

### 5.7 Leaderboards
- Scopes: all-time, weekly, monthly.
- Weekly = ISO week (Mon–Sun, UTC). Monthly = UTC calendar month.
- Ranking by score; ties share the same rank (next rank is skipped accordingly).
- Views: tabbed interface for scopes; max 100 entries per view.

### 5.8 Badges
- Dynamic badge definitions (admin-defined):
  - Types: complete_question, complete_session, score_threshold.
  - Criteria values: questionId/sessionId/minScore as applicable.
  - Badge metadata: key, name, description, icon, enabled.
- Awarding:
  - Evaluated after attempts/progress updates.
  - Record award events; prevent duplicate awards.
- Notifications:
  - In-app toast on unlock.
  - Optional email notification per user settings.

### 5.9 Notifications
- In-app toasts for:
  - Correct/incorrect submission (concise).
  - Badge awarded.
- Emails for:
  - Password reset.
  - Badge awarded (if enabled by user).
- Email opt-in flags per user.

### 5.10 Admin Functions
- CSV imports:
  - Files: categories.csv, sessions.csv, questions.csv.
  - Dry-run validation with error reporting.
  - Transactional apply; audit log with summary.
  - Upsert behavior for categories/sessions by slug; replace questions per session by `sessionSlug+order`.
- Badges management: CRUD, enable/disable.
- Publish/unpublish sessions; reorder questions via UI (drag-and-drop).
- Leaderboard recompute on-demand.
- Export:
  - Content and user progress as CSV/JSON (admin-only).

## 6. Data Validation Rules
- Username: lowercase alphanumeric plus underscore; 3–20 chars; unique; immutable.
- Category/session slugs: lowercase kebab-case; unique within their scope.
- Question:
  - Options A–D required; `correctKey ∈ {A,B,C,D}`.
  - Order unique within a session.
  - Image URL optional; if present must be HTTPS.
- CSV:
  - Required columns as specified; quoted fields when containing commas.
  - References (categorySlug, sessionSlug) must pre-exist (or be in same batch with proper dependency).

## 7. Non-Functional Requirements
- Performance:
  - P95 content read under 300ms (server-side) at target scale.
  - LCP under 2s on typical broadband for authenticated pages.
- Availability: ≥ 99% (Vercel + Atlas free tiers; best-effort).
- Security:
  - Password hashing with argon2id (preferred) or bcrypt.
  - Server-side input validation (Zod).
  - Role-based admin endpoints.
- Privacy & Compliance:
  - Educational exam platform; no financial advice.
  - Account delete and data export endpoints planned.
- Observability:
  - Error tracking via Sentry; basic traffic via Vercel Analytics.
- Backups:
  - Rely on Atlas snapshots; admin export supports offsite backup.

## 8. API Endpoints (High-Level)
- Auth
  - POST `/api/auth/register` { email, username, password }
  - NextAuth `/api/auth/[...nextauth]` (Credentials + Google)
  - POST `/api/auth/password/reset/request`
  - POST `/api/auth/password/reset/confirm`
- Content
  - GET `/api/categories`
  - GET `/api/sessions?category=slug`
  - GET `/api/sessions/{slug}` → session + questions (no correctKey exposed)
- Attempts & Progress
  - POST `/api/attempts` { questionId, selectedKey } → { isCorrect, pointsAwarded, attemptIndex, sessionScore, totalScore }
  - GET `/api/progress/me`
- Leaderboards
  - GET `/api/leaderboard?scope=allTime|weekly|monthly`
- Badges
  - GET `/api/badges/me`
  - POST `/api/admin/badges` (CRUD)
- Admin Imports
  - POST `/api/admin/import/{categories|sessions|questions}` (CSV multipart)
  - POST `/api/admin/sessions/{id}/publish` { published: boolean }

## 9. CSV Formats (Canonical)
- categories.csv: `slug,title,description,order,published`
- sessions.csv: `categorySlug,slug,title,description,order,published,prerequisiteSessionSlug`
- questions.csv: `sessionSlug,order,prompt,imageUrl,optionA,optionB,optionC,optionD,correctKey`

## 10. User Stories & Acceptance Criteria

- Registration (credentials)
  - As a user, I can sign up with email, password, and a lowercase unique username.
  - AC: Duplicate username rejected; session established on success.

- Login (Google or credentials)
  - As a user, I can log in and access the app shell.
  - AC: Successful login redirects to the last session viewed or dashboard.

- View sessions
  - As a user, I can browse categories and sessions in the sidebar.
  - AC: Only published sessions visible, in configured order.

- Take exam question
  - As a user, I can answer a question and immediately see correct/incorrect with attempt count.
  - AC: After two attempts, question locked; best score recorded.

- Track progress
  - As a user, I can see my session score and total score update after submissions.
  - AC: Progress persists and aggregates correctly across sessions.

- Leaderboards
  - As a user, I can see all-time, weekly, and monthly leaderboards with ties.
  - AC: Scores reflect correct aggregation windows; ties share rank.

- Badges
  - As a user, I receive a badge instantly when criteria are met.
  - AC: Duplicate awards prevented; in-app toast appears; email sent if enabled.

- Admin import
  - As an admin, I can upload CSVs, preview validation errors, and apply changes transactionally.
  - AC: On apply, entities upserted or replaced per spec; audit log recorded.

## 11. Error Handling
- Auth: invalid credentials → generic error; rate limiting can be added later.
- Attempts: exceeding attempt limit → 409/validation error.
- Imports: provide row-level error details on dry-run; reject full apply if any critical errors.
- Leaderboards: fallback to on-demand aggregation if snapshot missing.

## 12. Open Configuration Items
- Email provider: Resend or SendGrid.
- Password hashing: argon2id (recommended) vs bcrypt.
- Explanations: default off; per-session override allowed?

## 13. Milestones (High-Level)
- M1: Auth, app shell, categories/sessions read, CSV import (categories/sessions).
- M2: Questions + attempts + progress + scoring.
- M3: Leaderboards.
- M4: Badges + notifications (in-app + email).
- M5: Admin UI polish, exports, and optional explanations toggle.

- FRD defines the exam-only product closely modeled after `https://css-questions.com/`: strict single-choice assessments, progress tracking, leaderboards with ties, dynamic badges, and CSV-driven content management.