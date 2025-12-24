<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>
# LocalPulse — Local Business Directory

LocalPulse is a lightweight web app for discovering and managing local businesses in your community. It includes a searchable directory, business detail pages, contact forms, and an admin dashboard for adding or updating listings.

## Features
- Browse and search local businesses by category and location
- Business detail pages with contact information and map view
- Admin/Business dashboard to add or manage listings
- Optional AI-powered assistant for contextual responses (requires Gemini API key)

## Quick Start (Local Development)

Prerequisites: Node.js and npm

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy or create an environment file and add required variables
   - Create `.env` in the project root (see `.env.example` if present)
   - Common variables:
     - `GEMINI_API_KEY` (optional — for AI features)
     - `SUPABASE_URL` and `SUPABASE_ANON_KEY` (if using Supabase backend)
3. Run the dev server
   ```bash
   npm run dev
   ```

Open the app at `http://localhost:5173` (default Vite port) or the URL shown in your terminal.

## Database / Backend
This project includes Supabase integration (see `supabase-schema.sql` and `lib/supabase.ts`). If you plan to use Supabase:

1. Create a Supabase project and run the SQL in `supabase-schema.sql` to create tables.
2. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your `.env`.

If you do not use Supabase, the app can still run in a limited local mode for frontend development.

## Deployment
You can deploy the app to Vercel, Netlify, or GitHub Pages. For Vercel/Netlify, set the environment variables in the service dashboard and push the repository.

Example (Vercel):
1. Connect repository to Vercel
2. Add env vars (`GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`)
3. Set build command: `npm run build`; publish directory: `dist`

## Project Structure (high level)
- `components/` — React UI components
- `views/` — Page-level views
- `lib/` — helpers and Supabase client
- `services/` — business logic and API wrappers
- `server.js` / `server-updated.js` — optional backend/server scripts

## Contributing
PRs welcome. For major changes, open an issue first to discuss the change.

## License
Specify your license here (e.g., MIT) or add a `LICENSE` file.

---
If you'd like, I can also add a `.env.example` file, update `package.json` scripts, or prepare a short deploy guide for Vercel. What would you like next?
