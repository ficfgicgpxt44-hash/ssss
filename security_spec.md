# Firebase Security Specification

## 1. Data Invariants
- A case must have a valid title (string, size 3-100).
- A case must have a valid category from the allowed enum.
- A case must have a description (string, max 2000).
- A case must have an array of images (max 30).
- Images are stored as strings (base64).
- Only authenticated admins can create, update, or delete cases.
- Anyone can read/list cases.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Attempting to create a case without signing in. (Expected: DENIED)
2. **Invalid ID**: Creating a case with a monster ID (1MB). (Expected: DENIED)
3. **Ghost Field**: Adding a `isVerified: true` field to a case. (Expected: DENIED)
4. **Invalid Category**: Setting category to "Magic". (Expected: DENIED)
5. **Image Flood**: Attempting to save 100 images in one case. (Expected: DENIED)
6. **Huge Image**: A single image string exceeding size limits. (Expected: DENIED)
7. **Title Injection**: Title containing scripts or malicious characters. (Expected: DENIED)
8. **Owner Spoofing**: Setting an `ownerId` if we had one (not applicable here as it's global admin, but we'll protect the whole collection).
9. **Update Locked Field**: Modifying `createdAt` during an update. (Expected: DENIED)
10. **Delete as Guest**: Unauthenticated user deleting a case. (Expected: DENIED)
11. **Admin Escalation**: Trying to create an admin document manually. (Expected: DENIED)
12. **Status Shortcutting**: (Not applicable, no status field yet).

## 3. Test Runner (Conceptual)
Tests will verify that these payloads fail against the `firestore.rules`.
