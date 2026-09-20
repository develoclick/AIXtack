import fs from "node:fs";
import path from "node:path";
import { redirects } from "../../content/redirects";

const GUIDE_TARGET = /^\/([a-z0-9-]+)\/guias\/([a-z0-9-]+)$/;

/** ¿La guía destino existe y está publicada? Lee solo su `status` (sin ejecutar el módulo). */
export function isGuidePublished(category: string, slug: string, root = process.cwd()): boolean {
  const file = path.join(root, "content", "guias", category, slug, "data.ts");
  if (!fs.existsSync(file)) return false;
  return /status:\s*["']published["']/.test(fs.readFileSync(file, "utf8"));
}

/**
 * Redirecciones 301 vigentes: las institucionales siempre y las que apuntan a una
 * guía solo cuando esa guía está publicada. Una redirección a una guía en borrador
 * llevaría a un 404, así que hasta entonces la URL antigua responde 410.
 */
export function activeRedirects(root = process.cwd()) {
  return redirects
    .filter((rule) => {
      const match = GUIDE_TARGET.exec(rule.to);
      return match ? isGuidePublished(match[1], match[2], root) : true;
    })
    .map((rule) => ({ source: rule.from, destination: rule.to, statusCode: 301 }));
}
