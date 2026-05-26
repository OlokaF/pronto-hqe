# Pronto Productive — Claude Code Project Guide

## Project Overview

Pronto Productive is a single-file React app (`index.html`) built with React 18 UMD + Babel standalone (in-browser JSX, no build step). All code lives in one file. Firebase Realtime Database is used for multi-user sync.

## Critical Rules

- **NEVER** add `integrity="sha384-..."` or `crossorigin="anonymous"` to `<script>` tags — causes blank page on Vercel
- **NEVER** add `_comment` or any non-standard property to `vercel.json` — causes schema validation failure and breaks ALL deployments
- **NEVER** use a build step — this is a single `index.html`, Babel compiles JSX in the browser
- Each new `<script type="text/babel">` block must use **unique hook aliases** (e.g. `const { useState: useEP } = React;`) to avoid conflicts
- Expose cross-block components via `window.ComponentName = ComponentName`

## File Paths

- **Source:** `C:\Users\OlokaFlett\Downloads\pronto-hq\index.html`
- **Deploy:** `C:\Users\OlokaFlett\Downloads\pronto-hq-upload\Pronto Productive\index.html`
- **Deploy repo:** pushes to `OlokaF/Pronto-Productive` → watched by Vercel → live at `pronto-productive.vercel.app`
- After editing source, always `cp` to deploy folder and push from there

---

## Planned Features

---

## EMAIL SYSTEM CHANGES

### EMAIL CALENDAR / PLANNER
- Add an "Email Calendar" view where planned emails can be scheduled visually by day/week/month
- Emails should be draggable between dates
- Allow filtering by:
  - Campaign
  - Audience
  - Status (Draft / Ready / Sent)
  - Team member

### EMAIL TASK LINKING
- Allow email drafts/tasks to link directly to:
  - Content pieces
  - Promotions
  - Campaigns
  - Approval items

### EMAIL STATUS SYSTEM
Add statuses:
- Idea
- Drafting
- Ready for Review
- Approved
- Scheduled
- Sent

### EMAIL PREVIEW
- Add email preview mode for:
  - Desktop
  - Mobile
- Need to quickly see if sizing and layout works

### EMAIL TEMPLATE SAVING
- Allow reusable email templates
- Save sections/modules like:
  - Promo banners
  - CTA sections
  - Product blocks
  - Headers/footers

### EMAIL ANALYTICS
- Add reporting area for:
  - Open rate
  - Click rate
  - Conversion tracking
  - Best performing subject lines
- Eventually connect with campaign performance tracking

### EMAIL QUICK CAPTURE
- From Brain Dump, allow converting ideas directly into:
  - Email campaign
  - Draft email
  - Scheduled email task

---

## CONTENT CALENDAR CHANGES

### CONTENT CALENDAR LAYOUT
- Current content calendar needs to feel more visual and easier to manage
- Add:
  - Month view
  - Week view
  - Kanban-style workflow view

### DRAG AND DROP
- Make content draggable between dates
- When moved, all linked tasks and due dates update automatically

### CONTENT STATUS SYSTEM
Add clear stages:
- Idea
- Filming
- Editing
- Ready
- Scheduled
- Posted

### CONTENT TYPE FILTERS
Allow filtering by:
- Reel
- Story
- Photo
- Blog
- Email
- Ad
- YouTube
- TikTok
- Facebook
- LinkedIn

### TEAM VISIBILITY
- Show who owns each content piece
- Show profile image/avatar on each card
- Show active editing status if someone is currently inside it

### IDEA CAPTURE
- Add a quick "Capture Idea" button directly on the content calendar page
- Ideas should automatically go into the correct date or "unscheduled ideas"

### POST PREVIEW
- Add visual preview thumbnails for uploaded media
- Especially useful for reels/videos/photos

### CONTENT APPROVALS
- Add approval flow:
  - Draft
  - Needs Review
  - Approved
  - Posted
- Allow comments directly on content cards

### RECURRING CONTENT
- Add repeating content support:
  - Weekly promos
  - Monthly reminders
  - Recurring campaigns

### MOBILE CONTENT CALENDAR
- Mobile version currently needs improvement
- Make content cards stack properly
- Make drag/drop usable on mobile
- Ensure all scheduled content is visible without breaking layout

### LIVE COLLABORATION
- Multiple users should be able to work in the calendar at once without overwriting each other's changes
- Add live updating and proper autosave handling
- Prevent stale data from replacing newer edits
