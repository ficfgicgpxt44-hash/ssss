# Security Specification - Sami Ali Portfolio

## Data Invariants
1. `users`:
   - Document ID must match the `uid` field.
   - Only the user themselves or an admin can write.
   - `role` cannot be changed by the user themselves (must be initialized by system or admin).
2. `cases`:
   - Must have a valid `ownerId` matching the creator's UID.
   - Only the owner can update/delete.
   - Publicly readable.
3. `cv`:
   - Document ID must match the `ownerId` or user UID.
   - Only the owner can write.
   - Publicly readable.

## The Dirty Dozen (Vulnerability Test Payloads)

1. **Identity Spoofing (Create Case)**: Attempt to create a case with `ownerId` of another user.
2. **Identity Spoofing (Update Case)**: Attempt to update a case I don't own.
3. **Privilege Escalation**: Attempt to update my own `role` to 'admin'.
4. **State Shortcutting**: (N/A for this simple app, but maybe modifying `createdAt`?)
5. **Resource Poisoning (ID)**: Attempt to use a 2KB string as a `caseId`.
6. **Resource Poisoning (Field)**: Attempt to inject a 10MB string into `description`.
7. **Type Mismatch (Case)**: Set `images` to a string instead of a list.
8. **Orphaned Write**: Create a case with a `category` that doesn't exist in enum.
9. **Missing Required Fields**: Create a case without a `title`.
10. **Shadow Update**: Add a `isVerified: true` field to a case.
11. **PII Leak**: (N/A for public cases, but maybe user emails?)
12. **Query Scraping**: Attempt to list all users without auth.

## The Test Runner (firestore.rules.test.ts)
(Logic described, to be implemented if testing environment was available)
1. Verify `get` on a case by anyone returns 200.
2. Verify `write` on a case by non-owner returns 403.
3. Verify `update` on `user.role` returns 403.
4. Verify `create` on case with wrong `ownerId` returns 403.
