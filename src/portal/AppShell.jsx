import { useNavigate } from "react-router-dom";
import { S } from "../shared/lib/theme";

// App üst barı için yumuşak koyu/orta ton (logo ve ikonların net okunabileceği)
const BAR = {
  bg:          "#2d3548",   // S.card'dan biraz daha açık
  border:      "#404a63",
  text:        "#f1f5f9",
  textMuted:   "#cbd5e1",
  hoverBg:     "#3a4357",
};

const barBtn = {
  background: "transparent",
  color: BAR.textMuted,
  border: `1px solid ${BAR.border}`,
  padding: "5px 10px",
  borderRadius: 7,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

export function AppShell({ app, profile, onLogout, onOpenSettings, onOpenEditProfile, children }) {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", color: S.text }}>
      {/* App top bar — açık koyu */}
      <div style={{
        background: BAR.bg, padding: "0 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 54, boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.25)",
        position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${BAR.border}`, width: "100%",
      }}>
        {/* Left: portal back + app name */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              ...barBtn, display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
              padding: "5px 12px",
            }}
            title="Portal'a dön"
            onMouseEnter={e => e.currentTarget.style.background = BAR.hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 14, color: BAR.text }}>←</span>
            <img
              src="/logo.png"
              alt="Yeni Koza"
              style={{ height: 18, width: "auto", filter: "brightness(0) invert(1)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline"; }}
            />
            <span className="back-label" style={{ display: "none", color: BAR.text, fontSize: 12 }}>Yeni Koza</span>
          </button>
          <div style={{ width: 1, height: 24, background: BAR.border, flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{app.icon}</span>
            <span style={{
              fontSize: 14, fontWeight: 700, color: BAR.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{app.name}</span>
          </div>
        </div>

        {/* Right: user actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div className="user-chip" style={{
            background: "rgba(255,255,255,0.10)", color: BAR.text, borderRadius: 20,
            padding: "4px 12px", fontSize: 12, fontWeight: 600,
            border: `1px solid ${BAR.border}`,
            maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{profile?.name}</div>
          <button onClick={onOpenSettings} title="Şifre Değiştir" style={{ ...barBtn, padding: "5px 9px", fontSize: 14 }}
            onMouseEnter={e => e.currentTarget.style.background = BAR.hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>🔑</button>
          <button onClick={onOpenEditProfile} title="Profili Düzenle" style={{ ...barBtn, padding: "5px 9px", fontSize: 12 }}
            onMouseEnter={e => e.currentTarget.style.background = BAR.hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>✏️</button>
          <button onClick={onLogout} style={{ ...barBtn, padding: "5px 11px" }}
            onMouseEnter={e => e.currentTarget.style.background = BAR.hoverBg}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>Çıkış</button>
        </div>
      </div>

      {/* App content */}
      <div style={{ minHeight: "calc(100vh - 54px)" }}>
        {children}
      </div>
    </div>
  );
}
