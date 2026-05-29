import { useState, useEffect } from "react";
import { S } from "../lib/theme";

export function SimpleSelect({ options, value, onChange, placeholder }) {
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
          padding: "10px 12px", border: `1.5px solid ${open ? S.accent : S.inputBorder}`,
          borderRadius: 7, fontSize: 16, background: S.input, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: value ? S.text : S.textDim, userSelect: "none",
        }}
      >
        <span style={{ fontSize: 14 }}>{value || placeholder}</span>
        <span style={{ fontSize: 10, color: S.textDim, marginLeft: 6 }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 500,
          background: S.card, border: `1.5px solid ${S.accent}`, borderRadius: 7,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxHeight: 220, overflowY: "auto", marginTop: 2,
        }}>
          {options.map(o => (
            <div
              key={o}
              onClick={() => { onChange(o); setOpen(false); }}
              style={{
                padding: "10px 14px", cursor: "pointer", fontSize: 14,
                background: value === o ? S.accent + "33" : S.card,
                color: value === o ? S.accent : S.text,
                fontWeight: value === o ? 600 : 400,
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
