# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `locatr-app` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Wait for the project to be created (2-3 minutes)

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)

## 3. Update Environment Variables

Update your `.env` file with your actual Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
```

## 4. Run the Database Schema

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste it into the SQL Editor and click "Run"

This will create:
- `businesses` table with all necessary columns and indexes
- `search_cache` table for AI query optimization
- Row Level Security policies
- Automatic timestamp updates

## 5. Test the Connection

Run your development server:

```bash
npm run dev
```

The app should now connect to Supabase instead of your local PostgreSQL database.

## 6. Optional: Seed Data

If you have existing business data, you can import it through:
- Supabase Dashboard → Table Editor → Import CSV
- Or use the database service methods in your app

## 7. Production Considerations

For production:
- Set up proper RLS policies based on your authentication needs
- Consider adding more specific indexes based on your query patterns
- Set up database backups
- Monitor usage in the Supabase dashboard

## Database Service Usage

The new `DatabaseService` class provides these methods:

```typescript
import { db } from './lib/database'

// Get businesses
const businesses = await db.getBusinesses('restaurant', 'New York')

// Add a business
const newBusiness = await db.addBusiness({
  name: 'Great Restaurant',
  category: 'restaurant',
  type: 'dining',
  city: 'New York',
  rating: 4.5,
  latitude: 40.7128,
  longitude: -74.0060,
  ai_generated: false
})

// Search businesses
const results = await db.searchBusinesses('pizza')
```