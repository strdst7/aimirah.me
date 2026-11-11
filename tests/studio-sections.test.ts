import { describe, expect, it } from "vitest";
import { sectionReferences } from "../kdmirah-studio/src/data/sectionReferences";

describe("section references", () => {
  it("indexes all 70 unique source references", () => {
    expect(sectionReferences).toHaveLength(70);
    expect(new Set(sectionReferences.map((section) => section.slug)).size).toBe(70);
  });

  it("keeps each source link identifier within the original collection", () => {
    for (const section of sectionReferences) {
      expect(section.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(section.title.trim()).not.toBe("");
      expect(section.category.trim()).not.toBe("");
    }
  });
});
