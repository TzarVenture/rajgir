// Node module resolve hook: maps the tsconfig "@/..." alias to src/ and adds the .ts/.tsx extension
// to extensionless imports, so `node --test` can load the app's TypeScript modules directly
// (Node strips the types natively; no build step or extra dependencies).
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = new URL("../../src/", import.meta.url);
const EXTENSIONS = [".ts", ".tsx", "/index.ts"];

function withExtension(url) {
  for (const ext of EXTENSIONS) {
    const candidate = new URL(url.href + ext);
    if (existsSync(fileURLToPath(candidate))) return candidate.href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = withExtension(new URL(specifier.slice(2), SRC));
    if (target) return nextResolve(target, context);
  }
  if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL && !/\.[cm]?[jt]sx?$/.test(specifier)) {
    const target = withExtension(new URL(specifier, context.parentURL));
    if (target) return nextResolve(target, context);
  }
  return nextResolve(specifier, context);
}
