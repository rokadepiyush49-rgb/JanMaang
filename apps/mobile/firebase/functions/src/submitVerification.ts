import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import {
  parseChecklist,
  parseDemandId,
  parsePhotoUrls,
} from './verificationInput';
import {
  assertMayClaimKind,
  assertMayVerify,
  nextDemandStatus,
} from './verificationPolicy';

/**
 * Records a citizen's or field officer's verdict on completed work.
 *
 * Verification is the only step that decides whether public money actually
 * fixed anything, so it is written server-side: the client cannot mark its own
 * demand verified, and a "still broken" answer reopens the demand rather than
 * quietly closing it.
 *
 * Who may verify. Previously any signed-in account could send
 * `{ kind: 'citizen', isFixed: true }` for any demand and close it, or send
 * `isFixed: false` and reopen it. Now:
 *   - a `citizen` verdict needs the caller to be the demand's reporter or one
 *     of its supporters — the people the fix was for;
 *   - a `field` verdict needs the `officer` custom claim, which only the
 *     server grants;
 *   - one verdict per person per demand per kind, enforced by the document id
 *     inside the same transaction that changes the demand's status.
 */
export const submitVerification = onCall(
  { region: 'asia-south1', enforceAppCheck: true },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in to verify work.');
    }

    const uid = request.auth.uid;
    const demandId = parseDemandId(request.data?.demandId);
    const isFixed = request.data?.isFixed === true;
    const kind = request.data?.kind === 'field' ? 'field' : 'citizen';
    const checklist = parseChecklist(request.data?.checklist);
    const photoUrls = parsePhotoUrls(request.data?.photoUrls);

    const isOfficer = request.auth.token.officer === true;
    // Fail before any read when the claim is missing.
    assertMayClaimKind(kind, isOfficer);

    const db = getFirestore();
    const demandRef = db.collection('demands').doc(demandId);
    const verificationRef = db
      .collection('verifications')
      .doc(`${demandId}_${uid}_${kind}`);

    await db.runTransaction(async (tx) => {
      // Gather the facts here; verificationPolicy.ts makes every decision.
      const demandSnap = await tx.get(demandRef);
      const demand = demandSnap.exists ? (demandSnap.data() ?? {}) : null;
      const needsSupporterCheck =
        kind === 'citizen' && demand !== null && demand.reporterId !== uid;
      const isSupporter = needsSupporterCheck
        ? (await tx.get(demandRef.collection('supporters').doc(uid))).exists
        : false;
      const alreadyVerified = (await tx.get(verificationRef)).exists;

      assertMayVerify({ uid, isOfficer, kind, demand, isSupporter, alreadyVerified });

      tx.create(verificationRef, {
        demandId,
        verifierId: uid,
        kind,
        isFixed,
        checklist,
        photoUrls,
        at: new Date(),
      });

      const status = nextDemandStatus(isFixed, kind);
      if (status === 'citizenVerified') {
        tx.update(demandRef, { status });
      } else if (status === 'funded') {
        tx.update(demandRef, { status, reopenedAt: new Date() });
      }
    });

    return { ok: true };
  },
);
