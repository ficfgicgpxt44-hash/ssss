# Cloud Storage Setup for JSON Case Uploads

## Overview

Cases are now automatically exported as JSON to Firebase Cloud Storage whenever:
- ✅ A new case is created
- ✅ An existing case is updated
- ✅ A case is deleted (JSON cleaned up)

## Quick Setup (5 minutes)

### Step 1: Enable Cloud Storage in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Build → Storage**
4. Click **Get Started**
5. Choose your region (same as Firestore recommended)
6. Click **Create**

### Step 2: Deploy Storage Security Rules

Go to **Storage → Rules** and replace the default rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read
    match /cases/{caseId=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == request.resource.metadata.firebaseUser;
    }
    
    // Admin-only uploads
    match /cases/{caseId}/case.json {
      allow read: if request.auth != null;
      allow write: if request.auth.email == 'ficfgicgpxt44@gmail.com';
    }
  }
}
```

Replace `ficfgicgpxt44@gmail.com` with your admin email.

Click **Publish**

### Step 3: Deploy Application

1. Commit your changes
2. Push to GitHub
3. Vercel will auto-deploy

## How It Works

```
User creates/updates case
        ↓
Case JSON automatically generated
        ↓
Exported to Cloud Storage at: cases/{caseId}/case.json
        ↓
Also saved to Firestore for quick queries
        ↓
Images stored separately in: cases/{caseId}/image_0.jpg, etc.
```

## File Structure in Cloud Storage

```
gs://your-bucket/
└── cases/
    └── {caseId}/
        ├── case.json          ← Full case data as JSON
        ├── image_0.jpg        ← First image
        ├── image_1.jpg        ← Second image
        └── image_2.jpg        ← Third image, etc.
```

## Verification

1. Create a test case in the admin dashboard
2. Upload some images
3. Go to Firebase Console → Storage
4. Navigate to `cases/{caseId}/`
5. Verify `case.json` file exists
6. Open it to see the JSON structure

## Benefits

- ✅ JSON backups automatically created
- ✅ Easy case exports and imports
- ✅ Images organized by case
- ✅ Scalable to unlimited cases
- ✅ No Firestore document size limits
- ✅ CDN delivery for fast loading

## Troubleshooting

### Issue: Permission denied errors
**Solution:** 
- Verify your email matches the admin email in security rules
- Redeploy rules
- Logout and login again

### Issue: case.json not appearing
**Solution:**
- Check Cloud Storage is enabled in Firebase Console
- Verify Security Rules are deployed
- Check browser console for errors (F12)
- Try uploading a new case

### Issue: Images not uploading
**Solution:**
- Ensure images are in base64 format (should be automatic)
- Check Cloud Storage quota limits
- Verify rules allow image uploads

## Cloud Storage Limits

- **File Size**: Up to 5 TB per file
- **Folder Depth**: Unlimited
- **Requests**: 1M reads/month free
- **Storage**: 5 GB free tier

## Cost Estimation

At typical usage:
- 100 cases with 5 images each = ~50 MB
- Storage: ~$0.02/month
- Operations: Free tier sufficient

## Accessing Case JSON

The case JSON can be accessed via:

1. **Firebase Console**: Browse in Storage tab
2. **Cloud Storage URL**: `https://storage.googleapis.com/bucket-name/cases/{caseId}/case.json`
3. **Backup**: Download directly from Storage console

## Next Steps

1. ✅ Enable Cloud Storage
2. ✅ Deploy Security Rules
3. ✅ Deploy Application
4. ✅ Test by creating a case
5. ✅ Verify case.json in Storage

All set! Your cases are now automatically exported as JSON to Cloud Storage.
