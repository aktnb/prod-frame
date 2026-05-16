import { useState } from "react";
import type { FrameRule } from "../types";
import { RuleForm } from "./RuleForm";
import { t } from "../i18n";

type Props = {
  rule: FrameRule;
  onUpdate: (id: string, patch: Partial<Omit<FrameRule, "id">>) => void;
  onDelete: (id: string) => void;
};

export function RuleItem({ rule, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div style={containerStyle}>
        <RuleForm
          initial={rule}
          onSubmit={(updated) => {
            onUpdate(rule.id, updated);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setEditing(true)}
        onKeyDown={(e) => e.key === "Enter" && setEditing(true)}
        style={clickableRow}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "3px",
            background: rule.style.color,
            opacity: rule.style.opacity,
            flexShrink: 0,
            border: "1px solid #ccc",
          }}
        />
        <span
          style={{
            flex: 1,
            fontSize: "12px",
            color: rule.enabled ? "#333" : "#aaa",
            wordBreak: "break-all",
          }}
        >
          {rule.urlPattern}
        </span>
        <span style={{ fontSize: "11px", color: "#888", whiteSpace: "nowrap" }}>
          {rule.style.width}px / {Math.round(rule.style.opacity * 100)}%
        </span>
      </div>
      <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
        <button
          onClick={() => onUpdate(rule.id, { enabled: !rule.enabled })}
          style={toggleButton(rule.enabled)}
        >
          {rule.enabled ? t("enabled") : t("disabled")}
        </button>
        <button
          onClick={() => {
            if (window.confirm(t("deleteConfirm", [rule.urlPattern]))) {
              onDelete(rule.id);
            }
          }}
          style={{ ...smallButton, color: "#d93025" }}
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
}

const clickableRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  cursor: "pointer",
  borderRadius: "4px",
  padding: "2px 4px",
  margin: "-2px -4px",
  outline: "none",
};

const containerStyle: React.CSSProperties = {
  padding: "8px",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  background: "#fafafa",
};

function toggleButton(enabled: boolean): React.CSSProperties {
  return {
    padding: "2px 8px",
    fontSize: "11px",
    border: "1px solid",
    borderColor: enabled ? "#1a73e8" : "#ccc",
    borderRadius: "4px",
    background: enabled ? "#e8f0fe" : "#f1f3f4",
    color: enabled ? "#1a73e8" : "#888",
    cursor: "pointer",
  };
}

const smallButton: React.CSSProperties = {
  padding: "2px 8px",
  fontSize: "11px",
  border: "1px solid #ccc",
  borderRadius: "4px",
  background: "#f1f3f4",
  cursor: "pointer",
  color: "#333",
};
