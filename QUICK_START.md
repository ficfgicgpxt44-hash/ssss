# Quick Start Guide

## 1. Set Environment Variables (IMPORTANT!)

### Via Settings Panel:
1. Click **Settings** (⚙️) in top-right of preview
2. Go to **Vars** tab
3. Add these two variables:

```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your-anon-key-here
```

Get these from [supabase.com](https://supabase.com) → Settings → API

## 2. Create Database Table (If Not Exists)

Go to your Supabase dashboard:
1. Click **SQL Editor**
2. Click **New Query**
3. Paste and run this:

```sql
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at BIGINT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON cases FOR ALL USING (true) WITH CHECK (true);
```

## 3. Test Adding a Case

1. Open admin dashboard
2. Enter password: `QQwerty@@1123456`
3. Click "New Case +"
4. Fill in:
   - **Title**: "Test Case"
   - **Category**: Select any
   - **Description**: "Test description"
   - **Images**: Click to add at least one image
5. Click "Save Case to Gallery"

## 4. Check Console for Debugging

Press `F12` to open Developer Tools:
- Go to **Console** tab
- Look for messages starting with `[v0]`
- If save fails, you'll see detailed error messages

## What's Fixed ✅

✓ Image compression before upload
✓ Proper database save validation
✓ Better error messages
✓ Support for multiple environment variable formats
✓ Added profile image (sami_profile.png)

## Common Issues & Solutions

### Error: "Failed to save case"
- Check if environment variables are set (Vars section)
- Check console for `[v0]` messages
- Verify database table exists

### Images not uploading
- Images are compressed automatically (max 1200x1200)
- Must be valid image format (JPG, PNG, WEBP, etc.)
- iPhone HEIC files are auto-converted

### Cases don't appear after save
- Check console for errors
- Try refreshing the page
- Verify Supabase credentials

## File Locations

- 🖼️ **Profile Image**: `public/sami_profile.png`
- 📱 **Admin Component**: `src/components/AdminDashboard.tsx`
- 🗄️ **Database Service**: `src/services/CaseService.ts`
- ⚙️ **Supabase Setup**: `src/lib/supabase.ts`

## Next Steps

1. ✅ Set up environment variables
2. ✅ Create database table
3. ✅ Test adding a case
4. ✅ Import JSON files (if needed)
5. ✅ Deploy to production

Need help? Check `SETUP_GUIDE.md` for detailed documentation.
