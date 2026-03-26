# Signal Frontend — Project Memory

Read this file at the start of every session before touching any code.
Update this file whenever architectural decisions change, new conventions are established, or deployment details change.

---

## What This Is

Signal is the frontend knowledge vault for Video Breakdown — a React app that displays AI-analyzed content cards extracted from Instagram reels and videos via the Telegram bot pipeline. Cards show title, summary, steps, tasks, concepts, warnings, difficulty, and brand relevance. Used by Corey to consume, triage, and act on extracted knowledge across Cold Holdings brands.

## Live URL
- Production: https://signal-frontend-two.vercel.app
- Vercel project: signal-frontend
- Repo: coreyahern-web/signal-frontend

## Tech Stack
- **Frontend**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (Postgres) via @supabase/supabase-js
- **Hosting**: Vercel
- **No TypeScript** — plain JSX throughout

## Repo Structure
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

## Supabase
- Project ID: uizfpzpwtaygkfyxymhx
- Table: knowledge_entries — primary data table
- RLS: disabled on knowledge_entries (intentional)
- Key columns: id, url, platform, title, summary, transcript, prerequisites, warnings, source, brand_relevance, difficulty, time_to_implement, content_type, transcript_failed, archived, verdict, what_works, what_doesnt, who_it_works_for, next_step, already_doing, recommend, relevancy_score, confidence, tools, upgrade_status, upgrade_type, upgrade_notes, brief_ref

## Key Conventions
- Soft delete only — use archived = true, never hard delete
- upgrade_status values: act, queue, save, discard, null (unreviewed)
- Cards with relevancy_score 3 or below should be auto-archived on save
- Source tagging: reel kb · video transcript / post kb · image ocr / carousel kb · image ocr
- Grid layout, dark-themed, minimal surface — expand on click
- Always git pull before making changes, push to master only

## Commands
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview production build

## Open Build Items
- Upgrade tracking UI: status badges, type tags, notes field, brief_ref, filter bar
- Copy button on each card (raw formatted text)
- Copy + Brief button (wrapped in critical analysis prompt)
- Archive/Unarchive/Delete actions on cards
- Archived tab, Sort toggle, Multi-select group copy
- Viral Vault tab (viral_entries table)
- Tasks tab checkboxes wired to task_completions table
- Duplicate URL detection

## Deployment
- Push to master → Vercel auto-deploys
- Never push broken builds to master — run npm run build locally first
- Environment variables set in Vercel dashboard

## Self-Maintenance Rule
At the end of every Claude Code session in this repo, update this file with any new components, schema changes, new conventions, or deployment changes.
