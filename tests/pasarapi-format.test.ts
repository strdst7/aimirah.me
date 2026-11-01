import { describe, expect, it } from "vitest";
import { fmtInt, fmtRate, fmtRM } from "../pasarapi-mini-bounty-announcement/src/lib/api";

describe("fmtRM", () => {
  it("formats with 2 decimals by default", () => {
    expect(fmtRM(2.5)).toBe("2.50");
    expect(fmtRM(0)).toBe("0.00");
  });

  it("respects a custom decimal count", () => {
    expect(fmtRM(1.23456, 3)).toBe("1.235");
  });

  it("returns a placeholder for missing values", () => {
    expect(fmtRM(null)).toBe("--.--");
    expect(fmtRM(undefined)).toBe("--.--");
    expect(fmtRM(Number.NaN)).toBe("--.--");
  });
});

describe("fmtRate", () => {
  it("scales precision down as the value shrinks", () => {
    expect(fmtRate(1.23456789)).toBe("1.2346");
    expect(fmtRate(0.05)).toBe("0.05000");
    expect(fmtRate(0.0005)).toBe("0.000500");
  });

  it("returns an em dash for missing values", () => {
    expect(fmtRate(null)).toBe("\u2014");
    expect(fmtRate(undefined)).toBe("\u2014");
    expect(fmtRate(Number.NaN)).toBe("\u2014");
  });
});

describe("fmtInt", () => {
  it("rounds and groups digits", () => {
    expect(fmtInt(1234.6)).toBe("1,235");
    expect(fmtInt(0)).toBe("0");
  });
});
