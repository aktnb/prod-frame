import { useState } from "react";
import { useStorage } from "./useStorage";
import { RuleList } from "./RuleList";
import { RuleForm } from "./RuleForm";
import { t } from "../i18n";

export function Popup() {
  const { rules, error, addRule, updateRule, deleteRule } = useStorage();
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ padding: "16px", boxSizing: "border-box", width: "100%", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "15px", margin: "0 0 12px", color: "#202124" }}>{t("appName")}</h1>

      {error && (
        <p style={{ fontSize: "12px", color: "#d93025", margin: "0 0 8px" }}>⚠ {error}</p>
      )}

      <RuleList rules={rules} onUpdate={updateRule} onDelete={deleteRule} />

      {showForm ? (
        <div style={{ marginTop: "12px" }}>
          <RuleForm
            onSubmit={async (rule) => {
              await addRule(rule);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            marginTop: "12px",
            width: "100%",
            padding: "7px",
            background: "#1a73e8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          {t("addRule")}
        </button>
      )}
    </div>
  );
}
