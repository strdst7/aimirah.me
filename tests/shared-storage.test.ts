import { describe, expect, it } from "vitest";
import {
  hasStringFields,
  isArrayOf,
  isObject,
  pickKnownShape,
  safeJsonParse,
} from "../shared/storage";

describe("safeJsonParse", () => {
  it("returns null for missing or invalid input instead of throwing", () => {
    expect(safeJsonParse(null)).toBeNull();
    expect(safeJsonParse("")).toBeNull();
    expect(safeJsonParse("{not json")).toBeNull();
  });

  it("parses valid JSON", () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonParse("[1,2]")).toEqual([1, 2]);
  });
});

describe("isObject", () => {
  it("rejects null, arrays and primitives", () => {
    expect(isObject(null)).toBe(false);
    expect(isObject([])).toBe(false);
    expect(isObject("x")).toBe(false);
    expect(isObject(3)).toBe(false);
  });

  it("accepts plain objects", () => {
    expect(isObject({})).toBe(true);
  });
});

describe("pickKnownShape", () => {
  const defaults = { name: "", count: 0, enabled: false };

  it("drops unknown keys so tampered payloads cannot add fields", () => {
    const result = pickKnownShape({ name: "x", evil: "<script>" }, defaults);
    expect(result).toEqual({ name: "x", count: 0, enabled: false });
    expect("evil" in result).toBe(false);
  });

  it("ignores values whose type does not match the default", () => {
    const result = pickKnownShape({ name: 42, count: "nope" }, defaults);
    expect(result).toEqual(defaults);
  });

  it("returns defaults for non-object input", () => {
    expect(pickKnownShape(null, defaults)).toEqual(defaults);
    expect(pickKnownShape("str", defaults)).toEqual(defaults);
  });
});

describe("hasStringFields", () => {
  it("requires every listed field to be a string", () => {
    expect(hasStringFields({ a: "x", b: "y" }, ["a", "b"])).toBe(true);
    expect(hasStringFields({ a: "x" }, ["a", "b"])).toBe(false);
    expect(hasStringFields({ a: "x", b: 1 }, ["a", "b"])).toBe(false);
    expect(hasStringFields(null, ["a"])).toBe(false);
  });
});

describe("isArrayOf", () => {
  const isNumber = (v: unknown): v is number => typeof v === "number";

  it("accepts arrays where every item passes", () => {
    expect(isArrayOf([1, 2, 3], isNumber)).toBe(true);
  });

  it("rejects arrays with a bad item, and non-arrays", () => {
    expect(isArrayOf([1, "2"], isNumber)).toBe(false);
    expect(isArrayOf("nope", isNumber)).toBe(false);
  });
});
