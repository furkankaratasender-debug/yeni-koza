import { S } from "../lib/theme";

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      background: S.card, color: S.text,
      padding: "12px 20px", borderRadius: 8,
      fontSize: 13, fontWeight: 700,
      boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      zIndex: 999, border: `1.5px solid ${S.border}`,
    }}>
      {message}
    </div>
  );
}
