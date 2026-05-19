# Concert Cost Tracker

Track concert spending, fun ratings, and value per dollar. Built with Next.js, Tailwind CSS, daisyUI, Supabase, and Recharts.

## Local setup

1. Copy `.env.local.example` to `.env.local` and add your Supabase keys (see below).
2. Run the database migration in your Supabase project (see **Database**).
3. Install and start:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key_here
```

In Supabase: open the **ConcertCosts** project → **Settings** → **API** (or **Connect**). Copy the **Project URL** and the **publishable** (anon) public key. Do not use the service role or secret key in the frontend.

After creating or editing `.env.local`, stop the dev server (Ctrl+C) and run `npm run dev` again.

## Database

Run the SQL in `supabase/migrations/001_concerts.sql` in the Supabase SQL Editor (Dashboard → SQL → New query → paste → Run). This creates the `concerts` table and Row Level Security policies.

For local sign-up without email confirmation: Supabase Dashboard → **Authentication** → **Providers** → Email → disable **Confirm email** (optional, for easier testing).
