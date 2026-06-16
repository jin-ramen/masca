# MASCA Website — Handover

This document is the single source of truth for running and maintaining the MASCA
website. If you are a new committee member taking over the site, **read this first.**

> **How to use this file:** Keep this document updated whenever something changes
> (a new host, a renewed domain, a new service). A handover doc that's out of date
> is worse than none.

**Last updated:** 16/6/2026 by Jin Hong Pang

---

## 1. Quick reference

The "if you only read one section" section.

| Thing | Value |
|---|---|
| Live site | https://masca.org.au |
| GitHub repo | `masca-aus/masca` (owner: `jin-ramen`) |
| Hosting | Vercel, under the `admin@masca.org.au` Google Workspace account |
| Domain registrar | GoDaddy (renewals only) |
| DNS | Cloudflare (records → Vercel) |
| Domain renews | **13/10/2029** — do not let this lapse |
| Shared credentials | Notion (in the `admin@masca.org.au` Google Workspace) — see §3 |
| Logging in | Every service uses "Continue with Google" via `admin@masca.org.au` |
| Current tech lead | Jin — jinhong36@icloud.com |

---

## 2. The stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Hosting / deploy:** Vercel (auto-deploys from the `main` branch)
- **Contact form / email:** Resend
- **Images:** Cloudinary
- **Committee page content:** Notion

There's no database or custom backend — content comes from the codebase, with
images served from Cloudinary and the committee page sourced from Notion.

---

## 3. Accounts & access (the important part)

Everything below is **owned by MASCA, not by any individual.** The keystone is the
`admin@masca.org.au` account — most other services log in through it.

### `admin@masca.org.au` (keystone account)
- A **real mailbox** the committee controls, hosted on **Google Workspace**.
- **Every service is signed into with "Continue with Google" using this account** —
  GitHub, Vercel, GoDaddy, Cloudflare, Resend, Cloudinary, and Notion all use Google
  SSO rather than separate passwords. So this one account is the master key to everything.
- **If a service prompts for a 2FA / authentication code, open the Google
  Authenticator app on the admin account's device** and read the current code from
  there. That app is the live second factor for the Google login.
- **Backup recovery codes live in Notion** (see below) — use these if the
  Authenticator device is lost or unavailable. If you change the 2FA device, generate
  fresh recovery codes and update Notion immediately.

### GitHub
- Organisation: `masca-aus`
- Repo: `masca` (public)
- Permanent owner account: **`jin-ramen`** — do not remove.
- Committee members are added to the **`web-committee` team** with the **Maintain**
  role. At least one trusted lead has **Admin**.
- `main` is protected: no force-pushes, no deletions, changes go through pull requests.

### Vercel
- Project lives under the `admin@masca.org.au` Google Workspace login on Vercel.
- It deploys automatically when something is merged to `main` on GitHub.
- The custom domain is attached here under Project → Settings → Domains.

### Domain & DNS

Three separate pieces — don't confuse them:

- **Registrar (where the domain is owned/renewed): GoDaddy.** Login stored in Notion.
  You only touch GoDaddy to renew the domain or change nameservers.
  Renewal date: **13/10/2029** — set a calendar reminder a month ahead.
- **DNS (where records are managed): Cloudflare.** GoDaddy's nameservers point to
  Cloudflare, and the actual DNS records live in Cloudflare. **To change any DNS
  record, go to Cloudflare — not GoDaddy.**
- **Host: Vercel.** Cloudflare's records point the domain at the Vercel project.

So the chain is: **GoDaddy (registrar) → Cloudflare (DNS) → Vercel (site).**

### Shared credentials (Notion)
- All logins, recovery codes, and keys live in **Notion**, inside the
  `admin@masca.org.au` Google Workspace.
- **Never** store these in the repo, in a chat, or in personal accounts.
- When someone leaves the committee, rotate anything they had access to and update Notion.

> **Notion is not an encrypted password vault** — it's protected only by who can
> access the workspace/page. So: keep the credentials page restricted to current
> committee members, **never use Notion's "Share to web"** on it, and remember that
> anyone with access to that workspace can read everything in it. If MASCA later
> wants stronger separation, move the most sensitive logins (the Google Workspace
> admin password especially) into a dedicated free password manager.

---

## 4. Running it locally

```bash
# 1. Clone the repo
git clone https://github.com/masca-aus/masca.git
cd masca

# 2. Install dependencies
npm install

# 3. Set up environment variables
#    Copy the example file and fill in real values from Notion.
cp .env.example .env.local

# 4. Run the dev server
npm run dev
```

