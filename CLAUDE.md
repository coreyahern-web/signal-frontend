# CLAUDE.md — Signal Frontend

## WHAT
Signal is the frontend knowledge vault for Video Breakdown — a React 19 + Vite app that displays AI-analyzed knowledge cards extracted from Instagram reels and videos by the sibling Telegram bot pipeline. Cards expose title, summary, steps, tasks, concepts, warnings, difficulty, and brand relevance.

## WHY
Used by Corey to consume, triage, and act on extracted knowledge across Cold Holdings brands without re-watching the source content. Pairs with `coreyahern-web/video-breakdown` (the local bot) which writes to the same Supabase `knowledge_entries` table that this app reads.

## HOW

### Live URL
- Production: https://signal-frontend-two.vercel.app
- Vercel project: signal-frontend
- Repo: coreyahern-web/signal-frontend

### Tech stack
- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (Postgres) via `@supabase/supabase-js`
- **Hosting**: Vercel
- **No TypeScript** — plain JSX throughout

### Repo structure
```
src/
  components/
    EntryCard.jsx      # Individual knowledge card
    Feed.jsx           # Main card grid/feed
    Nav.jsx            # Navigation
    Search.jsx         # Search functionality
    Tasks.jsx          # Tasks tab
  lib/
    supabase.js        # Supabase client init
  App.jsx              # Root component, routing
  main.jsx             # Entry point
supabase/              # Migrations
CLAUDE.md              # This file
```

### Supabase
- Project ID: `uizfpzpwtaygkfyxymhx` (shared with vb-local; this app reads, vb-local writes)
- Table: `knowledge_entries` — primary data table
- RLS: disabled on `knowledge_entries` (intentional)
- Key columns: `id`, `url`, `platform`, `title`, `summary`, `transcript`, `prerequisites`, `warnings`, `source`, `brand_relevance`, `difficulty`, `time_to_implement`, `content_type`, `transcript_failed`, `archived`, `verdict`, `what_works`, `what_doesnt`, `who_it_works_for`, `next_step`, `already_doing`, `recommend`, `relevancy_score`, `confidence`, `tools`, `upgrade_status`, `upgrade_type`, `upgrade_notes`, `brief_ref`

### Conventions (precise)
- **Soft delete only** — use `archived = true`, never hard delete
- **`upgrade_status` values**: `act`, `queue`, `save`, `discard`, `null` (unreviewed)
- Cards with `relevancy_score` 3 or below should be auto-archived on save
- Source tagging: `reel kb · video transcript` / `post kb · image ocr` / `carousel kb · image ocr`
- Grid layout, dark-themed, minimal surface — expand on click
- **Always `git pull` before making changes; push to `master` only**

### Commands
```
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # eslint
```

### Open build items
- Upgrade tracking UI: status badges, type tags, notes field, brief_ref, filter bar
- Copy button on each card (raw formatted text)
- Copy + Brief button (wrapped in critical analysis prompt)
- Archive/Unarchive/Delete actions on cards
- Archived tab, Sort toggle, Multi-select group copy
- Viral Vault tab (`viral_entries` table)
- Tasks tab checkboxes wired to `task_completions` table
- Duplicate URL detection

### Deployment
- Push to `master` → Vercel auto-deploys
- **Never push broken builds to master — run `npm run build` locally first**
- Environment variables set in Vercel dashboard (specific list: needs founder input — gap flagged in audit file)

### Related files (do NOT duplicate)
- Sibling repo: `coreyahern-web/video-breakdown` — bot that writes to the same Supabase table
- `supabase/` migrations — schema source of truth

## Self-maintenance rule
At the end of every Claude Code session in this repo, update this file with any new components, schema changes, new conventions, or deployment changes.
