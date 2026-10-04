/**
 * Media upload (role: PG_OWNER) — API_CONTRACT.md §MEDIA.
 * Bytes never touch the API server: presign -> direct PUT to R2 -> confirm metadata.
 *   POST /media/presign  -> { upload_url, key, public_url, expires_in }
 *   PUT  <upload_url>     (client -> R2, raw bytes, matching Content-Type, NO auth header)
 *   POST /media/confirm  { pg_id, key, public_url, kind } -> saved record
 *   GET  /media/{pgId}   -> array of media records
 *
 * `uploadMedia` runs the full three-step flow for a local file uri.
 */

import { http, endpoints } from './api';

export async function presignMedia({ pgId, filename, contentType, kind }) {
  return http.post(endpoints.mediaPresign, {
    pg_id: pgId,
    filename,
    content_type: contentType,
    kind, // 'image' | 'video'
  });
}

export async function confirmMedia({ pgId, key, publicUrl, kind }) {
  return http.post(endpoints.mediaConfirm, { pg_id: pgId, key, public_url: publicUrl, kind });
}

export async function getMedia(pgId) {
  return http.get(endpoints.media(pgId));
}

/**
 * Full upload: presign, PUT the bytes straight to R2, then confirm.
 * @param fileUri  local uri (expo-image-picker asset uri)
 * @returns the confirmed media record { id, pg_id, key, url, kind, created_at }
 */
export async function uploadMedia({ pgId, fileUri, filename, contentType, kind }) {
  const { upload_url, key, public_url } = await presignMedia({ pgId, filename, contentType, kind });

  const blob = await (await fetch(fileUri)).blob();
  const putRes = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!putRes.ok) throw new Error(`Upload to storage failed (${putRes.status})`);

  return confirmMedia({ pgId, key, publicUrl: public_url, kind });
}
