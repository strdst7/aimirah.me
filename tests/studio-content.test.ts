import { describe, expect, it } from "vitest";
import { durationSeconds, sortVideos, type Video } from "../kdmirah-studio/src/lib/content";

const video = (author: string, duration: string): Video =>
  ({ slug: `${author}-${duration}`, author, duration }) as Video;

describe("durationSeconds", () => {
  it("parses m:ss", () => {
    expect(durationSeconds("0:31")).toBe(31);
    expect(durationSeconds("12:05")).toBe(725);
  });

  it("treats malformed segments as zero rather than NaN", () => {
    expect(durationSeconds("abc")).toBe(0);
    expect(durationSeconds("3:xx")).toBe(180);
  });
});

describe("sortVideos", () => {
  const list = [video("cam", "2:00"), video("alice", "0:45"), video("bob", "1:30")];

  it("does not mutate the input array", () => {
    const snapshot = [...list];
    sortVideos(list, "az");
    expect(list).toEqual(snapshot);
  });

  it("sorts alphabetically by author", () => {
    expect(sortVideos(list, "az").map((v) => v.author)).toEqual(["alice", "bob", "cam"]);
  });

  it("sorts by duration", () => {
    expect(sortVideos(list, "shortest").map((v) => v.author)).toEqual(["alice", "bob", "cam"]);
    expect(sortVideos(list, "longest").map((v) => v.author)).toEqual(["cam", "bob", "alice"]);
  });

  it("reverses for newest", () => {
    expect(sortVideos(list, "newest").map((v) => v.author)).toEqual(["bob", "alice", "cam"]);
  });

  it("returns insertion order for unknown sorts", () => {
    expect(sortVideos(list, "whatever").map((v) => v.author)).toEqual(["cam", "alice", "bob"]);
  });
});
