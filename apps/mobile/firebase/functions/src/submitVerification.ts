import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import {
  parseChecklist,
  parseDemandId,
  parsePhotoUrls,
} from './verificationInput';

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

    if (kind === 'field' && request.auth.token.officer !== true) {
      throw new HttpsError(
        'permission-denied',
        'Only a field officer can submit a field verification.',
      );
    }

    const db = getFirestore();
    const demandRef = db.collection('demands').doc(demandId);
    const verificationRef = db
      .collection('verifications')
      .doc(`${demandId}_${uid}_${kind}`);

    await db.runTransaction(async (tx) => {
      const demand = await tx.get(demandRef);
      if (!demand.exists) {
        throw new HttpsError('not-found', 'That demand no longer exists.');
      }
      if (demand.data()?.status !== 'inProgress') {
        throw new HttpsError(
          'failed-precondition',
          'This demand is not awaiting verification yet.',
        );
      }

      if (kind === 'citizen') {
        const isReporter = demand.data()?.reporterId === uid;
        const supporter = isReporter
          ? null
          : await tx.get(demandRef.collection('supporters').doc(uid));
        if (!isReporter && !supporter?.exists) {
          throw new HttpsError(
            'permission-denied',
            'Only residents who raised or backed this demand can verify it.',
          );
        }
      }

      if ((await tx.get(verificationRef)).exists) {
        throw new HttpsError(
          'already-exists',
          'You have already verified this demand.',
        );
      }

      tx.create(verificationRef, {
        demandId,
        verifierId: uid,
        kind,
        isFixed,
        checklist,
        photoUrls,
        at: new Date(),
      });

      // A field officer's sign-off alone does not close a demand; the citizens
      // who reported it get the final say.
      if (isFixed && kind === 'citizen') {
        tx.update(demandRef, { status: 'citizenVerified' });
      } else if (!isFixed) {
        tx.update(demandRef, { status: 'funded', reopenedAt: new Date() });
      }
    });

    return { ok: true };
  },
);
