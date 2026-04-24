# دليل استيراد الحالات الطبية

## مشاكل تم إصلاحها:
1. ✅ معالجة أفضل للأخطاء عند استيراد ملفات JSON
2. ✅ التحقق من صحة البيانات قبل الحفظ
3. ✅ تحويل بيانات الـ ID و timestamps بشكل صحيح
4. ✅ معالجة ملفات JSON متعددة في نفس الوقت

## صيغة ملف JSON الصحيحة:

### لحالة واحدة:
```json
{
  "id": "unique-id-or-leave-empty",
  "title": "عنوان الحالة",
  "category": "Endodontics|Prosthodontics|Surgery|Pedodontics|Cosmetic Fillings",
  "description": "وصف الحالة",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
  ],
  "createdAt": 1716489600000
}
```

### لعدة حالات:
```json
[
  {
    "title": "الحالة الأولى",
    "category": "Endodontics",
    "description": "...",
    "images": []
  },
  {
    "title": "الحالة الثانية",
    "category": "Prosthodontics",
    "description": "...",
    "images": []
  }
]
```

## خطوات الاستيراد:
1. اذهب إلى لوحة التحكم (Admin Dashboard)
2. أدخل كلمة المرور
3. اضغط على زر **"Import JSON Files"** بلون أزرق
4. اختر ملف JSON واحد أو عدة ملفات
5. انتظر حتى انتهاء الاستيراد
6. سيظهر رسالة بعدد الحالات المستوردة

## الملاحظات المهمة:
- **الحقول الإلزامية:** `title`, `category`, `description`
- **الحقول الاختيارية:** `id`, `createdAt`, `images`
- **الصور:** يجب أن تكون بصيغة Base64 (data:image/...)
- **الحد الأقصى للصور:** 30 صورة لكل حالة
- **الفئات المدعومة:** 
  - Endodontics (علاج الجذور)
  - Prosthodontics (التركيبات)
  - Surgery (جراحة)
  - Pedodontics (طب أطفال)
  - Cosmetic Fillings (حشوات تجميلية)

## استكشاف الأخطاء:
إذا فشل الاستيراد:
1. تحقق من صيغة JSON (استخدم JSON validator online)
2. تأكد من وجود الحقول المطلوبة
3. تحقق من اتصال الإنترنت
4. تأكد من أن Supabase مُعد بشكل صحيح
