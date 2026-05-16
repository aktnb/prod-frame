import { useCallback, useEffect, useState } from "react";
import type { FrameRule } from "../types";
import { getRules, saveRules } from "../storage";
import { t } from "../i18n";

async function notifyContentScript(): Promise<void> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id !== undefined) {
      await chrome.tabs.sendMessage(tab.id, { type: "rulesUpdated" });
    }
  } catch {
    // content script が起動していないタブでは無視
  }
}

export function useStorage() {
  const [rules, setRules] = useState<FrameRule[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRules()
      .then(setRules)
      .catch(() => setError(t("errorLoad")));
  }, []);

  const addRule = useCallback(
    async (rule: Omit<FrameRule, "id">) => {
      const newRule: FrameRule = { ...rule, id: crypto.randomUUID() };
      const next = [...rules, newRule];
      try {
        await saveRules(next);
        setRules(next);
        setError(null);
        void notifyContentScript();
      } catch {
        setError(t("errorSave"));
      }
    },
    [rules]
  );

  const updateRule = useCallback(
    async (id: string, patch: Partial<Omit<FrameRule, "id">>) => {
      const next = rules.map((r) => (r.id === id ? { ...r, ...patch } : r));
      try {
        await saveRules(next);
        setRules(next);
        setError(null);
        void notifyContentScript();
      } catch {
        setError(t("errorSave"));
      }
    },
    [rules]
  );

  const deleteRule = useCallback(
    async (id: string) => {
      const next = rules.filter((r) => r.id !== id);
      try {
        await saveRules(next);
        setRules(next);
        setError(null);
        void notifyContentScript();
      } catch {
        setError(t("errorSave"));
      }
    },
    [rules]
  );

  return { rules, error, addRule, updateRule, deleteRule };
}
