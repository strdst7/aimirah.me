import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mockedProjects = vi.hoisted(() => ({
  current: [] as Array<{ index: string; title: string; href: string }>,
  kdmirah: [] as Array<{ index: string; title: string; href: string }>,
}));

vi.mock("../clone-reframed-online-website/src/lib/links", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../clone-reframed-online-website/src/lib/links")>()),
  get STANDALONE_PROJECTS() { return mockedProjects.current; },
  get KDMIRAH_PROJECTS() { return mockedProjects.kdmirah; },
}));

import IndexSection from "../clone-reframed-online-website/src/components/IndexSection";

const realProjects = (await vi.importActual<typeof import("../clone-reframed-online-website/src/lib/links")>("../clone-reframed-online-website/src/lib/links")).STANDALONE_PROJECTS;
const realKdmirahProjects = (await vi.importActual<typeof import("../clone-reframed-online-website/src/lib/links")>("../clone-reframed-online-website/src/lib/links")).KDMIRAH_PROJECTS;

function projectLinks(markup: string) {
  const section = markup.split("Standalone projects")[1];
  expect(section).toBeDefined();
  return [...section.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
}

describe("standalone project links", () => {
  it("renders three checked destinations in order with safe new-tab names", () => {
    mockedProjects.current = [...realProjects];
    mockedProjects.kdmirah = [];
    const markup = renderToStaticMarkup(createElement(IndexSection));
    const links = projectLinks(markup);
    expect(links).toHaveLength(3);
    expect(realProjects.map(({ index, title, href }) => [index, title, href])).toEqual([
      ["01", "PASAR.DATA", "https://pasarapi-mini-bounty-announcement.vercel.app/"],
      ["02", "MI4Inc. Motion Study", "https://mi4inc.com"],
      ["03", "kdmirah Studio", "https://kdmirah-studio.vercel.app/"],
    ]);
    for (const [i, [, attributes, content]] of links.entries()) {
      expect(attributes).toContain(`href="${realProjects[i].href}"`);
      expect(attributes).toContain('target="_blank"');
      expect(attributes).toContain('rel="noopener noreferrer"');
      expect(attributes).toContain("focus-visible:outline-signal");
      expect(content).toContain(`text-signal\">${realProjects[i].index}</span>`);
      expect(content).toContain(realProjects[i].title);
      expect(content).toContain("(opens in a new tab)");
      expect(content).toContain("aria-hidden=\"true\"");
    }
    expect(markup).not.toContain("aimirah.mixtape");
  });

  it("shows the documented empty message without a link", () => {
    mockedProjects.current = [];
    mockedProjects.kdmirah = [];
    const markup = renderToStaticMarkup(createElement(IndexSection));
    expect(projectLinks(markup)).toHaveLength(0);
    expect(markup).toContain("No live standalone projects yet");
    expect(markup).toContain("Check back once a project is live.");
  });

  it("renders the four kdmirah projects as a separate group in order", () => {
    mockedProjects.current = [...realProjects];
    mockedProjects.kdmirah = [...realKdmirahProjects];
    const markup = renderToStaticMarkup(createElement(IndexSection));
    const links = projectLinks(markup);

    expect(markup).toContain("kdmirah projects");
    expect(links).toHaveLength(7);
    expect(realKdmirahProjects.map(({ index, title, href }) => [index, title, href])).toEqual([
      ["01", "Mirage", "https://mirage-miii.vercel.app/"],
      ["02", "Nocturnal Dream", "https://nocturnal-dream.vercel.app/"],
      ["03", "MI4Inc. Motion Study — Vercel", "https://clone-string-tune-website-gold.vercel.app/"],
      ["04", "4IM/Flux", "https://www.aimirah.dev/"],
    ]);
    for (const [index, [, attributes, content]] of links.slice(3).entries()) {
      expect(attributes).toContain(`href="${realKdmirahProjects[index].href}"`);
      expect(attributes).toContain('target="_blank"');
      expect(attributes).toContain('rel="noopener noreferrer"');
      expect(attributes).toContain("focus-visible:outline-signal");
      expect(content).toContain(realKdmirahProjects[index].title);
      expect(content).toContain("(opens in a new tab)");
      expect(content).toContain('aria-hidden="true"');
    }
    expect(markup).not.toContain("No live standalone projects yet");
  });

  it("shows only the kdmirah group when the original list is empty", () => {
    mockedProjects.current = [];
    mockedProjects.kdmirah = [...realKdmirahProjects];
    const markup = renderToStaticMarkup(createElement(IndexSection));

    expect(projectLinks(markup)).toHaveLength(4);
    expect(markup).not.toContain("No live standalone projects yet");
  });
});
