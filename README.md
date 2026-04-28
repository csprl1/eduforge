# EduForge — AI-Powered Learning Management System


[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![Groq AI](https://img.shields.io/badge/Groq-Llama3-orange)](https://groq.com)

---

## 🚀 Live Demo

**[https://eduforge.vercel.app](https://eduforge.vercel.app)** ← Replace with your deployment URL

### Demo Credentials

| Role       | Email                        | Password         |
|------------|------------------------------|------------------|
| Student    | student@eduforge.dev         | Student@123      |
| Instructor | instructor@eduforge.dev      | Instructor@123   |
| Admin      | admin@eduforge.dev           | Admin@123        |

---

## 🧠 What is EduForge?

EduForge is a production-grade **AI-powered Learning Management System** (LMS) that goes far beyond basic CRUD. It solves a real edtech problem: learners need more than static content — they need **interactive testing and rapid comprehension tools**. EduForge delivers this through Groq-powered AI that generates contextually accurate quizzes and lesson summaries from actual course content.

### Why this matters:
- AI quiz generation → eliminates hours of manual question writing for instructors
- Instant summaries → helps students absorb lessons faster
- Role-based multi-tenancy → students, instructors, and admins all have tailored experiences
- Built on Next.js 15 App Router → maximum SSR/SSG performance, SEO-ready

---

## ✨ Features

### Core LMS
- **Course Management** — Create, read, update, delete courses with rich metadata (category, level, tags, price)
- **Lesson Builder** — Markdown-powered lesson editor with video embed support
- **Enrollment System** — One-click enrollment with progress tracking
- **Progress Tracking** — Per-course percentage progress with visual indicators

### AI Features (Groq / Llama 3.1)
- **AI Quiz Generator** — Generates 5 MCQs from lesson content with explanations
- **AI Lesson Summarizer** — Produces key takeaways and TL;DR from any lesson
- **Graceful fallback** — Works in demo mode without an API key

### Auth & Authorization
- **Credential auth** — bcrypt-hashed passwords, Zod-validated inputs
- **OAuth ready** — Google & GitHub providers (add credentials to enable)
- **JWT sessions** — Stateless, scalable
- **Role-based access** — STUDENT / INSTRUCTOR / ADMIN with middleware enforcement
- **Route protection** — middleware.ts guards all sensitive routes

### Admin Panel
- User management with role promotion/demotion
- Platform-wide analytics (users, courses, enrollments)
- Course oversight with quick edit/view links

---

## 🏗️ Architecture

```
eduforge/
├── app/
│   ├── (auth)/login|register/     # Public auth pages
│   ├── (dashboard)/               # Protected layout
│   │   ├── dashboard/             # Main dashboard (SSR)
│   │   ├── courses/               # Course catalog + detail + editor
│   │   │   └── [id]/lesson/[lessonId]/  # Lesson viewer + AI tools
│   │   ├── profile/               # User profile
│   │   └── admin/                 # Admin panel
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   ├── courses/               # Course CRUD + enroll
│   │   ├── lessons/               # Lesson CRUD
│   │   ├── enrollments/           # Enrollment queries
│   │   ├── users/                 # Register + profile update
│   │   ├── admin/                 # Admin-only actions
│   │   └── ai/generate-quiz|summarize/  # Groq AI endpoints
│   └── page.tsx                   # Landing page
├── components/
│   ├── ui/                        # Design system primitives
│   ├── courses/                   # Course cards, forms, lesson viewer
│   ├── ai/                        # AI quiz + summary panels
│   ├── admin/                     # Admin action components
│   ├── dashboard/                 # Profile edit form
│   └── layout/                    # Navbar, Footer
├── lib/
│   ├── auth.ts                    # NextAuth config
│   ├── db.ts                      # Prisma singleton
│   ├── utils.ts                   # Helpers + constants
│   └── validations.ts             # Zod schemas
├── prisma/
│   ├── schema.prisma              # Full data model
│   └── seed.ts                    # Demo data seeder
└── middleware.ts                  # Route protection
```

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Next.js 15 (App Router, TypeScript) |
| Database     | PostgreSQL via Neon / Railway       |
| ORM          | Prisma 6                            |
| Auth         | NextAuth.js v4 (JWT + Credentials)  |
| Styling      | Tailwind CSS 3 + Radix UI           |
| AI           | Groq API (Llama 3.1-8b-instant)     |
| Validation   | Zod                                 |
| Deployment   | Vercel                              |

---

## 🔐 Security

- Passwords hashed with **bcrypt** (12 rounds)
- **Zod validation** on all API inputs (prevents injection)
- **Middleware-enforced** route guards (not just client-side)
- **CSRF protection** via NextAuth
- **Authorization checks** on every mutation (owner/admin only)
- Environment secrets never exposed to client

---

## ⚡ Performance

- **Server Components** for all data-fetching pages (zero client JS for static content)
- **Parallel data fetching** with `Promise.all` across dashboard queries
- **Prisma select** — only fetch fields needed (no over-fetching)
- **next/font** — Google Fonts loaded at build time, zero CLS
- **Streaming** — Next.js suspense-ready architecture
- **Image optimization** via `next/image`

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/eduforge
cd eduforge
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in:
```env
DATABASE_URL="postgresql://user:password@host:5432/eduforge"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
GROQ_API_KEY="your-key-from-console.groq.com"   # Free tier available
```

### 3. Database Setup

```bash
# Push schema (development)
npm run db:push

# Or run migrations (production)
npm run db:migrate

# Seed demo data
npm run db:seed
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

### 5. Deploy to Vercel

```bash
npm i -g vercel
vercel
# Add environment variables in Vercel dashboard
```

**Recommended DB providers:**
- [Neon](https://neon.tech) — Serverless PostgreSQL, free tier
- [Supabase](https://supabase.com) — PostgreSQL with extras

---

## 📊 Data Model

```
User ─── Course (instructor creates many)
     ─── Enrollment (student enrolls in many)
     ─── QuizAttempt
     └── Review

Course ─── Lesson (ordered)
       ─── Quiz (AI-generated)
       ─── Enrollment
       └── Review

Lesson ─── LessonProgress
       └── Quiz
```

---

## 🎯 API Reference

| Method | Endpoint                          | Auth          | Description              |
|--------|-----------------------------------|---------------|--------------------------|
| GET    | `/api/courses`                    | Public        | List courses (filterable)|
| POST   | `/api/courses`                    | Instructor+   | Create course            |
| GET    | `/api/courses/:id`                | Public        | Get course details       |
| PATCH  | `/api/courses/:id`                | Owner/Admin   | Update course            |
| DELETE | `/api/courses/:id`                | Owner/Admin   | Delete course            |
| POST   | `/api/courses/:id/enroll`         | Student       | Enroll in course         |
| POST   | `/api/lessons`                    | Instructor+   | Create lesson            |
| PATCH  | `/api/lessons/:id`                | Owner/Admin   | Update lesson            |
| DELETE | `/api/lessons/:id`                | Owner/Admin   | Delete lesson            |
| POST   | `/api/ai/generate-quiz`           | Any auth      | Generate AI quiz         |
| POST   | `/api/ai/summarize`               | Any auth      | Generate AI summary      |
| POST   | `/api/users/register`             | Public        | Register new user        |
| PATCH  | `/api/users/:id`                  | Self/Admin    | Update profile           |
| PATCH  | `/api/admin/users/:id/role`       | Admin only    | Change user role         |

---

## 👤 Author

**Prathamesh Ugale**
- GitHub: [@csprl1](https://github.com/csprl1)
- LinkedIn: [linkedin.com/in/prathamesh-ugale-1aa536138](https://www.linkedin.com/in/prathamesh-ugale-1aa536138)
---

## 📄 License

MIT — built for the House of Edtech Fullstack Assignment, Jan 2026.
