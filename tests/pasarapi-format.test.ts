import { describe, expect, it } from "vitest";
import { fmtInt, fmtRate } from "../pasarapi-mini-bounty-announcement/src/lib/api";

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
