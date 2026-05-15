# Michigan Menopause Collaborative

Production website for [michiganmenopause.com](https://michiganmenopause.com).

Built from the design handoff in `../design_handoff_mmc/` (Direction B · Collaborative).

## Stack

- **Next.js 15** (App Router, React 19, Server Actions)
- **TypeScript** (strict)
- **Plain CSS** (no Tailwind) — design tokens ported verbatim from `styles.css`
- **next/font** for DM Sans + IBM Plex Mono (no FOUT, no third-party request at runtime)
- **Resend** for outbound email — optional, falls back to JSONL log when unset

## Routes

| Path              | Purpose                                           |
|-------------------|---------------------------------------------------|
| `/`               | Mission · founding-meeting photo · next-meeting hero · article preview |
| `/meetings`       | Quarterly cadence · upcoming + past meetings      |
| `/leadership`     | Board (President, VP, Secretary)                  |
| `/members`        | Filterable directory (name + specialty + city)    |
| `/resources`      | This-quarter article + case · archive             |
| `/submit-a-case`  | Case-submission form → server action              |
| `/rsvp`           | Event registration form → server action           |
| `/rsvp?meeting=<id>` | RSVP pre-selecting a meeting (linked from MeetingCard) |

## Local dev

```bash
npm install
npm run dev          # → http://localhost:3001
```

## Form submissions — how they work

Both `/submit-a-case` and `/rsvp` post to **Server Actions** (`src/app/*/actions.ts`).
Each action does two things, in order:

1. **Append to `data/<kind>.jsonl`** (always — local audit log + offline fallback).
2. **Send a notification email via Resend** — only if `RESEND_API_KEY` is set.

The JSONL log is the source of truth even when email is configured. Watch incoming
RSVPs in real time:

```bash
tail -f data/rsvp.jsonl | jq .
```

Same for case submissions:

```bash
tail -f data/case.jsonl | jq .
```

The `data/` directory is `.gitignore`d; in production deploy it on a writable disk
(or swap `appendSubmission` for a database — see "Going beyond JSONL" below).

## Email setup (Resend)

1. Create a Resend account → resend.com
2. Add `michiganmenopause.com` as a sending domain and complete DNS verification
3. Set env vars (locally in `.env.local`, in Vercel under Project → Settings → Env):

   ```
   RESEND_API_KEY=re_…
   RESEND_FROM=notifications@michiganmenopause.com
   NOTIFY_EMAIL=hello@michiganmenopause.com
   ```

4. The action will start sending. Until you do this, submissions are still saved —
   they just don't email anyone.

## Deployment to michiganmenopause.com

**Recommended: Vercel.**

1. Push this directory to a GitHub repo
2. Import into Vercel — it auto-detects Next.js
3. Add the env vars from above
4. In Vercel → Domains, add `michiganmenopause.com` and follow the DNS instructions
   (typically a CNAME at `www` and an A record at the apex)
5. Vercel handles SSL automatically

**Note on JSONL on Vercel:** Vercel's filesystem is read-only at runtime. Either:
   - Rely on Resend email + skip the JSONL file (set `RESEND_API_KEY` so you don't
     lose submissions), **or**
   - Swap `src/lib/storage.ts` for a Vercel Postgres / Vercel KV / Airtable adapter
     — same `appendSubmission(s)` interface, just different body.

## Going beyond JSONL

`src/lib/storage.ts` is intentionally a one-function adapter (`appendSubmission`).
To upgrade:

- **Airtable**: have the team create a base with two tables (`rsvps`, `case_submissions`),
  rewrite `appendSubmission` to POST to the Airtable REST API. ~20 lines.
- **Postgres / Supabase**: install `@supabase/supabase-js`, swap the function body
  to an `insert`. Schema is just three columns: `id`, `received_at`, `payload jsonb`.
- **Google Sheets** (lowest-fi, easiest for non-technical handoff): use the Google
  Sheets API + a service account, append a row per submission.

## What's intentionally left for later

- **Member portraits** on `/leadership` — placeholders ship until the team supplies
  4:5 portrait photos. Drop them in `public/assets/` and update `LEADERSHIP` in
  `src/lib/data.ts`.
- **Real member roster** — the 14 names in `MEMBERS` are from the design's
  placeholders. Replace with the opt-in list once collected.
- **PDFs for the resources page** — buttons currently say "PDF — coming soon".
  Drop the files in `public/papers/` and wire them into `RESOURCES`.
- **Mobile nav** — at ≤880px the link row is hidden (matching the design handoff's
  intentional gap). A sheet menu is the obvious next addition.
- **501(c)(3) language** — copy assumes status is "in development" through 2026.
  Update once granted.

## File map

```
site/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # nav + footer + fonts
│   │   ├── page.tsx                   # /
│   │   ├── globals.css                # all design tokens
│   │   ├── meetings/page.tsx
│   │   ├── leadership/page.tsx
│   │   ├── members/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── submit-a-case/{page,CaseForm,actions}.tsx?
│   │   ├── rsvp/{page,RsvpForm,actions}.tsx?
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── Logo.tsx                   # Bloom seal + wordmark
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── PageHeader.tsx             # PageHeader + SectionHeading
│   │   ├── MeetingCard.tsx            # hero / compact / default
│   │   ├── PersonCard.tsx
│   │   ├── MemberRow.tsx
│   │   └── Directory.tsx              # client-side filtering
│   └── lib/
│       ├── data.ts                    # meetings, members, resources, leadership
│       ├── storage.ts                 # appendSubmission → JSONL
│       └── email.ts                   # Resend wrapper, no-op when unset
├── public/assets/founding-meeting.jpg
└── data/                              # JSONL submissions land here (gitignored)
```
