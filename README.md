# Concert Cost Tracker

Track concert spending, fun ratings, and value per dollar. Built with Next.js, Tailwind CSS, daisyUI, Supabase, and Recharts.

## Local setup

1. Copy `.env.local.example` to `.env.local` and add your Supabase keys (see below).
2. Run the database migration in your Supabase project (see **Database**).
3. Install and start (see **Windows** below if `npm` fails in PowerShell).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Windows (PowerShell blocks npm)

If you see *"running scripts is disabled on this system"*, use any of these:

**Easiest — double-click or run in terminal:**

```cmd
install.cmd
dev.cmd
```

**Or in PowerShell:**

```powershell
npm.cmd install
npm.cmd run dev
```

**Or:** Terminal → **Run Task** → **Start local website** (uses `dev.cmd`).

New terminals in this project default to **Command Prompt** so `npm run dev` usually works after you open a fresh terminal.

### "ENOENT ... .next\\server\\app\\page.js"

The build cache is incomplete. In the project folder run:

```cmd
clean.cmd
dev.cmd
```

Or manually delete the `.next` folder, then run `dev.cmd` again.

## Environment variables

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_or_publishable_key_here

# Artist Finder (server only — free at developer.ticketmaster.com)
TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
```

In Supabase: open the **ConcertCosts** project → **Settings** → **API** (or **Connect**). Copy the **Project URL** and the **publishable** (anon) public key. Do not use the service role or secret key in the frontend.

After creating or editing `.env.local`, stop the dev server (Ctrl+C) and run `npm run dev` again.

## Database

Run these SQL files in the Supabase SQL Editor (Dashboard → SQL → New query → paste → Run):

1. `supabase/migrations/001_concerts.sql` — concerts table and RLS  
2. `supabase/migrations/002_currency_and_ticket_groups.sql` — currency, user settings, multiple ticket groups, edit policy

For local sign-up without email confirmation: Supabase Dashboard → **Authentication** → **Providers** → Email → disable **Confirm email** (optional, for easier testing).

## Artist Finder

Open the **Artist Finder** tab to search artists and filter upcoming U.S. shows by state (Ticketmaster data). Requires `TICKETMASTER_API_KEY` in `.env.local`. Favorites and recent searches are stored in your browser. Use **Track this show** to pre-fill **Add Concert**.
