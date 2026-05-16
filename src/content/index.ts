/// <reference types="chrome" />

import type { FrameRule } from "../types";
import { getRules } from "../storage";
import { applyFrame, removeFrame } from "./frame";

type CompiledRule = FrameRule & { regexp: RegExp };

function compileRules(rules: FrameRule[]): CompiledRule[] {
  return rules.flatMap((r) => {
    const escaped = r.urlPattern
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*+/g, ".*"); // 連続 * を単一 .* に圧縮（ReDoS対策）
    try {
      return [{ ...r, regexp: new RegExp(`^${escaped}$`) }];
    } catch {
      return [];
    }
  });
}

function updateFrameForUrl(rules: CompiledRule[]): void {
  const matched = rules.find((r) => r.enabled && r.regexp.test(location.href));
  if (matched) {
    applyFrame(matched.style);
  } else {
    removeFrame();
  }
}

let currentRules: CompiledRule[] = [];

getRules()
  .then((rules) => {
    currentRules = compileRules(rules);
    updateFrameForUrl(currentRules);
  })
  .catch(() => {
    // ストレージ読み取り失敗時は枠線なしで継続
  });

// storage 変更をリアルタイム反映
chrome.storage.onChanged.addListener((_changes, area) => {
  if (area !== "sync") return;
  getRules()
    .then((rules) => {
      currentRules = compileRules(rules);
      updateFrameForUrl(currentRules);
    })
    .catch(() => {});
});

// SPA のURL変化を検知
let lastHref = location.href;

function checkUrlChange(): void {
  if (location.href !== lastHref) {
    lastHref = location.href;
    updateFrameForUrl(currentRules);
  }
}

window.addEventListener("popstate", () => updateFrameForUrl(currentRules));

// requestAnimationFrame でスロットル（高頻度 DOM 変化対策）
let rafId: ReturnType<typeof requestAnimationFrame> | null = null;
const observer = new MutationObserver(() => {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    checkUrlChange();
  });
});
observer.observe(document.documentElement, { subtree: true, childList: true });

// Popup からのメッセージでルールを即時更新
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "ping") {
    sendResponse({ ok: true });
    return false;
  }
  if (message?.type === "rulesUpdated") {
    getRules()
      .then((rules) => {
        currentRules = compileRules(rules);
        updateFrameForUrl(currentRules);
        sendResponse({ ok: true });
      })
      .catch(() => sendResponse({ ok: false }));
    return true; // async response
  }
  return false;
});
