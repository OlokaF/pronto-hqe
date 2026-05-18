# Pronto HQ — Google Sheet sync setup

This connects the app to your Google Sheet so Vanja and Oloka see the same data.

## One-time setup (about 5 minutes)

1. **Open your Sheet** in the browser
2. **Extensions → Apps Script** (opens the script editor)
3. **Delete everything in `Code.gs`**, then **paste in the entire contents of `apps-script.gs`** from this project
4. **Save** (disk icon top-left). Name the project something like *Pronto HQ Sync*
5. **Deploy → New deployment**
   - Click the gear next to "Select type" → **Web app**
   - **Description:** Pronto HQ Sync
   - **Execute as:** Me (your-email)
   - **Who has access:** Anyone with the link
   - Click **Deploy**
6. **Authorize** when prompted (Google will warn you the app isn't verified — that's normal, it's your own script. Click *Advanced* → *Go to project (unsafe)* → *Allow*)
7. Copy the **Web App URL** Google gives you (looks like `https://script.google.com/macros/s/…/exec`)

## Wire the app up

1. Open Pronto HQ
2. Click the **SYNC** button (top right of the header)
3. Paste the Web App URL → click **SAVE** → click **TEST** (should say "Connected ✓")

## Daily use

- **Push to Sheet** — sends your local edits up to the Sheet (overwrites what's in the `_pronto_*` tabs)
- **Pull from Sheet** — replaces your local edits with what's in the Sheet
- **Workflow tip:** Pull when you sit down, Push when you finish. If two of you edit at once, last-push wins.

## What gets synced

The script creates and manages tabs starting with `_pronto_` in your Sheet:
`_pronto_tasksByDate`, `_pronto_content`, `_pronto_ideas`, `_pronto_suppliers`,
`_pronto_budget_*`, `_pronto_onboarding`, `_pronto_courses`, `_pronto_testimonials`,
`_pronto_photos`, `_pronto_plan_*`, `_pronto_staff`, `_pronto_lunches`,
`_pronto_msgs`, `_pronto_meta`.

**Your existing tabs are not touched** — only the `_pronto_*` ones are managed by the app.

## Security note

The Web App URL works like a password — anyone who has it can read and write your data.
Don't paste it anywhere public.

## When to redeploy

If you change the script later, you need to: **Deploy → Manage deployments → pencil icon → Version: New version → Deploy.**
The same URL stays valid.
