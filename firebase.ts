import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeForFirestore<T>(value: T): T {
  if (value === undefined || typeof value === 'function') {
    return null as unknown as T;
  }
  if (value === null || typeof value !== 'object' || value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [k, v] of Object.entries(value as Record<string, any>)) {
    if (v !== undefined && typeof v !== 'function') {
      result[k] = sanitizeForFirestore(v);
    }
  }
  return result as T;
}

export function toValidDocId(rawId: unknown, fallbackIndex: number): string {
  const str = rawId !== undefined && rawId !== null ? String(rawId).trim() : '';
  const cleaned = str.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  return cleaned.length > 0 ? cleaned : `doc_${fallbackIndex}`;
}

export function getDocIdForItem(item: any, index: number, idField?: string): string {
  if (item && typeof item === 'object') {
    const candidate =
      (idField && item[idField] !== undefined ? item[idField] : undefined) ??
      item.id ??
      item.code ??
      item.cccd ??
      item.poCode ??
      item.ro ??
      item.productId;
    if (candidate !== undefined && candidate !== null && String(candidate).trim() !== '') {
      return toValidDocId(candidate, index);
    }
  }
  return `doc_${index}`;
}

export async function firestoreAddDocument(
  collectionName: string,
  data: Record<string, any>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), sanitizeForFirestore(data));
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionName);
  }
}

export async function firestoreSetDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  const safeId = toValidDocId(docId, 0);
  try {
    await setDoc(doc(db, collectionName, safeId), sanitizeForFirestore(data));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${safeId}`);
  }
}

export async function firestoreUpdateDocument(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  const safeId = toValidDocId(docId, 0);
  try {
    await updateDoc(doc(db, collectionName, safeId), sanitizeForFirestore(data));
  } catch (error) {
    try {
      await setDoc(doc(db, collectionName, safeId), sanitizeForFirestore(data), { merge: true });
    } catch (innerError) {
      handleFirestoreError(innerError, OperationType.UPDATE, `${collectionName}/${safeId}`);
    }
  }
}

export async function firestoreDeleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  const safeId = toValidDocId(docId, 0);
  try {
    await deleteDoc(doc(db, collectionName, safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${safeId}`);
  }
}

/**
 * Real-time Cloud Firestore collection hook with automatic initial seeding.
 * Preserves exact React useState tuple signature [state, setState].
 */
