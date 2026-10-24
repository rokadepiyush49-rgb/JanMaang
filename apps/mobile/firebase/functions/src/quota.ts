import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Per-user call budgets for the paid callables.
 *
 * `maxInstances` caps how many calls run at once, not how many one account
 * makes, so a single signed-in script could otherwise spend the Gemini budget
 * alone. Counters live in Firestore so every function instance shares them;
 * firestore.rules has no match for `rateLimits`, so clients can neither read
 * nor reset their own.
 */
export async function takeQuota(
  uid: string,
  name: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  const db = getFirestore();
  const ref = db.collection('rateLimits').doc(`${name}_${uid}`);
  const now = Date.now();

  const allowed = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() as { windowStart?: number; count?: number } | undefined;
    const fresh = !data?.windowStart || now - data.windowStart >= windowMs;
    const count = fresh ? 0 : (data?.count ?? 0);
    if (count >= limit) return false;
    tx.set(ref, {
      windowStart: fresh ? now : data!.windowStart,
      count: count + 1,
    });
    return true;
  });

  if (!allowed) {
    throw new HttpsError(
      'resource-exhausted',
      'You have sent a lot of reports in a short time. Please try again later.',
    );
  }
}
