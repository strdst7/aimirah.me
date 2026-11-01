import path from "node:path";
import { fileURLToPath } from "node:url";
import { createViteConfig } from "@aimirah/shared/vite.base";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default createViteConfig(__dirname);
