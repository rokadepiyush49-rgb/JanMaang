import { HttpsError } from 'firebase-functions/v2/https';

/**
 * Validation for the submitVerification payload, kept apart from the handler
 * so it can be unit-tested without the emulator.
 *
 * Everything here used to be stored as sent: any string as a document id,
 * any object as the checklist, any URL as evidence — including
 * `javascript:` links and third-party trackers that every viewer of the
 * public verification record would then load.
 */

const DEMAND_ID = /^[A-Za-z0-9_-]{1,128}$/;
const MAX_CHECKLIST = 20;
const MAX_LABEL = 200;
const MAX_PHOTOS = 10;

/** Only this project's own Storage may be cited as evidence. */
const EVIDENCE_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
]);

export function parseDemandId(value: unknown): string {
  // A '/' would address a sub-collection path instead of a demand.
  if (typeof value !== 'string' || !DEMAND_ID.test(value)) {
    throw new HttpsError('invalid-argument', 'Which demand is this about?');
  }
  return value;
}

export function parseChecklist(
  value: unknown,
): { label: string; done: boolean }[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_CHECKLIST) {
    throw new HttpsError('invalid-argument', 'That checklist is not valid.');
  }
  return value.map((item) => {
    const label = (item as { label?: unknown })?.label;
    const done = (item as { done?: unknown })?.done;
    if (
      typeof label !== 'string' ||
      label.length === 0 ||
      label.length > MAX_LABEL ||
      typeof done !== 'boolean'
    ) {
      throw new HttpsError('invalid-argument', 'That checklist is not valid.');
    }
    return { label, done };
  });
}

export function parsePhotoUrls(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_PHOTOS) {
    throw new HttpsError('invalid-argument', 'Too many photographs.');
  }
  return value.map((raw) => {
    if (typeof raw !== 'string' || raw.length > 2048) {
      throw new HttpsError('invalid-argument', 'That photograph link is not valid.');
    }
    let url: URL;
    try {
      url = new URL(raw);
    } catch {
      throw new HttpsError('invalid-argument', 'That photograph link is not valid.');
    }
    if (url.protocol !== 'https:' || !EVIDENCE_HOSTS.has(url.hostname)) {
      throw new HttpsError(
        'invalid-argument',
        'Evidence must be uploaded through the app.',
      );
    }
    return url.toString();
  });
}
