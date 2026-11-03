import type { FrameRule } from "./types";

export type TransferRule = Omit<FrameRule, "id">;

export class ImportError extends Error {
  key: string;
  path: string;

  constructor(key: string, path = "") {
    super(key);
    this.key = key;
    this.path = path;
  }
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Validate every rule before deduplicating, including rules that will be skipped.
export function parseImport(text: string): TransferRule[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new ImportError("importInvalidJson", error instanceof Error ? error.message : "");
  }
  if (!object(data)) throw new ImportError("importInvalidDocument");
  if (data.version !== 1) throw new ImportError("importInvalidVersion", "version");
  if (!Array.isArray(data.rules)) throw new ImportError("importInvalidRules", "rules");

  return data.rules.map((rule: unknown, index: number) => {
    const path = `rules[${index}]`;
    if (!object(rule)) throw new ImportError("importInvalidRule", path);
    if (typeof rule.urlPattern !== "string" || !rule.urlPattern.trim() || rule.urlPattern.length > 256) {
      throw new ImportError("importInvalidPattern", `${path}.urlPattern`);
    }
    if (typeof rule.enabled !== "boolean") throw new ImportError("importInvalidEnabled", `${path}.enabled`);
    if (!object(rule.style)) throw new ImportError("importInvalidStyle", `${path}.style`);
    const { color, width, opacity } = rule.style;
    if (typeof color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(color)) {
      throw new ImportError("importInvalidColor", `${path}.style.color`);
    }
    if (typeof width !== "number" || !Number.isFinite(width) || width < 1 || width > 20) {
      throw new ImportError("importInvalidWidth", `${path}.style.width`);
    }
    if (typeof opacity !== "number" || !Number.isFinite(opacity) || opacity < 0 || opacity > 1) {
      throw new ImportError("importInvalidOpacity", `${path}.style.opacity`);
    }
    return { urlPattern: rule.urlPattern, enabled: rule.enabled, style: { color, width, opacity } };
  });
}

export function planImport(existing: FrameRule[], incoming: TransferRule[]) {
  const patterns = new Set(existing.map((rule) => rule.urlPattern));
  const additions = incoming.filter((rule) => {
    if (patterns.has(rule.urlPattern)) return false;
    patterns.add(rule.urlPattern);
    return true;
  });
  return { additions, skipped: incoming.length - additions.length };
}

export function exportRules(rules: FrameRule[]): string {
  return JSON.stringify({
    version: 1,
    rules: rules.map(({ urlPattern, style, enabled }) => ({ urlPattern, style, enabled })),
  }, null, 2);
}
