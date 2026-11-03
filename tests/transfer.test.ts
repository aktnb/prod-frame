import assert from "node:assert/strict";
import { test } from "node:test";
import { exportRules, ImportError, parseImport, planImport } from "../src/transfer.ts";

const rule = {
  id: "existing-id",
  urlPattern: "https://example.com/*",
  style: { color: "#aA00ff", width: 7.5, opacity: 0.35 },
  enabled: false,
};
const document = (rules: unknown[]) => JSON.stringify({ version: 1, rules });

test("versioned JSON round-trips all settings without exporting internal IDs", () => {
  const text = exportRules([rule, { ...rule, id: "other", enabled: true, urlPattern: "*localhost*" }]);
  const data = JSON.parse(text);
  assert.equal(data.version, 1);
  assert.equal(data.rules[0].id, undefined);
  const parsed = parseImport(text);
  assert.deepEqual(parsed, data.rules);
  assert.deepEqual(planImport([], parsed), { additions: data.rules, skipped: 0 });
  assert.equal(parsed[0].enabled, false);
  assert.equal(parsed[1].enabled, true);
});

test("append plan preserves existing rules, skips exact duplicates, and uses the first input", () => {
  const existing = structuredClone(rule);
  const nested = { ...rule, urlPattern: "https://example.com/admin/*", enabled: true };
  const incoming = parseImport(document([
    { ...rule, enabled: true }, nested,
    { ...nested, style: { ...nested.style, color: "#ffffff" } },
    rule,
  ]));
  const plan = planImport([existing], incoming);
  assert.deepEqual(plan, { additions: [incoming[1]], skipped: 3 });
  assert.deepEqual(existing, rule);
  assert.equal(plan.additions[0].style.color, rule.style.color);
});

test("patterns are compared as exact strings without normalization", () => {
  const incoming = parseImport(document([
    { ...rule, urlPattern: "HTTPS://example.com/*" },
    { ...rule, urlPattern: " https://example.com/* " },
  ]));
  assert.equal(planImport([rule], incoming).additions.length, 2);
});

test("empty exports and imports are valid", () => {
  assert.deepEqual(parseImport(exportRules([])), []);
  assert.deepEqual(planImport([rule], []), { additions: [], skipped: 0 });
});

test("rejects syntax, document shape, missing and unsupported numeric versions", () => {
  for (const text of ["{", "null", "[]", '{"rules":[]}', '{"version":"1","rules":[]}', '{"version":2,"rules":[]}', '{"version":1,"rules":{}}']) {
    assert.throws(() => parseImport(text), ImportError);
  }
});

test("invalid rules including duplicate skip candidates reject the whole document with a field path", () => {
  const invalid = [
    [null, "rules[1]"],
    [{ ...rule, urlPattern: "  " }, "rules[1].urlPattern"],
    [{ ...rule, urlPattern: "x".repeat(257) }, "rules[1].urlPattern"],
    [{ ...rule, enabled: "true" }, "rules[1].enabled"],
    [{ ...rule, style: null }, "rules[1].style"],
    [{ ...rule, style: { ...rule.style, color: "red" } }, "rules[1].style.color"],
    [{ ...rule, style: { ...rule.style, width: "4" } }, "rules[1].style.width"],
    [{ ...rule, style: { ...rule.style, width: 0 } }, "rules[1].style.width"],
    [{ ...rule, style: { ...rule.style, width: 21 } }, "rules[1].style.width"],
    [{ ...rule, style: { ...rule.style, opacity: -0.1 } }, "rules[1].style.opacity"],
    [{ ...rule, style: { ...rule.style, opacity: 1.1 } }, "rules[1].style.opacity"],
    [{ ...rule, style: { ...rule.style, opacity: null } }, "rules[1].style.opacity"],
  ] as const;
  for (const [bad, path] of invalid) {
    assert.throws(() => parseImport(document([rule, bad])), (error: unknown) =>
      error instanceof ImportError && error.path === path);
  }
  assert.throws(() => parseImport('{"version":1,"rules":[{"urlPattern":"*","enabled":true,"style":{"color":"#ffffff","width":1e999,"opacity":1}}]}'), ImportError);
});

test("accepts numeric boundaries and copies only known fields", () => {
  const rules = parseImport(document([
    { ...rule, style: { color: "#000000", width: 1, opacity: 0 }, extra: "ignored" },
    { ...rule, style: { color: "#FFFFFF", width: 20, opacity: 1 } },
  ]));
  assert.equal(rules[0].style.opacity, 0);
  assert.equal(rules[1].style.width, 20);
  assert.equal("id" in rules[0], false);
  assert.equal("extra" in rules[0], false);
});
