# استكشاف أخطاء الموقع

## إذا كانت الصفحة بيضاء أو لا تعرض أي محتوى

### الخطوة 1: فتح Developer Tools
1. اضغط `F12` أو `Ctrl+Shift+I` (Windows) أو `Cmd+Option+I` (Mac)
2. انتقل إلى علامة التبويب `Console`

### الخطوة 2: البحث عن الأخطاء
ابحث عن الأخطاء الحمراء (errors). قد تجد واحداً مما يلي:

#### أ) خطأ Supabase
```
Supabase environment variables not configured. Using localStorage fallback.
```
**الحل:** هذا طبيعي. التطبيق سيستخدم localStorage محلياً.

#### ب) خطأ في تحميل الصور
```
Failed to load image: https://...
```
**الحل:** تأكد من أن جميع روابط الصور صحيحة.

#### ج) خطأ في React rendering
```
Uncaught Error in React
```
**الحل:** 
1. حدّث الصفحة `Ctrl+F5` أو `Cmd+Shift+R`
2. امسح ذاكرة التخزين المؤقت: `Application > Storage > Local Storage > Clear All`

### الخطوة 3: التحقق من Debug Info
في الزاوية السفلية اليسرى من الصفحة، يجب أن ترى مربع صغير مكتوب عليه "DEBUG INFO". 
مرر الفأرة عليه لرؤية:
- **Supabase**: ✓ أو ✗ (هل تم تكوينه)
- **LocalStorage**: ✓ أو ✗ (هل يعمل)

### الخطوة 4: خوادم الويب

إذا ظل الموقع بدون محتوى:

#### تأكد من تشغيل خادم التطوير:
```bash
npm run dev
```

#### تأكد من أن الموقع يعمل على:
```
http://localhost:3000
```

### الخطوة 5: إعادة تشغيل الخادم

```bash
# قتل العملية الحالية
Ctrl+C

# تنظيف التخزين المؤقت
rm -rf node_modules/.vite

# إعادة التثبيت والتشغيل
npm install
npm run dev
```

## المشاكل الشائعة الأخرى

### الموقع لا يتحمل الصور
- تحقق من روابط الصور في AdminDashboard
- تأكد من أن الصور موجودة أو من أن روابط الويب صحيحة

### النمط (CSS) لا يعمل
- أعد تحميل الصفحة: `Ctrl+Shift+Delete` (مسح الكاش)
- تحقق من أن `@import "tailwindcss"` موجود في `src/index.css`

### Supabase لا يعمل
- راجع [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- تحقق من أن بيانات الاعتماد موجودة في `.env.local`

## ملخص الحل السريع

```bash
# 1. تنظيف الكاش
npm run clean
# أو يدويّاً: rm -rf dist node_modules

# 2. إعادة التثبيت
npm install

# 3. تشغيل الخادم
npm run dev

# 4. فتح http://localhost:3000 في المتصفح

# 5. اضغط Ctrl+Shift+Delete لمسح الكاش
```

## اتصل بالدعم

إذا استمرت المشاكل، قدم لنا:
1. رسالة الخطأ الكاملة من Console
2. نوع المتصفح والإصدار
3. نظام التشغيل (Windows/Mac/Linux)
