# Phase 0: Payload-First Security TDD Specification

## 1. Data Invariants
1. **Default-Deny Catch-All**: Any path not explicitly matched (`/customer_segments/{segmentId}`, `/proactive_reminders/{reminderId}`, `/employees/{employeeId}`) is denied for all `read` and `write` operations.
2. **Verified Authentication**: Every read and write requires `request.auth != null && request.auth.token.email_verified == true`.
3. **Strict Path ID Validation**: Every single-document operation (`get`, `create`, `update`, `delete`) validates `segmentId` / `reminderId` / `employeeId` via `isValidId(id)` (`1..128` chars matching `^[a-zA-Z0-9_\-]+$`).
4. **Owner Isolation & Anti-Spoofing**: `ownerId` must equal `request.auth.uid` on creation, remain immutable on update, and match `resource.data.ownerId == request.auth.uid` on `get`, `list`, `update`, and `delete`.
5. **Strict Key Allowlisting**: `hasAll` and `hasOnly` enforce exact schema keys on `create` and `update`, and `affectedKeys().hasOnly(...)` restricts update mutations to explicit action fields.
6. **Temporal Integrity**: `createdAt == request.time` and `updatedAt == request.time` on `create`; `createdAt == resource.data.createdAt` and `updatedAt == request.time` on `update`.
7. **Terminal State Locking**: Once a record reaches terminal status `'Khách hàng từ chối'`, subsequent updates are rejected.

## 2. The "Dirty Dozen" Payloads (All Must Return `PERMISSION_DENIED`)
1. **Unauthenticated Write**: `auth = null`, creating a `/employees/emp-1` document.
2. **Unverified Email Spoof**: `auth = { uid: 'user-1', token: { email_verified: false } }`, attempting to create `/employees/emp-1`.
3. **Identity Spoofing on Create**: `auth.uid = 'user-1'`, payload sets `ownerId: 'user-2'`.
4. **Shadow/Ghost Field Injection**: Payload includes required fields plus `isAdmin: true`.
5. **Path ID Poisoning**: Document ID contains illegal characters or > 128 chars.
6. **Value Poisoning on String Boundary**: `name` exceeds `maxLength: 150` chars.
7. **Invalid Enum State**: `status` set to `'HackedStatus'` outside allowed enum list.
8. **Client-Spoofed Timestamp on Create**: `createdAt` set to a past timestamp (`!= request.time`).
9. **Immutable Field Mutation on Update**: Updating `ownerId` or `createdAt` on an existing document.
10. **Terminal State Bypass**: Updating a document whose existing `status` is `'Khách hàng từ chối'`.
11. **Cross-Tenant PII/Record Read**: `user-2` attempting `get` on an `/employees/emp-1` document owned by `user-1`.
12. **Unfiltered Blanket List Query**: Listing `/employees` without `where('ownerId', '==', request.auth.uid)`.
