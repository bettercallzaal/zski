# ZSki

Photo sharing app for ski trips. Upload photos, tag your spot, and browse by location or on a map.

Built for the Attitash 2026 trip.

## Features

- Photo uploads with captions and author names
- GPS location capture and spot tagging
- Filter by time (Today / This Weekend / All) and location
- Interactive map view with photo pins (Leaflet)
- Vercel Blob for image storage, Postgres for metadata

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Link Vercel project and pull env vars**
   ```bash
   vercel link
   vercel env pull .env.local
   ```
   Requires a Vercel Postgres database and Blob store connected to the project.

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. **Initialize the database**
   Visit `/api/setup` to create/migrate the posts table.

## Tech Stack

- Next.js 16 (App Router)
- Vercel Blob + Vercel Postgres
- Tailwind CSS 4
- Leaflet / React-Leaflet for maps
