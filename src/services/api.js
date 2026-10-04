/**
 * HTTP client for the PG Management backend (see API_CONTRACT.md).
 *
 * Services call `http.get/post/patch/del` with a path from `endpoints`. The client
 * injects the Bearer token, serialises JSON bodies, applies a timeout, and normalises
 * errors into `ApiError` carrying the contract's `{ detail }` message and status code.
 *
 * `request()`/`delay()` remain exported for the mock fallbacks used by features the
 * backend contract does not yet cover (enquiries, bookings, leads). See
 * UNSUPPORTED_ENDPOINTS.md.
 */

import { config, endpoints } from '@/config';

export const API_CONFIG = {
  baseUrl: config.apiUrl,
  timeout: config.timeout,
};

export { endpoints };

/** Error thrown for any non-2xx response or transport failure. */
export class ApiError extends Error {
  constructor(message, { status = 0, detail = null, body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.body = body;
    this.isNetworkError = status === 0;
  }
}

// --- Auth token wiring -----------------------------------------------------
// The auth store registers a getter here so the client can attach the Bearer
// token without importing the store (avoids a service <-> store import cycle).
let _tokenProvider = () => null;

export function setAuthTokenProvider(fn) {
  _tokenProvider = typeof fn === 'function' ? fn : () => null;
}

// --- Request building ------------------------------------------------------
function buildUrl(path, query) {
  const base = API_CONFIG.baseUrl.replace(/\/+$/, '');
  let url = /^https?:\/\//.test(path) ? path : `${base}${path}`;
  if (query && typeof query === 'object') {
    const parts = [];
    for (const [key, value] of Object.entries(query)) {
      if (value == null) continue;
      // Arrays become repeated params (e.g. ?amenities=WiFi&amenities=AC).
      if (Array.isArray(value)) {
        value.forEach((v) => v != null && parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`));
      } else {
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    if (parts.length) url += (url.includes('?') ? '&' : '?') + parts.join('&');
  }
  return url;
}

/**
 * Core fetch wrapper.
 * @param {string} method
 * @param {string} path  path from `endpoints` (or absolute URL)
 * @param {object} opts  { body, query, auth=true, headers, timeout, raw=false }
 */
async function httpRequest(method, path, opts = {}) {
  const { body, query, auth = true, headers = {}, timeout = API_CONFIG.timeout, raw = false } = opts;

  const finalHeaders = { Accept: 'application/json', ...headers };
  if (auth) {
    const token = _tokenProvider();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const init = { method, headers: finalHeaders };
  if (body !== undefined && body !== null) {
    finalHeaders['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  init.signal = controller.signal;

  let res;
  try {
    res = await fetch(buildUrl(path, query), init);
  } catch (e) {
    clearTimeout(timer);
    const aborted = e?.name === 'AbortError';
    throw new ApiError(aborted ? 'Request timed out' : 'Network request failed', {
      status: 0,
    });
  }
  clearTimeout(timer);

  if (raw) return res; // caller handles the Response (e.g. direct R2 PUT)

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    throw new ApiError(extractDetail(data) || `Request failed (${res.status})`, {
      status: res.status,
      detail: extractDetail(data),
      body: data,
    });
  }
  return data;
}

/** Pull a human-readable message out of the contract's error shapes. */
function extractDetail(data) {
  if (!data) return null;
  if (typeof data === 'string') return data;
  const d = data.detail;
  if (!d) return null;
  if (typeof d === 'string') return d;
  // 422 validation: [{ loc, msg, type }]
  if (Array.isArray(d)) return d.map((x) => x?.msg).filter(Boolean).join(', ') || 'Validation error';
  return null;
}

export const http = {
  get: (path, opts) => httpRequest('GET', path, opts),
  post: (path, body, opts) => httpRequest('POST', path, { ...opts, body }),
  patch: (path, body, opts) => httpRequest('PATCH', path, { ...opts, body }),
  del: (path, opts) => httpRequest('DELETE', path, opts),
  put: (path, body, opts) => httpRequest('PUT', path, { ...opts, body }),
  raw: (method, path, opts) => httpRequest(method, path, { ...opts, raw: true }),
};

// --- Mock helpers (for backend-unsupported features only) ------------------
const LATENCY_MS = 350;

export function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Resolve `data` after a simulated round-trip — used only by mock fallbacks. */
export async function request(data, options = {}) {
  const { latency = LATENCY_MS } = options;
  await delay(latency);
  return typeof data === 'function' ? data() : deepClone(data);
}

function deepClone(value) {
  if (value == null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}