export function useFirestoreCollection<T>(
  collectionName: string,
  initialData: T[] | (() => T[]),
  idField?: string,
  onSyncCallback?: (items: T[]) => void
): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const [items, setItemsInternal] = useState<T[]>(initialData);
  const itemsRef = useRef<T[]>(items);
  const seededRef = useRef<boolean>(false);
  const isSeedingRef = useRef<boolean>(false);
  const onSyncRef = useRef(onSyncCallback);
  onSyncRef.current = onSyncCallback;

  useEffect(() => {
    const colRef = collection(db, collectionName);
    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        if (snapshot.empty) {
          if (!seededRef.current && !isSeedingRef.current && itemsRef.current.length > 0) {
            isSeedingRef.current = true;
            try {
              const serverSnap = await getDocs(colRef);
              if (serverSnap.empty) {
                seededRef.current = true;
                const seedPromises = itemsRef.current.map((item, idx) => {
                  const docId = getDocIdForItem(item, idx, idField);
                  const payload = sanitizeForFirestore({
                    ...(item as Record<string, any>),
                    _order: idx,
                  });
                  return setDoc(doc(db, collectionName, docId), payload);
                });
                await Promise.all(seedPromises);
              }
            } catch (err) {
              try {
                handleFirestoreError(err, OperationType.WRITE, collectionName);
              } catch {
                // Error already logged in handleFirestoreError
              }
            } finally {
              isSeedingRef.current = false;
            }
          }
          return;
        }

        seededRef.current = true;
        const docsWithOrder = snapshot.docs.map((d, idx) => {
          const raw = d.data() as Record<string, any>;
          const order = typeof raw._order === 'number' ? raw._order : idx;
          const cleaned: Record<string, any> = {};
          for (const [k, v] of Object.entries(raw)) {
            if (k !== '_order') {
              cleaned[k] = v;
            }
          }
          return { item: cleaned as T, order };
        });

        docsWithOrder.sort((a, b) => a.order - b.order);
        const loadedItems = docsWithOrder.map((entry) => entry.item);
        itemsRef.current = loadedItems;
        setItemsInternal(loadedItems);
        if (onSyncRef.current) {
          onSyncRef.current(loadedItems);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, collectionName);
        } catch {
          // Error logged by handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [collectionName, idField]);

  const setItems: React.Dispatch<React.SetStateAction<T[]>> = useCallback(
    (updaterOrValue) => {
      const prevItems = itemsRef.current;
      const nextItems =
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: T[]) => T[])(prevItems)
          : updaterOrValue;

      itemsRef.current = nextItems;
      setItemsInternal(nextItems);
      if (onSyncRef.current) {
        onSyncRef.current(nextItems);
      }

      // Sync diff with Cloud Firestore (addDoc / setDoc / updateDoc / deleteDoc)
      const prevMap = new Map<string, { item: T; index: number }>();
      prevItems.forEach((item, idx) => {
        prevMap.set(getDocIdForItem(item, idx, idField), { item, index: idx });
      });

      const nextMap = new Map<string, { item: T; index: number }>();
      nextItems.forEach((item, idx) => {
        nextMap.set(getDocIdForItem(item, idx, idField), { item, index: idx });
      });

      // Handle creates and updates
      nextMap.forEach(({ item, index }, docId) => {
        const payload = sanitizeForFirestore({
          ...(item as Record<string, any>),
          _order: index,
        });
        const prevEntry = prevMap.get(docId);
        if (!prevEntry) {
          const hasExplicitId =
            item &&
            typeof item === 'object' &&
            ((idField && (item as any)[idField] !== undefined) ||
              (item as any).id !== undefined ||
              (item as any).code !== undefined ||
              (item as any).cccd !== undefined ||
              (item as any).poCode !== undefined ||
              (item as any).ro !== undefined ||
              (item as any).productId !== undefined);

          if (hasExplicitId) {
            setDoc(doc(db, collectionName, docId), payload).catch((err) => {
              try {
                handleFirestoreError(err, OperationType.CREATE, `${collectionName}/${docId}`);
              } catch {
                // Logged
              }
            });
          } else {
            addDoc(collection(db, collectionName), payload).catch((err) => {
              try {
                handleFirestoreError(err, OperationType.CREATE, collectionName);
              } catch {
                // Logged
              }
            });
          }
        } else {
          const changed =
            prevEntry.index !== index ||
            JSON.stringify(prevEntry.item) !== JSON.stringify(item);
          if (changed) {
            updateDoc(doc(db, collectionName, docId), payload).catch(async () => {
              try {
                await setDoc(doc(db, collectionName, docId), payload, { merge: true });
              } catch (innerErr) {
                try {
                  handleFirestoreError(innerErr, OperationType.UPDATE, `${collectionName}/${docId}`);
                } catch {
                  // Logged
                }
              }
            });
          }
        }
      });

      // Handle deletes
      prevMap.forEach((_, docId) => {
        if (!nextMap.has(docId)) {
          deleteDoc(doc(db, collectionName, docId)).catch((err) => {
            try {
              handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
            } catch {
              // Logged
            }
          });
        }
      });
    },
    [collectionName, idField]
  );

  return [items, setItems];
}

/**
 * Real-time Cloud Firestore document/map hook with automatic initial seeding.
 * Preserves exact React useState tuple signature [state, setState].
 */
export function useFirestoreRecord<T>(
  collectionName: string,
  docId: string,
  initialData: T | (() => T)
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [record, setRecordInternal] = useState<T>(initialData);
  const recordRef = useRef<T>(record);
  const seededRef = useRef<boolean>(false);
  const safeDocId = toValidDocId(docId, 0);

  useEffect(() => {
    const docRef = doc(db, collectionName, safeDocId);
    const unsubscribe = onSnapshot(
      docRef,
      async (snap) => {
        if (!snap.exists()) {
          if (!seededRef.current) {
            seededRef.current = true;
            try {
              await setDoc(docRef, {
                payload: sanitizeForFirestore(recordRef.current),
                updatedAt: new Date().toISOString(),
              });
            } catch (err) {
              try {
                handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${safeDocId}`);
              } catch {
                // Logged
              }
            }
          }
          return;
        }
        seededRef.current = true;
        const data = snap.data();
        if (data && 'payload' in data) {
          recordRef.current = data.payload as T;
          setRecordInternal(data.payload as T);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, `${collectionName}/${safeDocId}`);
        } catch {
          // Logged
        }
      }
    );

    return () => unsubscribe();
  }, [collectionName, safeDocId]);

  const setRecord: React.Dispatch<React.SetStateAction<T>> = useCallback(
    (updaterOrValue) => {
      const prev = recordRef.current;
      const next =
        typeof updaterOrValue === 'function'
          ? (updaterOrValue as (prev: T) => T)(prev)
          : updaterOrValue;

      recordRef.current = next;
      setRecordInternal(next);

      const docRef = doc(db, collectionName, safeDocId);
      const payload = {
        payload: sanitizeForFirestore(next),
        updatedAt: new Date().toISOString(),
      };
      updateDoc(docRef, payload).catch(async () => {
        try {
          await setDoc(docRef, payload);
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.UPDATE, `${collectionName}/${safeDocId}`);
          } catch {
            // Logged
          }
        }
      });
    },
    [collectionName, safeDocId]
  );

  return [record, setRecord];
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    testConnection();
  }
});
