# Nimza Restaurant & Lounge — Next.js 14/15 App Router Project

A complete, premium fine dining restaurant application built with:
- Next.js (App Router)
- React & TypeScript
- Tailwind CSS (Deep Olive #343D27, Warm Beige #E9DFC9, Antique Gold #B99A5B, Warm Ivory #F7F4EC, Charcoal #24241F)
- Supabase PostgreSQL, Authentication, Realtime & Storage
- libphonenumber-js for international phone validation
- SweetAlert2 for notifications

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure .env.local:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

3. Run SQL migration:
   Execute the included `supabase-schema.sql` in your Supabase SQL Editor.

4. Run locally:
   ```bash
   npm run dev
   ```
