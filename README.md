# Acoflex — Official Corporate Website

The official public website for Acoflex PVC pipes and pipe systems manufactured in Ambala, Haryana.

## Tech Stack
- **Framework:** React 19 + Vite
- **Routing:** TanStack Router (SPA)
- **Styling:** Tailwind CSS
- **Data & State:** TanStack React Query + Supabase Client
- **Icons & UI:** Lucide React + Radix UI

## Getting Started

### 1. Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm or bun

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Set the Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run preview
```

### 5. Deployment
Configured for deployment on Vercel with single-page application routing (`vercel.json`).
