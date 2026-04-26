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

## WORKTREE WORKFLOW

- **Spin up:** `git worktree add ~/cold-worktrees/[repo]-[task-slug] [branch]`
- **Tear down:** `git worktree remove ~/cold-worktrees/[repo]-[task-slug]`
- **One worktree per active task**, named by task slug (e.g. `permit-scraper-fix`, `holdings-rls-migration`)
- **Never run more than 3 parallel Claude Code sessions on the same Mac mini**

## SELF-IMPROVEMENT LOG

<!-- Append one-line lessons below as they surface during a session.
     Format: `- YYYY-MM-DD: <lesson>` -->

- 2026-03-22: Frontend repo (coreyahern-web/signal-frontend) push via Terminal only — Cowork cannot push to GitHub
- 2026-03-22: Push to master only (not main) — repo uses master branch
- 2026-03-22: Cards with relevancy_score 3 or below should be auto-archived on save
- 2026-03-22: Soft delete only — use archived = true, never hard delete

**Rules:**
- When a mistake or correction surfaces during a session, append a one-line lesson here before ending the session
- At the start of every session, read this section first

## SUBAGENT DELEGATION

- **Long log searches (>200 lines):** spawn subagent
- **Multi-file refactors across >5 files:** spawn subagent per file group
- **Test runs:** spawn subagent so failures don't pollute main context
- **Anything over 1500 tokens of expected output** that's not the primary deliverable: spawn subagent

## RECENT DECISIONS

<!-- Last 30 decisions, count-based FIFO. Format: `- YYYY-MM-DD: <decision> (session: <topic>)`.
     When the 31st entry is added, the oldest drops. Older entries are reconciled into BRAIN.md
     or cold-holdings-os/config/DECISIONS.md by the ingest pipeline. -->

_(no entries yet)_

**Rules:**
- When a deliberate decision is made during a session that affects this repo, append a one-line entry here before ending the session
- At the start of every session, read this section to load recent context
- Maximum 30 entries — when adding the 31st, remove the oldest

## DEPENDENCIES ON OTHER REPOS

- **vb-local** (sibling repo coreyahern-web/video-breakdown) — writes to the same Supabase knowledge_entries table that this app reads
- **Supabase project uizfpzpwtaygkfyxymhx** — shared read target (vb-local writes, signal-frontend reads)
- **Vercel** — auto-deploys on push to master

## DO NOT TOUCH

- **knowledge_entries table** — written by vb-local sibling repo; this app reads only. Soft delete only (archived=true)
- **Vercel deployment config** — managed via Vercel dashboard
- **.env.local** — secrets only, never committed
- **public/** assets — production deployment, do not bulk-modify

## OPERATOR DISCIPLINE

When the operator sends a directive, the operator's velocity is not a license to skip diagnostic. Claude Code's discipline saves the operator from their own mistakes more often than not.

Rules for handling operator pressure:

1. **Push back on contradictions.** When the operator asks for something that contradicts a stated rule (in this CLAUDE.md, in BRAIN.md, in the global config files, or in this thread's earlier decisions), surface the contradiction before acting. Do not assume the operator has overridden the rule silently.

2. **Flag scope creep mid-task.** If the operator's directive expands beyond the original Phase A or Phase B scope, stop and surface the expansion. Do not silently absorb new work into an existing card.

3. **Refuse "just do it" pressure when diagnostic is needed.** If the operator says "skip the audit" or "just commit it" on work that touches schema, credentials, deployments, or shared infrastructure, the diagnostic still runs. State that the diagnostic is mandatory and proceed with it. Operator velocity is not a license to skip diagnostic.

4. **Surface assumptions before acting on them.** When the directive doesn't specify (which Supabase ref, which branch, which file path), do not pick. Ask. Even when the answer seems obvious from context.

5. **Catch session-memory errors.** When the operator quotes a fact from earlier in the thread (a SHA, a config value, a schema enum), grep-verify against ground truth before acting on it. The operator's session memory is not authoritative — the on-disk file is.

6. **Stop on rule conflicts.** If two rules in this CLAUDE.md or in the global configs contradict each other, stop and surface the conflict. Do not pick one silently.

These rules apply regardless of operator tone. Pressure, urgency, frustration, and exhaustion are not signals to lower the bar.

## VERIFICATION

After any change, verify the change actually works end-to-end — exit code 0 is not enough.

**Build:** Run `npm run build` locally before any push (already noted in the Deployment section). Vite/esbuild strips TS-style errors silently in plain JSX, so a successful build does not prove the page renders.

**Production:** Push to `master` triggers Vercel auto-deploy. After the deploy reaches READY, hit `https://signal-frontend-two.vercel.app` directly — READY status alone is not the same as the page rendering.

**Surface mapping:**
- UI/component change → load the production URL, exercise the changed component visually
- `knowledge_entries` field change → confirm the new field renders on at least one card in the feed; if no existing card has the field, write a Supabase row with the field set and verify the card renders
- Schema migration → confirm in the `supabase/` migration file before push, then verify the live table structure after deploy

Repo-local tests not yet established; verification is build/prod/surface-based, not test-runner-based.

## Self-maintenance rule
At the end of every Claude Code session in this repo, update this file with any new components, schema changes, new conventions, or deployment changes.
