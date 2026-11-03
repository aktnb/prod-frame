import { useEffect, useRef, useState } from "react";
import { t } from "../i18n";
import { getRules, saveRules } from "../storage";
import type { FrameRule } from "../types";
import { exportRules, ImportError, parseImport, planImport } from "../transfer";
import type { TransferRule } from "../transfer";

function errorMessage(error: unknown): string {
  return error instanceof ImportError ? t(error.key, error.path) : t("errorLoad");
}

export function Options() {
  const [rules, setRules] = useState<FrameRule[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<TransferRule[] | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRevision = useRef(0);
  const knownIds = useRef(new Set<string>());

  useEffect(() => {
    let active = true;
    let revision = 0;
    async function refresh() {
      const request = ++revision;
      try {
        const next = await getRules();
        if (!active || request !== revision) return;
        const previousIds = knownIds.current;
        setSelected((previous) => new Set(next.filter((rule) =>
          !previousIds.has(rule.id) || previous.has(rule.id)).map((rule) => rule.id)));
        knownIds.current = new Set(next.map((rule) => rule.id));
        setRules(next);
        setLoaded(true);
      } catch {
        if (active) { setError(t("errorLoad")); setLoaded(false); }
      }
    }
    const onChanged = (_changes: unknown, area: string) => { if (area === "sync") void refresh(); };
    chrome.storage.onChanged.addListener(onChanged);
    void refresh();
    return () => { active = false; chrome.storage.onChanged.removeListener(onChanged); };
  }, []);

  const chosen = rules.filter((rule) => selected.has(rule.id));
  const plan = pending ? planImport(rules, pending) : null;

  function changeText(value: string) {
    inputRevision.current++;
    setText(value); setPending(null); setError(""); setStatus("");
  }

  function validate(value: string) {
    setPending(null); setError(""); setStatus("");
    try { setPending(parseImport(value)); }
    catch (error) { setError(errorMessage(error)); }
  }

  async function readFile(file: File) {
    changeText("");
    const revision = inputRevision.current;
    try {
      const value = await file.text();
      if (revision !== inputRevision.current) return;
      setText(value);
      validate(value);
    } catch {
      if (revision === inputRevision.current) setError(t("importFileError"));
    }
  }

  async function confirmImport() {
    if (!pending || !plan || busy) return;
    setBusy(true); setError(""); setStatus("");
    try {
      // Use the latest stored rules so edits since preview are preserved.
      const current = await getRules();
      const latest = planImport(current, pending);
      setRules(current);
      if (latest.additions.length !== plan.additions.length || latest.skipped !== plan.skipped) {
        setStatus(t("importChanged"));
        return;
      }
      if (latest.additions.length) {
        await saveRules([...current, ...latest.additions.map((rule) => ({ ...rule, id: crypto.randomUUID() }))]);
      }
      setPending(null);
      setStatus(t("importComplete", [String(latest.additions.length), String(latest.skipped)]));
    } catch { setError(t("errorSave")); }
    finally { setBusy(false); }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportRules(chosen)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = "prod-frame-rules.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(exportRules(chosen));
      setError(""); setStatus(t("exportCopied"));
    } catch { setError(t("exportCopyError")); }
  }

  return <main>
    <h1>{t("appName")} — {t("transferSettings")}</h1>
    <p>{t("transferDescription")}</p>
    <section aria-labelledby="export-title">
      <h2 id="export-title">{t("exportTitle")}</h2>
      <div className="actions">
        <button disabled={!loaded || busy} onClick={() => setSelected(new Set(rules.map((rule) => rule.id)))}>{t("selectAll")}</button>
        <button disabled={!loaded || busy} onClick={() => setSelected(new Set())}>{t("deselectAll")}</button>
      </div>
      {loaded && rules.length === 0 && <p>{t("noRules")}</p>}
      <ul>{rules.map((rule) => <li key={rule.id}><label>
        <input type="checkbox" disabled={busy} checked={selected.has(rule.id)} onChange={(event) => {
          const next = new Set(selected);
          if (event.target.checked) next.add(rule.id); else next.delete(rule.id);
          setSelected(next);
        }} />
        <span>{rule.urlPattern}<small>{t(rule.enabled ? "enabled" : "disabled")} · {rule.style.color} · {rule.style.width}px · {Math.round(rule.style.opacity * 100)}%</small></span>
      </label></li>)}</ul>
      <p>{t("exportSelected", String(chosen.length))}</p>
      <div className="actions">
        <button disabled={!loaded || busy || !chosen.length} onClick={download}>{t("exportFile")}</button>
        <button disabled={!loaded || busy || !chosen.length} onClick={() => void copy()}>{t("exportCopy")}</button>
      </div>
    </section>
    <section aria-labelledby="import-title">
      <h2 id="import-title">{t("importTitle")}</h2>
      <p>{t("importDescription")}</p>
      <label>{t("importFile")}<input type="file" accept=".json,application/json" disabled={!loaded || busy} onChange={(event) => {
        const file = event.target.files?.[0];
        if (file) void readFile(file);
        event.target.value = "";
      }} /></label>
      <label>{t("importText")}<textarea value={text} disabled={!loaded || busy} onChange={(event) => changeText(event.target.value)} spellCheck={false} /></label>
      <div className="actions"><button disabled={!loaded || busy || !text.trim()} onClick={() => validate(text)}>{t("importValidate")}</button></div>
      {plan && <div>
        <p>{t("importPreview", [String(plan.additions.length), String(plan.skipped)])}</p>
        <button className="primary" disabled={!loaded || busy} onClick={() => void confirmImport()}>{t("importConfirm")}</button>
      </div>}
    </section>
    {error && <p className="error" role="alert">{error}</p>}
    <p role="status">{status}</p>
  </main>;
}
