# SkillsLens — AI Interview Intelligence Platform

SkillsLens is an AI-powered async interview platform for HR teams. Recruiters create structured video/chat interviews, share a link with candidates, and get instant AI-scored reports powered by Groq (Llama3).

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: NextAuth.js v4 (Credentials + JWT)
- **Database**: MongoDB via Mongoose
- **AI**: Groq SDK (Llama3-70b)
- **UI**: React 19, Tailwind CSS v4, Recharts, Lucide Icons

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/skillslens
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
GROQ_API_KEY=<from console.groq.com>
```

> If `GROQ_API_KEY` is omitted, the app falls back to mock AI insights automatically.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo Data

After signing up as a recruiter, click **"Load Demo Data"** in the sidebar to seed 5 candidates with completed interviews and AI reports.

Or hit the seed endpoint directly:

```bash
curl -X POST http://localhost:3000/api/seed
```

Demo credentials: `demo@recruiter.com` / `password123`

## User Flows

### Recruiter
1. Sign up at `/login` (select Recruiter)
2. Create an interview at `/recruiter/create-interview`
3. Copy the generated link and share with candidates
4. View results at `/recruiter/dashboard` and `/recruiter/candidates`
5. Click any candidate to see their full AI report

### Candidate
1. Open the interview link (e.g. `/interview/<token>`)
2. Enter name and email
3. Record video answers per question
4. Submit — AI scoring runs automatically

## Deployment to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `MONGODB_URI` — MongoDB Atlas connection string
   - `NEXTAUTH_SECRET` — random secret (`openssl rand -base64 32`)
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://skillslens.vercel.app`)
   - `GROQ_API_KEY` — from [console.groq.com](https://console.groq.com)
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (auth, interviews, sessions, reports, dashboard, seed)
│   ├── candidate/        # Candidate dashboard
│   ├── interview/[id]/   # Candidate interview screen (public)
│   ├── login/            # Auth page
│   ├── recruiter/        # Recruiter dashboard, candidates, interviews, reports
│   └── page.tsx          # Landing page
├── components/
│   └── AuthProvider.tsx
├── lib/
│   ├── groq.ts           # Groq AI insight generation
│   └── mongodb.ts        # Mongoose connection
├── middleware.ts          # Route protection
└── models/
    └── index.ts          # Mongoose schemas
```
