import { useCallback, useEffect, useRef, useState } from 'react';

const CATALOGUE = 'https://api.data.gov.my/data-catalogue';

interface QuerySpec {
  id: string;
  limit?: number;
  sort?: string;
  filters?: Record<string, string>;
}

function buildUrl(spec: QuerySpec, withFilters: boolean): string {
  const p = new URLSearchParams();
  p.set('id', spec.id);
  if (spec.limit) p.set('limit', String(spec.limit));
  if (spec.sort) p.set('sort', spec.sort);
  if (withFilters && spec.filters) {
    Object.entries(spec.filters).forEach(([k, v]) => p.append('filter', `${k}@${v}`));
  }
  return `${CATALOGUE}?${p.toString()}`;
}

async function getJson<Row>(url: string, timeoutMs = 14000): Promise<Row[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!Array.isArray(json) || json.length === 0) throw new Error('EMPTY_RESPONSE');
    return json as Row[];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * In-flight request cache.
 *
 * Several sections read the same datasets on first paint (Ticker + FuelSection
 * both want `fuelprice`, Ticker + ForexSection both want
 * `exchangerates_daily_1200`). Keying on the final URL collapses those into a
 * single network call and keeps them collapsed during retries, which matters
 * because the public API is rate limited (CONCERNS.md #19).
 */
const inFlight = new Map<string, Promise<unknown>>();

function cachedJson<Row>(url: string, timeoutMs = 14000): Promise<Row[]> {
  const existing = inFlight.get(url) as Promise<Row[]> | undefined;
  if (existing) return existing;
  const request = getJson<Row>(url, timeoutMs).finally(() => {
    inFlight.delete(url);
  });
  inFlight.set(url, request);
  return request;
}

/**
 * Fetch a data.gov.my catalogue dataset.
 * Server-side `filter` params are attempted first (per official docs);
 * if that request fails we retry unfiltered so callers can filter client-side.
 */
export async function fetchCatalogue<Row>(spec: QuerySpec): Promise<Row[]> {
  if (spec.filters && Object.keys(spec.filters).length > 0) {
    try {
      return await cachedJson<Row>(buildUrl(spec, true));
    } catch (error) {
      // Server-side filtering is best-effort; fall back to an unfiltered pull
      // so the caller can filter client-side. Warn rather than swallow so a
      // persistent failure is visible in the console (CONCERNS.md #24).
      console.warn(`[api] filtered request failed for "${spec.id}", retrying unfiltered:`, error);
    }
  }
  return cachedJson<Row>(buildUrl(spec, false));
}

export async function fetchJson<T>(url: string, timeoutMs = 16000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Tiny data-fetching hook with manual retry. */
export function useAsyncData<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let alive = true;
    setState(s => ({ ...s, loading: true, error: null }));
    loaderRef
      .current()
      .then(data => alive && setState({ data, loading: false, error: null }))
      .catch(e => alive && setState({ data: null, loading: false, error: e?.message ?? 'FETCH_FAILED' }));
    return () => {
      alive = false;
    };
  }, [nonce]);

  const retry = useCallback(() => setNonce(n => n + 1), []);
  return { ...state, retry };
}

/* --------------------------- formatting --------------------------- */

export const fmtRate = (v: number | null | undefined) => {
  if (v == null || Number.isNaN(v)) return '—';
  if (v < 0.001) return v.toFixed(6);
  if (v < 0.1) return v.toFixed(5);
  return v.toFixed(4);
};

export const fmtInt = (v: number) => Math.round(v).toLocaleString('en-MY');

export const fmtDay = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-MY', { day: '2-digit', month: 'short' });

export const fmtDayYear = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