The site should now be running at `http://localhost:3000` (or whatever the
terminal prints).

> **Env vars:** real secrets are **never** committed. They live in Notion and in
> Vercel (Project → Settings → Environment Variables). `.env.local` is gitignored —
> keep it that way. Expect keys for Resend, Cloudinary, and Notion.

---

## 5. How deploys work

1. You make changes on a branch and open a **pull request** into `main`.
2. Someone reviews and merges it (while the committee is small, self-merge is fine).
3. Merging to `main` triggers Vercel to build and deploy automatically.
4. Within a minute or two, the live site updates. No manual deploy step.

To preview before going live: every pull request gets its own **Vercel preview URL**
automatically — check that link before merging.

**Never push directly to `main`** — branch protection blocks it, and that's on purpose.

---

## 6. Common tasks

- **Edit text:** in the page files under `app/` — find the page you want and edit
  the copy directly.
- **Add or change images:** upload to **Cloudinary**, then reference the Cloudinary
  URL in the page. Don't commit large image files into the repo.
- **Add a new page:** create a new folder under `app/` with a `page.tsx` inside
  (App Router convention) — copy an existing page as a template.
- **Update the committee page:** edit the source in **Notion**; the site pulls from
  there. No code change needed for committee content.
- **Change the contact-form recipient / email:** managed through **Resend** — check
  the API route under `app/api/` and the `RESEND_*` environment variables in Vercel.
- **Add an environment variable:** add it to both your local `.env.local` **and**
  Vercel → Settings → Environment Variables, then redeploy.

---

## 7. Committee handover

### Onboarding a new committee member
1. They create a personal GitHub account (or use their existing one).
2. An org admin adds them to the `masca-aus` → `web-committee` team (Maintain role).
3. Give them access to the Notion workspace.
4. Point them at this document.

### When someone leaves
1. Remove them from the `web-committee` team on GitHub **(DO NOT remove owner `jin-ramen`)**.
2. Remove their Notion access.
3. **Rotate** any shared credentials they personally knew (the `admin@` Google
   password especially), and update Notion.
4. Make sure no service still depends on their personal account.

### Each year's tech lead inherits
- The `admin@masca.org.au` Google Workspace account and its recovery codes.
- Admin on the `masca-aus` GitHub org.
- Ownership of this document — keep it current.

---

## 8. Costs & renewals

Track anything that costs money or expires, so nothing lapses silently.

| Item | Who pays | Amount | Renews | Notes |
|---|---|---|---|---|
| Domain (GoDaddy) | MASCA | [FILL: $] | **13/10/2029** | Critical — site + email die if it lapses |
| DNS (Cloudflare) | — | Free | n/a | Manages DNS records → Vercel |
| Hosting (Vercel) | — | Free (Hobby) | n/a | Free tier unless upgraded |
| Google Workspace | MASCA | [FILL: $/mo] | [FILL: date] | Hosts the `admin@` mailbox + Notion access |
| Resend | — | [FILL: free?] | n/a | Contact-form email |
| Cloudinary | — | [FILL: free?] | n/a | Image hosting |
| Notion | — | [FILL: free?] | n/a | Credentials + committee page |

---

## 9. If something breaks

- **Site is down:** check the Vercel dashboard (`admin@` account) for a failed
  build, and confirm the domain hasn't expired at GoDaddy.
- **A deploy didn't go live:** check Vercel → Deployments for the latest build
  status and error log.
- **Images not loading:** check Cloudinary (account status, correct URLs).
- **Committee page empty/broken:** check the Notion source and the Notion API key
  in Vercel env vars.
- **Contact form not sending:** check Resend (account status, `RESEND_*` env vars).
- **Can't log into a service:** every service uses "Continue with Google" via
  `admin@masca.org.au`. If it asks for an auth code, read it from the **Google
  Authenticator app** on the admin account's device. If that device is unavailable,
  use the backup recovery codes in Notion.
- **Domain/email suddenly stopped:** first check **GoDaddy** for an expired or
  unpaid domain (most common cause). If the domain is fine but the site won't
  resolve, check the **DNS records in Cloudflare** — not GoDaddy.
- **Locked out entirely:** whoever holds the `admin@` Google Workspace account and
  the Notion workspace can recover everything. That's why those two must always be
  committee-controlled.

---

## 10. Source of truth

- **Code:** `github.com/masca-aus/masca`
- **Credentials:** Notion (never the repo)
- **This document:** lives in the repo at `HANDOVER.md` — update it as things change

If you change how the site is hosted, where the domain lives, or which services it
uses, **update this file in the same pull request.** Future-you (and the next
committee) will thank you.