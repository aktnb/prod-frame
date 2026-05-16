import type { FrameRule } from "../types";
import { RuleItem } from "./RuleItem";
import { t } from "../i18n";

type Props = {
  rules: FrameRule[];
  onUpdate: (id: string, patch: Partial<Omit<FrameRule, "id">>) => void;
  onDelete: (id: string) => void;
};

export function RuleList({ rules, onUpdate, onDelete }: Props) {
  if (rules.length === 0) {
    return (
      <p style={{ fontSize: "12px", color: "#888", textAlign: "center", margin: "16px 0" }}>
        {t("noRules")}
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {rules.map((rule) => (
        <RuleItem key={rule.id} rule={rule} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
