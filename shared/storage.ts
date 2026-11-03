/**
 * Small runtime guards for values parsed out of localStorage.
 *
 * Storage is untrusted input: a stale or hand-edited entry can carry any
 * shape, and spreading it into state (the previous approach) could inject
 * malformed objects into the cart. Validate before merging
 * (CONCERNS.md #23).
 */

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";

/** Safely parse a JSON string, returning null instead of throwing. */
export function safeJsonParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Keep only the keys of `defaults` whose stored value has the same typeof as
 * the default. Unknown keys are dropped, so a tampered payload cannot add
 * fields the app never expects.
 */
export function pickKnownShape<T extends Record<string, unknown>>(
  stored: unknown,
  defaults: T
): T {
  if (!isObject(stored)) return defaults;
  const out: Record<string, unknown> = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (key in stored && typeof stored[key] === typeof defaults[key]) {
      out[key] = stored[key];
    }
  }
  return out as T;
}

/** True when every element of the array passes the guard. */
export function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

export function hasStringFields(
  value: unknown,
  fields: readonly string[]
): value is Record<string, string> {
  return isObject(value) && fields.every((field) => isString(value[field]));
}
