# Setup Guide - Clinical Case Management System

## Issues Fixed

### 1. Environment Variables Configuration
- Added support for multiple environment variable naming conventions
- The app now checks: `VITE_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `PUBLIC_SUPABASE_URL`
- Same for API keys: `VITE_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_SUPABASE_ANON_KEY`

### 2. Image Compression Function
- Added `compressImage()` utility function for automatic image optimization
- Compresses images to max 1200x1200px at 70% quality
- Maintains aspect ratio while reducing file size

### 3. Database Save Validation
- Improved `addCase()` to properly validate data before insert
- Enhanced error messages showing exactly what's wrong
- Returns null with clear console messages on failure

### 4. UI Feedback Improvements
- Better error messages for users
- Console logging with `[v0]` markers for debugging
- Validation of all required fields before save

## How to Set Up Environment Variables

You have 3 options:

### Option 1: Using Settings Panel (Easiest)
1. Click the **Settings** button in the top-right of the Preview
2. Go to **Vars**
3. Add these variables:
   - `VITE_SUPABASE_URL` → Your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → Your Supabase Anon Key

### Option 2: Using .env File
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Option 3: Using .env.local
Create a `.env.local` file (this is ignored by git):
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Click **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** → Use as `VITE_SUPABASE_ANON_KEY`

## Database Setup

Your Supabase database should have a `cases` table with these columns:

```sql
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for testing)
CREATE POLICY "Allow all operations" ON cases FOR ALL USING (true) WITH CHECK (true);
```

## Troubleshooting

### Issue: "No cases were imported" or nothing saves
**Solution:**
1. Check browser console (F12)
2. Look for messages starting with `[v0]`
3. Check Database Status at the top of the dashboard
4. Verify environment variables are set correctly

### Issue: Image compression fails
**Solution:**
- Make sure image files are valid (JPG, PNG, WEBP, etc.)
- Check that images aren't too large (>50MB)
- The app will fall back to original if compression fails

### Issue: Cases don't appear after saving
**Solution:**
1. Check the console for error messages
2. Verify Supabase table exists
3. Ensure Row Level Security allows your operations
4. Try reloading the page

## Testing

### Test Adding a Case
1. Click "New Case +" button
2. Enter a title and description
3. Add at least one image
4. Click "Save Case to Gallery"
5. The case should appear in the list below

### Test Image Upload
- Drag and drop images into the "Add Images" area
- Or click to browse and select multiple files
- HEIC/HEIF formats (iPhone) are automatically converted

## Development

### Console Debugging
All debug messages are prefixed with `[v0]` for easy filtering:
- Open browser Developer Tools (F12)
- Go to Console tab
- Filter by "v0" to see all app messages

### Environment Check
The app logs configuration status on startup:
```
[v0] Supabase Configuration Check:
[v0] URL configured: true
[v0] Key configured: true
```

## File Locations

- **Main Admin Component**: `src/components/AdminDashboard.tsx`
- **Database Service**: `src/services/CaseService.ts`
- **Supabase Client**: `src/lib/supabase.ts`
- **Data Types**: `src/types.ts`
- **Initial Data**: `src/data/initialData.ts`
