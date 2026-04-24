# Supabase Connection Test Guide

إذا كنت تواجه مشاكل في استيراد الحالات، اتبع هذه الخطوات:

## 1. تحقق من متغيرات البيئة

افتح ملف `.env` وتأكد من وجود:
```
VITE_SUPABASE_URL=https://[your-project].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 2. افتح Console في المتصفح

1. اضغط `F12` أو `Ctrl+Shift+I`
2. اذهب إلى تبويب **Console**
3. ابحث عن الرسائل التي تبدأ بـ `[v0]`

## 3. تحقق من رسائل الأخطاء

### إذا رأيت:
**"[v0] Supabase is not configured"**
- تأكد من أن متغيرات البيئة صحيحة
- أعد تشغيل Dev Server

### إذا رأيت:
**"[v0] Table 'cases' not found"**
- جدول `cases` لم يتم إنشاؤه
- اذهب إلى Supabase Dashboard وشغّل السكريبت: `/scripts/setup-database.sql`

### إذا رأيت:
**"[v0] Cannot insert data"**
- هناك مشكلة في Permissions
- تحقق من Row Level Security (RLS) في Supabase

## 4. استخدم Database Status Component

أنت سترى مكون "Database Status Check" في الأعلى من لوحة التحكم.
هذا سيخبرك بحالة الاتصال تماماً.

## 5. جرّب الاستيراد

1. افتح Console مرة أخرى
2. اختر ملف JSON (جرب `test-import.json` في المشروع)
3. انظر إلى رسائل `[v0]` في Console
4. ستحصل على رسالة النجاح أو خطأ واضح

## معلومات مفيدة

- **Supabase Project URL**: هو في إعدادات المشروع تحت "Configuration"
- **Anon Key**: موجود في نفس المكان تحت "API"
- **Database**: اذهب إلى "SQL Editor" لتشغيل السكريبتات

## تواصل

إذا استمرت المشكلة، شارك رسائل Console `[v0]` الكاملة مع الفريق.
