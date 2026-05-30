import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { S } from "../shared/lib/theme";

// App üst barı için yumuşak koyu/orta ton
const BAR = {
  bg:          "#2d3548",
  border:      "#404a63",
  text:        "#f1f5f9",
  textMuted:   "#cbd5e1",
  hoverBg:     "#3a4357",
  menuBg:      "#252b3b",
  menuItemHover: "#323a4f",
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const firstName = profile?.name?.split(" ")[0] || "K";
  const initial = firstName.charAt(0).toUpperCase();

  // Click outside to close menu
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const menuItem = {
    padding: "10px 16px",
    fontSize: 13,
    color: BAR.text,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "background 0.12s",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", color: S.text }}>
      {/* App top bar */}
      <div
        className="appshell-bar"
        style={{
          background: BAR.bg, padding: "0 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: 54, boxShadow: "0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.25)",
          position: "sticky", top: 0, zIndex: 50,
          borderBottom: `1px solid ${BAR.border}`, width: "100%", gap: 8,
        }}
      >
        {/* Left: portal back + app name */}
        <div className="appshell-left" style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
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
            <span style={{ fontSize: 16, color: BAR.text, lineHeight: 1 }}>←</span>
            <img
              className="appshell-logo"
              src="/logo.png"
              alt="Yeni Koza"
              style={{ height: 18, width: "auto", filter: "brightness(0) invert(1)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </button>
          <div className="appshell-divider" style={{ width: 1, height: 24, background: BAR.border, flexShrink: 0 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{app.icon}</span>
            <span style={{
              fontSize: 14, fontWeight: 700, color: BAR.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{app.name}</span>
          </div>
        </div>

        {/* Right: profile dropdown */}
        <div ref={menuRef} style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: menuOpen ? BAR.hoverBg : "transparent",
              border: `1px solid ${menuOpen ? S.accent + "66" : BAR.border}`,
              padding: "3px 6px 3px 3px", borderRadius: 24,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => !menuOpen && (e.currentTarget.style.background = BAR.hoverBg)}
            onMouseLeave={e => !menuOpen && (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: S.accent, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>{initial}</div>
            <span className="appshell-username" style={{
              fontSize: 12, fontWeight: 600, color: BAR.text,
              paddingRight: 4, maxWidth: 90,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{firstName}</span>
            <span className="appshell-chevron" style={{ fontSize: 9, color: BAR.textMuted, paddingRight: 6 }}>▼</span>
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: BAR.menuBg, borderRadius: 12,
              border: `1px solid ${BAR.border}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)",
              minWidth: 220, overflow: "hidden", zIndex: 100,
            }}>
              {/* Header */}
              <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${BAR.border}`, background: S.accent + "11" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: BAR.text, marginBottom: 2 }}>{profile?.name}</div>
                <div style={{ fontSize: 11, color: BAR.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                  📍 {profile?.store}
                  {profile?.role === "admin" && (
                    <span style={{ padding: "1px 7px", background: "#fef3c733", color: "#fcd34d", borderRadius: 8, fontSize: 9, fontWeight: 700, border: "1px solid #fcd34d55", marginLeft: 4 }}>ADMIN</span>
                  )}
                </div>
              </div>
              {/* Items */}
              <div
                style={{ ...menuItem }}
                onClick={() => { setMenuOpen(false); onOpenEditProfile(); }}
                onMouseEnter={e => e.currentTarget.style.background = BAR.menuItemHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>✏️</span>
                <span>Profili Düzenle</span>
              </div>
              <div
                style={{ ...menuItem }}
                onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                onMouseEnter={e => e.currentTarget.style.background = BAR.menuItemHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>🔑</span>
                <span>Şifre Değiştir</span>
              </div>
              {profile?.role === "admin" && (
                <div
                  style={{ ...menuItem }}
                  onClick={() => { setMenuOpen(false); navigate("/admin"); }}
                  onMouseEnter={e => e.currentTarget.style.background = BAR.menuItemHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14 }}>👥</span>
                  <span>Kullanıcı Yönetimi</span>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${BAR.border}` }} />
              <div
                style={{ ...menuItem, color: "#f87171" }}
                onClick={() => { setMenuOpen(false); onLogout(); }}
                onMouseEnter={e => e.currentTarget.style.background = "#7f1d1d22"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>🚪</span>
                <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* App content */}
      <div style={{ minHeight: "calc(100vh - 54px)" }}>
        {children}
      </div>
    </div>
  );
}
