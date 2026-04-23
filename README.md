<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Dentist Portfolio with Supabase

A professional dentist portfolio website with a secure admin dashboard for managing clinical cases. All cases are stored in Supabase cloud database and visible to all website visitors.

## 🌟 Features

- **Cloud Storage**: Cases stored in Supabase (shared across all visitors)
- **Admin Dashboard**: Secure password-protected case management
- **Image Compression**: Automatic image compression for web optimization
- **HEIC Support**: Convert iPhone photos directly
- **Responsive Design**: Works on desktop and mobile
- **Real-time Sync**: Changes appear immediately for all users

## 📋 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
See [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md) for detailed instructions.

### 3. Set Environment Variables
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Create Database Table
Run `scripts/setup_cases_table.sql` in your Supabase SQL Editor

### 5. Run Locally
```bash
npm run dev
```

## 📚 Documentation

- **[QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md)** - خطوات سريعة للإعداد (Arabic)
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase setup guide
- **[scripts/setup_cases_table.sql](./scripts/setup_cases_table.sql)** - Database schema

## 🔐 Security

- Admin dashboard protected with password
- Row Level Security (RLS) on database
- No sensitive data exposed to frontend
- Images compressed before storage

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Storage**: JSONB for images
- **Auth**: Password-protected admin panel
- **Build**: Vite

## 📞 Support

For Supabase configuration issues, see troubleshooting section in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
