# Supabase Setup Guide

This application now uses **Supabase** to store clinical cases in a cloud database, making them accessible to all website visitors.

## Setup Steps

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Copy your **Project URL** and **Anon Key**

### 2. Set Environment Variables
Add these to your project's environment variables:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Create Database Table
Run the SQL script in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `scripts/setup_cases_table.sql`
5. Click **Run**

The script will create:
- `cases` table to store clinical case studies
- Indexes for faster queries
- Row-Level Security (RLS) policies

### 4. Database Schema

The `cases` table includes:
- `id` (TEXT) - Unique case identifier
- `title` (TEXT) - Case title
- `category` (TEXT) - Type of procedure
- `description` (TEXT) - Case details
- `images` (JSONB) - Array of base64 encoded images
- `created_at` (BIGINT) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update time

## Features

✅ **Shared Data**: All cases added by admins are visible to all website visitors
✅ **Real-time Sync**: Changes appear immediately across all users
✅ **Secure**: Admin password protected dashboard
✅ **Scalable**: Cloud database handles unlimited cases

## How It Works

1. **Admin Dashboard**: Dentist adds/edits cases with images (password protected)
2. **Supabase Store**: Cases are saved to cloud database
3. **Public Gallery**: All website visitors see the latest cases
4. **Sync Across Sessions**: Data persists and is shared globally

## Troubleshooting

### Cases not appearing
- Check if `cases` table was created successfully in Supabase
- Verify environment variables are set correctly
- Check browser console for errors

### Can't add cases
- Ensure RLS policies are enabled correctly
- Check admin password is set

### Slow performance
- Verify database indexes are created
- Consider upgrading Supabase plan if many cases

## Migration from IndexedDB

If you had data stored in IndexedDB:
1. Export cases from the admin dashboard
2. Import them back through the admin dashboard
3. They'll automatically sync to Supabase
