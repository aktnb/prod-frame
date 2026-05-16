import type { FrameStyle } from "../types";

// モジュールレベルで参照を保持し、外部ページの DOM 偽装を防ぐ
let frameEl: HTMLDivElement | null = null;

function sanitizeColor(v: unknown): string {
  return typeof v === "string" && /^#[0-9a-fA-F]{6}$/.test(v) ? v : "#ff0000";
}

function sanitizeWidth(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1 && n <= 20 ? n : 4;
}

function sanitizeOpacity(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 1 ? n : 1;
}

export function applyFrame(style: FrameStyle): void {
  if (!frameEl || !document.contains(frameEl)) {
    frameEl = document.createElement("div");
    Object.assign(frameEl.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      pointerEvents: "none",
      zIndex: "2147483647",
      boxSizing: "border-box",
    });
    document.documentElement.appendChild(frameEl);
  }
  const color = sanitizeColor(style.color);
  const width = sanitizeWidth(style.width);
  const opacity = sanitizeOpacity(style.opacity);
  frameEl.style.border = `${width}px solid ${color}`;
  frameEl.style.opacity = String(opacity);
}

export function removeFrame(): void {
  frameEl?.remove();
  frameEl = null;
}
