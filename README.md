# TutorFlow 🎓

> **A focused workspace for independent tutors and their students — bridging lesson preparation, live classroom execution, and AI-assisted follow-through.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![tRPC](https://img.shields.io/badge/tRPC-11.6-398ccb.svg?logo=trpc)](https://trpc.io/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-c5f74f.svg?logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791.svg?logo=postgresql)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-2.1-729b1b.svg?logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 Overview

**TutorFlow** is a modern, end-to-end web application crafted for 1-on-1 tutoring practices. It eliminates chaotic admin workflows and disjointed tools by providing tutors and students with dedicated, role-tailored dashboards, an interactive live session workspace, calendar scheduling with conflict-prevention algorithms, and integrated AI capabilities for pre-lesson planning and post-lesson reflection.

Built with an elegant editorial design language, responsive glassmorphism surfaces, and strict type safety across the entire stack.

---

## ✨ Key Features

### 👨‍🏫 For Tutors
- **Dedicated Tutor Workspace**: Live agenda of upcoming sessions, persisted student roster, active metrics, and quick scheduling.
- **Smart Scheduling & Overlap Protection**: Instant session booking with mathematical interval overlap detection preventing double bookings.
- **Weekly Availability Management**: Configure recurring weekly slots (days and start/end hours) for student booking.
- **Invite-Based Student Onboarding**: Generate secure one-time invite links with expiration dates, shareable via clipboard or the native Web Share API.
- **Interactive Session Workspace**:
  - Live autosaving session notes.
  - Sequential state machine enforcement (`scheduled` ➔ `in_progress` ➔ `completed` ➔ `ai_reviewed`).
  - Read-only note locking on session completion.
- **AI Pre-Session Planner**: Generates structured lesson blueprints (warm-up drills, core concepts, discussion prompts, practice questions) tailored to student grade level and past performance.
- **AI Post-Session Reviewer**: Synthesizes session notes into takeaways and actionable homework assignments.

### 👩‍🎓 For Students
- **Personalized Student Dashboard**: Clean timeline of upcoming sessions, lesson history, tutor summaries, and pending homework.
- **Interactive Booking Calendar**: Visual month/day view mapping the tutor’s weekly availability into bookable slots.
- **Progress & Skill Mastery Tracking**: Recharts-powered analytics displaying completed lessons, review ratios, topic mastery badges, and performance trajectories.
- **Session Materials**: Quick access to lesson materials and tailored homework sets created by their tutor.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Modern component-based UI with strict typing |
| **Routing** | [Wouter](https://github.com/molefrog/wouter) | Lightweight client-side router with nested route support |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation utility-first styling and theme variables |
| **UI Components** | [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/) | Accessible, unstyled primitives paired with consistent iconography |
| **Data Visualization** | [Recharts](https://recharts.org/) | Responsive SVG charts for learning progress and mastery trends |
| **Client State / Cache** | [TanStack React Query](https://tanstack.com/query) | Asynchronous data synchronization and query cache |
| **Fullstack API** | [tRPC v11](https://trpc.io/) | End-to-end typesafe RPC client and server |
| **Backend Server** | [Express](https://expressjs.com/) + [Node.js](https://nodejs.org/) | High-performance HTTP server handling routing and SSR bundle serving |
| **Database & ORM** | [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) | Type-safe schema definitions, migrations, and query building |
| **AI Integration** | Built-in LLM Provider via JSON Schema | Structured output generation for lesson plans and review summaries |
| **Object Storage** | S3-compatible API | Profile avatar asset storage and signed URL handling |
| **Testing** | [Vitest](https://vitest.dev/) | Unit tests for state transitions, access controls, and schedule overlaps |

---

## 🏛️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client (Browser)       │
                                  │  React 19 + Wouter + tRPC   │
                                  └──────────────┬──────────────┘
                                                 │
                                           HTTP / JSON-RPC
                                                 │
                                  ┌──────────────▼──────────────┐
                                  │       Express Server        │
                                  │       tRPC v11 Router       │
                                  └───────┬─────────────┬───────┘
                                          │             │
                    ┌─────────────────────┘             └────────────────────┐
                    │                                                        │
          ┌─────────▼─────────┐                                    ┌─────────▼─────────┐
          │    Drizzle ORM    │                                    │   AI / LLM Core   │
          │  (Postgres-JS)    │                                    │ Structured Output │
          └─────────┬─────────┘                                    └───────────────────┘
                    │
          ┌─────────▼─────────┐
          │ PostgreSQL DB     │
          │ (Supabase / Neon) │
          └───────────────────┘
```

---

## 🗄️ Database Schema

The database model is defined via Drizzle ORM in `drizzle/schema.ts` (with an equivalent SQL migration in `supabase_setup.sql`):

- **`users`**: System user records and authentication metadata (`open_id`, `role`, timestamps).
- **`tutorflow_profiles`**: Profiles for tutors and students containing contact details, avatar URLs, class/grade, school/college, and learning goals.
- **`sessions`**: Core tutoring sessions tracking:
  - Participants (`tutor_id`, `student_id`)
  - Timing (`start_time`, `end_time`)
  - State machine (`scheduled` ➔ `in_progress` ➔ `completed` ➔ `ai_reviewed`)
  - Session notes, homework, structured `ai_plan` (JSONB), and `ai_summary` (JSONB).
- **`lesson_materials`**: Per-session teaching materials authored by tutors.
- **`tutor_availability`**: Weekly recurring availability windows (`day_of_week`, `start_time`, `end_time`).
- **`invitation_links`**: Cryptographically secure single-use student invitation tokens with expiration timestamps.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **pnpm** (preferred) or **npm**
- **PostgreSQL**: Local instance or cloud database (e.g. Supabase, Neon)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/tutorflow.git
cd tutorflow
pnpm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root based on the configuration below:

```env
# Server & App Configuration
NODE_ENV=development
PORT=3000
VITE_APP_ID=tutorflow-app
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Database (PostgreSQL / Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# AI / LLM Integration (if using built-in Forge/OpenAI proxy)
BUILT_IN_FORGE_API_URL=https://api.openai.com/v1
BUILT_IN_FORGE_API_KEY=your-api-key

# Storage (S3 / Cloud Storage for avatars)
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-key-id
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### 3. Initialize Database
Execute the database schema migration either through Drizzle or Supabase:

**Via Drizzle Kit:**
```bash
pnpm db:push
```

**Via Supabase Dashboard:**
1. Open your Supabase project.
2. Navigate to **SQL Editor** ➔ **New Query**.
3. Paste and execute the contents of [`supabase_setup.sql`](./supabase_setup.sql).

### 4. Run Development Server
```bash
pnpm dev
```
The application will start with hot-reload enabled at `http://localhost:3000`.

---

## 🧪 Testing & Verification

Run the automated test suite powered by Vitest:

```bash
# Run all unit and integration tests
pnpm test

# Typecheck TypeScript definitions
pnpm check
```

### What's Tested:
- **State Transitions**: Enforces that sessions only progress linearly (`scheduled` ➔ `in_progress` ➔ `completed` ➔ `ai_reviewed`).
- **Access Boundary Controls**: Restricts tutor-specific mutations from student accounts.
- **Session Locking**: Verifies that completed and AI-reviewed sessions cannot have their live notes modified.
- **Collision Detection**: Confirms tutor scheduling interval overlaps are rejected.

---

## 📁 Project Structure

```
.
├── client/                     # Frontend application (React 19 + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── BookingCalendar.tsx    # Interactive student slot booking
│   │   │   ├── StudentProgress.tsx    # Mastery stats & Recharts visualizer
│   │   │   ├── InvitationModal.tsx    # Tutor student invite modal & share
│   │   │   ├── DashboardLayout.tsx    # Unified responsive shell
│   │   │   └── ui/                    # Radix UI + shadcn primitive wrappers
│   │   ├── pages/              # Application views & route targets
│   │   │   ├── Home.tsx               # Editorial landing page
│   │   │   ├── Login.tsx              # Authentication entry
│   │   │   ├── Signup.tsx             # Onboarding flow with profile picture
│   │   │   ├── TutorDashboard.tsx     # Tutor workspace, agenda & roster
│   │   │   ├── StudentDashboard.tsx   # Student dashboard, timeline & calendar
│   │   │   └── SessionWorkspace.tsx   # Live classroom notes & AI assistant
│   │   ├── lib/                # Client utilities & tRPC client hooks
│   │   ├── App.tsx             # Route switcher and providers
│   │   └── main.tsx            # DOM root entry point
├── drizzle/                    # Drizzle ORM schema & configuration
│   └── schema.ts               # Database tables, enums, and types
├── server/                     # Backend application (Express + tRPC)
│   ├── _core/                  # Core runtime (cookies, auth, env, LLM connector)
│   ├── db.ts                   # Data access layer & query helpers
│   ├── routers.ts              # tRPC procedures (sessions, profile, progress, etc.)
│   ├── storage.ts              # S3 / file upload handler
│   ├── tutorflow.rules.test.ts # Vitest suite for domain logic & transitions
│   └── tutorflow.access.test.ts# Vitest suite for authorization checks
├── supabase_setup.sql          # Standalone SQL schema for Supabase
├── package.json                # Dependencies and script definitions
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite build and dev server config
```

---

## 📜 Available Scripts

- `pnpm dev`: Starts the development server using `tsx watch` for server-side reloading and Vite for client HMR.
- `pnpm build`: Builds the production Vite bundle and bundles the Express server with `esbuild`.
- `pnpm start`: Runs the built production server from `dist/index.js`.
- `pnpm test`: Runs test suites with `vitest run`.
- `pnpm check`: Runs type-checking using `tsc --noEmit`.
- `pnpm format`: Formats codebase using Prettier.
- `pnpm db:push`: Generates and applies Drizzle schema changes to the database.

---

## 🛡️ License

This project is open source and available under the [MIT License](LICENSE).
