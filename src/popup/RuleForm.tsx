import { useState } from "react";
import type { FrameRule, FrameStyle } from "../types";
import { t } from "../i18n";

type Props = {
  initial?: FrameRule;
  onSubmit: (rule: Omit<FrameRule, "id">) => void;
  onCancel: () => void;
};

const DEFAULT_STYLE: FrameStyle = {
  color: "#ff0000",
  width: 4,
  opacity: 1,
};

function testMatch(pattern: string, url: string): boolean {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\*+/g, ".*");
  try {
    return new RegExp(`^${escaped}$`).test(url);
  } catch {
    return false;
  }
}

export function RuleForm({ initial, onSubmit, onCancel }: Props) {
  const [urlPattern, setUrlPattern] = useState(initial?.urlPattern ?? "");
  const [style, setStyle] = useState<FrameStyle>(initial?.style ?? DEFAULT_STYLE);
  const [testUrl, setTestUrl] = useState("");
  const enabled = initial?.enabled ?? true;

  const matchResult = testUrl ? testMatch(urlPattern.trim(), testUrl) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlPattern.trim()) return;
    onSubmit({ urlPattern: urlPattern.trim(), style, enabled });
  }

  function patchStyle(patch: Partial<FrameStyle>) {
    setStyle((prev) => ({ ...prev, ...patch }));
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={labelStyle}>
        {t("urlPattern")}
        <input
          type="text"
          value={urlPattern}
          onChange={(e) => setUrlPattern(e.target.value)}
          placeholder="https://example.com/*"
          maxLength={256}
          style={inputStyle}
          required
        />
        <span style={hintStyle}>
          {t("urlPatternHint")}
          <br />
          {t("urlPatternHint2")}
        </span>
      </label>

      <label style={labelStyle}>
        {t("testUrl")}
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="https://www.example.com/page"
          style={inputStyle}
        />
        {matchResult !== null && (
          <span style={{ fontSize: "11px", color: matchResult ? "#1e8e3e" : "#d93025", fontWeight: "bold" }}>
            {matchResult ? t("matchResultMatch") : t("matchResultNoMatch")}
          </span>
        )}
      </label>

      <label style={labelStyle}>
        {t("borderColor")}
        <input
          type="color"
          value={style.color}
          onChange={(e) => patchStyle({ color: e.target.value })}
          style={{ width: "100%", height: "32px", padding: "0", border: "1px solid #ccc", borderRadius: "4px" }}
        />
      </label>

      <label style={labelStyle}>
        {t("borderWidth")}: {style.width}px
        <input
          type="range"
          min={1}
          max={20}
          value={style.width}
          onChange={(e) => patchStyle({ width: Number(e.target.value) })}
          style={{ width: "100%" }}
        />
      </label>

      <label style={labelStyle}>
        {t("opacity")}: {Math.round(style.opacity * 100)}%
        <input
          type="range"
          min={10}
          max={100}
          value={Math.round(style.opacity * 100)}
          onChange={(e) => patchStyle({ opacity: Number(e.target.value) / 100 })}
          style={{ width: "100%" }}
        />
      </label>

      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button type="submit" style={primaryButton}>
          {initial ? t("update") : t("add")}
        </button>
        <button type="button" onClick={onCancel} style={secondaryButton}>
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
  fontSize: "12px",
  color: "#555",
};

const hintStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#888",
  lineHeight: "1.5",
};

const inputStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontSize: "13px",
};

const primaryButton: React.CSSProperties = {
  flex: 1,
  padding: "6px",
  background: "#1a73e8",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};

const secondaryButton: React.CSSProperties = {
  flex: 1,
  padding: "6px",
  background: "#f1f3f4",
  color: "#333",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "13px",
};
