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
export interface QuotaWindow {
  windowStart?: number;
  count?: number;
}

/**
 * The fixed-window decision, separate from the transaction so it can be
 * unit-tested. Returns the counter to write, or no write when refused.
 */
export function consumeQuota(
  current: QuotaWindow | undefined,
  now: number,
  limit: number,
  windowMs: number,
): { allowed: boolean; next?: Required<QuotaWindow> } {
  const fresh = !current?.windowStart || now - current.windowStart >= windowMs;
  const windowStart = fresh ? now : current!.windowStart!;
  const count = fresh ? 0 : (current?.count ?? 0);
  if (count >= limit) return { allowed: false };
  return { allowed: true, next: { windowStart, count: count + 1 } };
}

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
    const result = consumeQuota(snap.data() as QuotaWindow | undefined, now, limit, windowMs);
    if (result.next) tx.set(ref, result.next);
    return result.allowed;
  });

  if (!allowed) {
    throw new HttpsError(
      'resource-exhausted',
      'You have sent a lot of reports in a short time. Please try again later.',
    );
  }
}
