import { useState, useEffect } from "react";
import { S } from "../lib/theme";

export function SmallSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const c = (e) => { if (!e.target.closest(".ss-w")) setOpen(false); };
    if (open) document.addEventListener("mousedown", c);
    return () => document.removeEventListener("mousedown", c);
  }, [open]);

  return (
    <div className="ss-w" style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "6px 10px", border: `1px solid ${open ? S.accent : S.inputBorder}`,
          borderRadius: 6, fontSize: 12, background: S.input, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: value && value !== "Tümü" ? S.text : S.textDim, userSelect: "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "calc(100% - 16px)" }}>
          {value || "Tümü"}
        </span>
        <span style={{ fontSize: 9, color: S.textDim, flexShrink: 0, marginLeft: 4 }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 500,
          background: S.card, border: `1.5px solid ${S.accent}`, borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxHeight: 200, overflowY: "auto", marginTop: 2,
        }}>
          {options.map(o => (
            <div
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              style={{
                padding: "7px 12px", cursor: "pointer", fontSize: 12,
                background: value === o ? S.accent + "33" : S.card,
                color: value === o ? S.accent : S.text,
              }}
              onMouseEnter={e => e.currentTarget.style.background = S.input}
              onMouseLeave={e => e.currentTarget.style.background = value === o ? S.accent + "33" : S.card}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
