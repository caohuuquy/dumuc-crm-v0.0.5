/**
 * Phase 0: Security TDD "Dirty Dozen" Payload Verification Suite
 * Verifies all 12 adversarial payloads defined in security_spec.md against
 * the Eight Pillars invariants in firestore.rules.
 */

export interface DirtyDozenTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TEST_CASES: DirtyDozenTestCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Write',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: null,
    payload: { ownerId: 'user-1', segmentName: 'VIP' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Spoof',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: false },
    payload: { ownerId: 'user-1', segmentName: 'VIP' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing on Create',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-2', segmentName: 'VIP' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow/Ghost Field Injection',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-1', segmentName: 'VIP', isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Path ID Poisoning',
    collection: 'customer_segments',
    docId: 'invalid/id$poison!',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-1', segmentName: 'VIP' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Value Poisoning on String Boundary (>200 chars)',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-1', segmentName: 'A'.repeat(250) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Invalid Enum State',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-1', status: 'HackedStatus' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Client-Spoofed Timestamp on Create',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'create',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-1', createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Immutable Field Mutation on Update',
    collection: 'customer_segments',
    docId: 'seg-1',
    operation: 'update',
    auth: { uid: 'user-1', email_verified: true },
    payload: { ownerId: 'user-2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Terminal State Bypass',
    collection: 'customer_segments',
    docId: 'seg-terminal',
    operation: 'update',
    auth: { uid: 'user-1', email_verified: true },
    payload: { status: 'Mới' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Cross-Tenant Record Read',
    collection: 'customer_segments',
    docId: 'seg-owned-by-user-1',
    operation: 'get',
    auth: { uid: 'user-2', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unfiltered Blanket List Query',
    collection: 'proactive_reminders',
    docId: '*',
    operation: 'list',
    auth: { uid: 'user-2', email_verified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
