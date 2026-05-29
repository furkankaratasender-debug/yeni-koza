import { useState, useEffect, useMemo } from "react";
import { S, inputStyle } from "../lib/theme";

export function SearchSelect({ options, value, onChange, placeholder, disabled }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => options.filter(o => o.toLowerCase().includes(q.toLowerCase())), [options, q]);

  useEffect(() => { if (!open) setQ(""); }, [open]);
  useEffect(() => {
    const c = (e) => { if (!e.target.closest(".ss-w")) setOpen(false); };
    if (open) document.addEventListener("mousedown", c);
    return () => document.removeEventListener("mousedown", c);
  }, [open]);

  return (
    <div className="ss-w" style={{ position: "relative", opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: "10px 12px", border: `1.5px solid ${open ? S.accent : S.inputBorder}`,
          borderRadius: 7, fontSize: 16, background: S.input, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          color: value ? S.text : S.textDim, userSelect: "none",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14 }}>
          {value || placeholder}
        </span>
        <span style={{ fontSize: 10, color: S.textDim, flexShrink: 0, marginLeft: 6 }}>▼</span>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 500,
          background: S.card, border: `1.5px solid ${S.accent}`, borderRadius: 7,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)", maxHeight: 220, display: "flex",
          flexDirection: "column", marginTop: 2,
        }}>
          <input
            autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Ara..."
            style={{ padding: "8px 12px", border: "none", borderBottom: `1px solid ${S.border}`, outline: "none", fontSize: 16, background: S.input, color: S.text }}
          />
          <div style={{ overflowY: "auto" }}>
            {filtered.length === 0 && <div style={{ padding: "10px 14px", color: S.textDim, fontSize: 14 }}>Sonuç yok</div>}
            {filtered.map(o => (
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
        </div>
      )}
    </div>
  );
}
