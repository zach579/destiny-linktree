# Destiny Church Linktree — Rollout Guide

## 1. Supabase (already done)
The database schema, security policies, and storage buckets (`sermons`, `branding`) are already set up in the `destiny-linktree` Supabase project.

To add staff logins: **Authentication → Users → Add user** (email + password). Each staff member uses this to sign into `/dashboard`.

## 2. Deploy — Vercel or Netlify (pick one)

### Option A: Vercel
1. Go to vercel.com → **Add New → Project** → import this GitHub repo.
2. Before clicking deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase publishable (anon) key
3. Click **Deploy**. In a couple minutes you'll get a live link like `destiny-linktree.vercel.app`.
4. **Settings → Domains** → add your subdomain (e.g. `links.destinychurch.org`) → add the DNS record it gives you at your domain registrar.

### Option B: Netlify
1. Go to app.netlify.com → **Add new site → Import an existing project** → connect this repo. Netlify auto-detects Next.js.
2. **Site configuration → Environment variables** → add the same two variables.
3. Deploy. You'll get a live link like `destiny-linktree.netlify.app`.
4. **Domain management → Add a domain** → add your subdomain → add the DNS record at your registrar.

## Using it day to day
- Staff go to `yourdomain.com/dashboard`, sign in, and manage each campus's profile photo, logo, tagline, links, and sermon PDFs.
- Links can have a **Section** (e.g. "Next Gen", "Coming Up") that becomes a header on the public page — or an **icon** (Instagram, Facebook, YouTube, Email, Website, TikTok, X) that renders in the social row under the profile photo.
- The public visits `yourdomain.com/columbia`, `/lewisburg`, or `/shelbyville` — put those in your social bios.
- `yourdomain.com` itself shows a campus picker.

## Notes
- PDF size limit comes from Supabase storage (free tier: 1GB total, 50MB per file).
- To add a 4th campus later: add a row to the `campuses` table in Supabase and add its key/name to the `CAMPUSES` array in `lib/supabaseClient.js`.
