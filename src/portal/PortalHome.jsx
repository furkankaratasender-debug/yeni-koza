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
};

const btnLight = {
  background: "white",
  color: L.textMuted,
  border: `1px solid ${L.border}`,
  padding: "7px 12px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

export function PortalHome({ profile, onLogout, onOpenSettings, onOpenEditProfile }) {
  const navigate = useNavigate();
  const visibleApps = APPS.filter(a => !a.hidden && (!a.adminOnly || profile?.role === "admin"));

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
          {/* Logo: önce /logo.png varsa onu, yoksa emoji fallback */}
          <img
            src="/logo.png"
            alt="Yeni Koza"
            style={{ height: 32, width: "auto" }}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline"; }}
          />
          <span style={{ fontSize: 22, display: "none" }}>🏪</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: L.text, letterSpacing: -0.2 }}>Yeni Koza</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: L.accentLight, color: L.accent, borderRadius: 20,
            padding: "5px 12px", fontSize: 12, fontWeight: 600,
            border: `1px solid ${L.accent}22`,
          }}>{profile?.name}</div>
          <button onClick={onOpenSettings} title="Şifre Değiştir" style={{ ...btnLight, padding: "6px 10px", fontSize: 14 }}>🔑</button>
          <button onClick={onOpenEditProfile} title="Profili Düzenle" style={{ ...btnLight, padding: "6px 10px", fontSize: 12 }}>✏️</button>
          <button onClick={onLogout} style={{ ...btnLight, padding: "6px 12px" }}>Çıkış</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px 28px", textAlign: "center" }}>
        <img
          src="/logo.png"
          alt=""
          style={{ height: 72, width: "auto", marginBottom: 20 }}
          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }}
        />
        <div style={{ fontSize: 56, marginBottom: 16, display: "none" }}>🏪</div>

        <div style={{ fontSize: 34, fontWeight: 700, color: L.text, marginBottom: 12, letterSpacing: -0.8 }}>
          Hoş geldin, <span style={{ color: L.accent }}>{profile?.name?.split(" ")[0]}</span>
        </div>
        <div style={{ fontSize: 15, color: L.textMuted, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Mağaza yönetim uygulamalarına tek noktadan erişin. Bir uygulamaya tıklayarak başlayın.
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: L.textDim, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>📍 {profile?.store}</span>
          {profile?.role === "admin" && (
            <span style={{
              padding: "3px 10px", background: "#fef3c7", color: "#92400e",
              borderRadius: 10, fontSize: 11, fontWeight: 700,
              border: "1px solid #fcd34d",
            }}>ADMIN</span>
          )}
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
              {/* Decorative gradient blob */}
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

        {/* Admin button - sadece adminler için, dipte sade buton */}
        {profile?.role === "admin" && (
          <div style={{ marginTop: 28, textAlign: "center" }}>
            <button onClick={() => navigate("/admin")} style={{ ...btnLight, padding: "10px 20px", fontSize: 13 }}>
              👥 Kullanıcı Yönetimi
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px", fontSize: 11, color: L.textDim }}>
        © {new Date().getFullYear()} Yeni Koza
      </div>
    </div>
  );
}
