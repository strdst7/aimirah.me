/**
 * Shared Vite configuration for every aimirah.me site.
 *
 * Each project's `vite.config.ts` is a two-line wrapper around this factory,
 * so build behaviour (plugins, `@` alias, single-file inlining) is defined
 * once instead of being copy-pasted five times (CONCERNS.md #1, #35).
 */
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type UserConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export function createViteConfig(dirname: string, overrides: UserConfig = {}) {
  return defineConfig({
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        "@": path.resolve(dirname, "src"),
      },
    },
    ...overrides,
  });
}
