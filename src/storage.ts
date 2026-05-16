/// <reference types="chrome" />

import type { FrameRule, StorageData } from "./types";

const STORAGE_KEY = "prodFrameData";

function isFrameRule(v: unknown): v is FrameRule {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.urlPattern === "string" &&
    typeof r.enabled === "boolean" &&
    typeof r.style === "object" &&
    r.style !== null
  );
}

export function getRules(): Promise<FrameRule[]> {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      const raw = result[STORAGE_KEY] as StorageData | undefined;
      const rules = Array.isArray(raw?.rules) ? raw.rules.filter(isFrameRule) : [];
      resolve(rules);
    });
  });
}

export function saveRules(rules: FrameRule[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const data: StorageData = { rules };
    chrome.storage.sync.set({ [STORAGE_KEY]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
