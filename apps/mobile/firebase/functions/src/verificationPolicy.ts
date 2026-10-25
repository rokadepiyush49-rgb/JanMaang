import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Who may record a verdict on a demand, and what the verdict does to it.
 *
 * Pure functions, separate from the Firestore transaction in
 * submitVerification.ts, so the rules that decide whether public money fixed
 * anything are unit-tested directly instead of only through the emulator.
 * The transaction gathers the facts; this file makes every decision.
 */

export type VerdictKind = 'citizen' | 'field';

export interface VerificationFacts {
  uid: string;
  /** The server-granted `officer` custom claim, never a client field. */
  isOfficer: boolean;
  kind: VerdictKind;
  /** The demand document's data, or null when it does not exist. */
  demand: { status?: unknown; reporterId?: unknown } | null;
  /** Whether demands/{id}/supporters/{uid} exists. */
  isSupporter: boolean;
  /** Whether this person already gave a verdict of this kind. */
  alreadyVerified: boolean;
}

/** Field verdicts need the officer claim; checked before any read. */
export function assertMayClaimKind(kind: VerdictKind, isOfficer: boolean): void {
  if (kind === 'field' && !isOfficer) {
    throw new HttpsError(
      'permission-denied',
      'Only a field officer can submit a field verification.',
    );
  }
}

/** Throws the error the caller should see, or returns when the verdict is allowed. */
export function assertMayVerify(facts: VerificationFacts): void {
  assertMayClaimKind(facts.kind, facts.isOfficer);

  if (facts.demand === null) {
    throw new HttpsError('not-found', 'That demand no longer exists.');
  }
  if (facts.demand.status !== 'inProgress') {
    throw new HttpsError(
      'failed-precondition',
      'This demand is not awaiting verification yet.',
    );
  }
  if (
    facts.kind === 'citizen' &&
    facts.demand.reporterId !== facts.uid &&
    !facts.isSupporter
  ) {
    throw new HttpsError(
      'permission-denied',
      'Only residents who raised or backed this demand can verify it.',
    );
  }
  if (facts.alreadyVerified) {
    throw new HttpsError('already-exists', 'You have already verified this demand.');
  }
}

/**
 * The demand's next status after a verdict, or null to leave it unchanged.
 *
 * A field officer's "fixed" alone never closes a demand — the citizens who
 * raised it get the final say — but anyone entitled to verify can reopen it.
 */
export function nextDemandStatus(
  isFixed: boolean,
  kind: VerdictKind,
): 'citizenVerified' | 'funded' | null {
  if (!isFixed) return 'funded';
  return kind === 'citizen' ? 'citizenVerified' : null;
}
