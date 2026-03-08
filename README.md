# 1% Journal — Next.js App

A minimalist black-and-white journaling app with a 3D notebook past entries view, Supabase persistence, and AI coaching.

---

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel
- **Styling**: Custom CSS (black/white, spatial, generous whitespace)
- **AI**: OpenAI GPT-4o-mini (AI Coach)

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the entire contents of `supabase-schema.sql`
3. Copy your project URL and anon key from **Settings > API**

### 3. Configure environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
OPENAI_API_KEY=your-openai-api-key  # optional, for AI Coach
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/journal-app.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repository
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (optional)
4. Click **Deploy**

### 3. Configure Supabase Auth (optional)

In Supabase **Authentication > URL Configuration**, add your Vercel deployment URL:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## Features

| Feature | Description |
|---------|-------------|
| Today | Daily quote, task tracking, 1% focus, water tracker |
| Daily Tasks | Core disciplines with progress ring |
| Journal | Morning journal, intentions, stoic meditation, reading notes |
| Evening | Evening reflection with structured prompts |
| Dashboard | Heatmap, stats, per-task completion rates |
| Calendar | Monthly view with completion indicators |
| Past Entries | **3D notebook with page-flip animation** |
| Goals | Life, yearly, quarterly, monthly goal tracking |
| AI Coach | GPT-powered Stoic coaching |
| Pomodoro | Focus timer |
| Workout | Exercise logger |

---

## Past Entries — Notebook Mode

The past entries page renders as a **3D hardcover notebook**:
- Left page shows the previous entry
- Right page shows the current entry with task completion, focus areas, and journal text
- Click the arrow buttons to **flip pages** with a realistic animation
- Switch to List view for a quick overview

---

## No Auth? No Problem.

The app works **without authentication** using localStorage as a fallback. Data syncs to Supabase once a user signs in.

---

## Project Structure

```
journal-app/
├── app/
│   ├── api/ai-coach/route.ts   # AI Coach endpoint
│   ├── globals.css              # All styles (black/white design system)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppContext.tsx            # Global state + Supabase sync
│   ├── AppShell.tsx             # Layout wrapper + page router
│   ├── Notebook.tsx             # 3D notebook with page flip
│   ├── Sidebar.tsx              # Navigation sidebar
│   └── pages/
│       ├── TodayPage.tsx
│       ├── TasksPage.tsx
│       ├── JournalPage.tsx
│       ├── ReflectionPage.tsx
│       ├── DashboardPage.tsx
│       ├── EntriesPage.tsx
│       └── OtherPages.tsx
├── lib/
│   ├── supabase.ts              # Browser client
│   └── supabase-server.ts       # Server client
├── types/index.ts               # TypeScript types + constants
├── supabase-schema.sql          # Full DB schema with RLS
└── .env.local.example
```
