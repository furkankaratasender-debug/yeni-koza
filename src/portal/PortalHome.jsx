import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { APPS } from "./appRegistry";

// Light theme palette — sadece portal için
const L = {
  bg:          "#f4f6fb",
  bgGradient:  "linear-gradient(180deg, #f8fafc 0%, #eef2f9 100%)",
  card:        "#ffffff",
  cardHover:   "#fafbff",
  border:      "#e2e8f0",
  text:        "#0f172a",
  textMuted:   "#475569",
  textDim:     "#64748b",
  accent:      "#4d7cfe",
  accentLight: "#eaf0ff",
  shadow:      "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
  shadowHover: "0 10px 30px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.06)",
  shadowMenu:  "0 12px 40px rgba(15,23,42,0.12), 0 4px 12px rgba(15,23,42,0.06)",
};

export function PortalHome({ profile, onLogout, onOpenSettings, onOpenEditProfile }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const visibleApps = APPS.filter(a => !a.hidden && (!a.adminOnly || profile?.role === "admin"));

  // Click outside to close menu
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const firstName = profile?.name?.split(" ")[0] || "K";
  const initial = firstName.charAt(0).toUpperCase();

  const menuItem = {
    padding: "10px 16px",
    fontSize: 13,
    color: L.text,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "background 0.12s",
  };

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: L.bgGradient, minHeight: "100vh", color: L.text }}>
      {/* Top bar */}
      <div style={{
        background: "white", padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, borderBottom: `1px solid ${L.border}`,
        boxShadow: L.shadow,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/logo.png"
            alt="Yeni Koza"
            style={{ height: 32, width: "auto" }}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline"; }}
          />
          <span style={{ fontSize: 22, display: "none" }}>🏪</span>
        </div>

        {/* Profile dropdown */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: menuOpen ? L.accentLight : "transparent",
              border: `1px solid ${menuOpen ? L.accent + "55" : L.border}`,
              padding: "4px 6px 4px 4px", borderRadius: 24,
              cursor: "pointer", transition: "all 0.15s",
            }}
            onMouseEnter={e => !menuOpen && (e.currentTarget.style.background = L.accentLight + "55")}
            onMouseLeave={e => !menuOpen && (e.currentTarget.style.background = "transparent")}
          >
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: L.accent, color: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>{initial}</div>
            <span style={{
              fontSize: 12, fontWeight: 600, color: L.text,
              paddingRight: 4, maxWidth: 100,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{firstName}</span>
            <span style={{ fontSize: 9, color: L.textDim, paddingRight: 6 }}>▼</span>
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "white", borderRadius: 12,
              border: `1px solid ${L.border}`, boxShadow: L.shadowMenu,
              minWidth: 220, overflow: "hidden", zIndex: 100,
            }}>
              {/* Header */}
              <div style={{ padding: "14px 16px 12px", borderBottom: `1px solid ${L.border}`, background: L.accentLight + "55" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: L.text, marginBottom: 2 }}>{profile?.name}</div>
                <div style={{ fontSize: 11, color: L.textMuted, display: "flex", alignItems: "center", gap: 5 }}>
                  📍 {profile?.store}
                  {profile?.role === "admin" && (
                    <span style={{ padding: "1px 7px", background: "#fef3c7", color: "#92400e", borderRadius: 8, fontSize: 9, fontWeight: 700, border: "1px solid #fcd34d", marginLeft: 4 }}>ADMIN</span>
                  )}
                </div>
              </div>
              {/* Items */}
              <div
                style={{ ...menuItem }}
                onClick={() => { setMenuOpen(false); onOpenEditProfile(); }}
                onMouseEnter={e => e.currentTarget.style.background = L.cardHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>✏️</span>
                <span>Profili Düzenle</span>
              </div>
              <div
                style={{ ...menuItem }}
                onClick={() => { setMenuOpen(false); onOpenSettings(); }}
                onMouseEnter={e => e.currentTarget.style.background = L.cardHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>🔑</span>
                <span>Şifre Değiştir</span>
              </div>
              {profile?.role === "admin" && (
                <div
                  style={{ ...menuItem }}
                  onClick={() => { setMenuOpen(false); navigate("/admin"); }}
                  onMouseEnter={e => e.currentTarget.style.background = L.cardHover}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: 14 }}>👥</span>
                  <span>Kullanıcı Yönetimi</span>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${L.border}` }} />
              <div
                style={{ ...menuItem, color: "#dc2626" }}
                onClick={() => { setMenuOpen(false); onLogout(); }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <span style={{ fontSize: 14 }}>🚪</span>
                <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: L.text, marginBottom: 12, letterSpacing: -0.8 }}>
          Hoş geldin, <span style={{ color: L.accent }}>{firstName}</span>
        </div>
        <div style={{ fontSize: 15, color: L.textMuted, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Mağaza yönetim uygulamalarına tek noktadan erişin. Bir uygulamaya tıklayarak başlayın.
        </div>
      </div>

      {/* App grid */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 24px 48px" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: L.textDim,
          textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 16,
        }}>
          Uygulamalar
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {visibleApps.map(app => (
            <div
              key={app.id}
              onClick={() => navigate(`/${app.id}`)}
              style={{
                background: L.card, borderRadius: 16, padding: 24,
                border: `1px solid ${L.border}`, cursor: "pointer",
                transition: "all 0.2s", position: "relative", overflow: "hidden",
                boxShadow: L.shadow,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = L.shadowHover;
                e.currentTarget.style.borderColor = app.color + "55";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = L.shadow;
                e.currentTarget.style.borderColor = L.border;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 110, height: 110, borderRadius: "50%",
                background: `radial-gradient(circle, ${app.color}1a 0%, ${app.color}00 70%)`,
              }} />
              <div style={{
                fontSize: 36, marginBottom: 14, position: "relative",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 56, height: 56, borderRadius: 12,
                background: app.color + "14",
              }}>{app.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: L.text, marginBottom: 8 }}>{app.name}</div>
              <div style={{ fontSize: 13, color: L.textMuted, lineHeight: 1.6, marginBottom: 18, minHeight: 62 }}>
                {app.description}
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 12, color: app.color, fontWeight: 700,
                padding: "6px 12px", borderRadius: 8,
                background: app.color + "14",
              }}>
                Aç <span style={{ fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px", fontSize: 11, color: L.textDim }}>
        © {new Date().getFullYear()} Yeni Koza
      </div>
    </div>
  );
}
