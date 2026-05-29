import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../shared/lib/supabase";
import { S, btnSecondary } from "../shared/lib/theme";
import { APPS } from "./appRegistry";

export function PortalHome({ profile, onLogout, onOpenSettings, onOpenEditProfile }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, comments: 0, displays: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("comments").select("id", { count: "exact", head: true }),
      supabase.from("displays").select("id", { count: "exact", head: true }),
    ]).then(([p, c, d]) => {
      setStats({ products: p.count || 0, comments: c.count || 0, displays: d.count || 0 });
    });
  }, []);

  const visibleApps = APPS.filter(a => !a.hidden && (!a.adminOnly || profile?.role === "admin"));

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", color: S.text }}>
      {/* Top bar */}
      <div style={{
        background: "#161c2d", padding: "0 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 56, borderBottom: `1px solid ${S.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: S.text }}>Yeni Koza</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "5px 12px",
            fontSize: 12, border: `1px solid ${S.border}`,
          }}>{profile?.name}</div>
          <button onClick={onOpenSettings} title="Şifre Değiştir" style={{ ...btnSecondary, padding: "5px 10px", fontSize: 14 }}>🔑</button>
          <button onClick={onOpenEditProfile} title="Profili Düzenle" style={{ ...btnSecondary, padding: "5px 10px", fontSize: 12 }}>✏️</button>
          <button onClick={onLogout} style={{ ...btnSecondary, padding: "5px 12px", fontSize: 12 }}>Çıkış</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🏪</div>
        <div style={{ fontSize: 32, fontWeight: 700, color: S.text, marginBottom: 10, letterSpacing: -0.5 }}>Yeni Koza</div>
        <div style={{ fontSize: 15, color: S.textMuted, lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>
          Mağaza yönetim uygulamalarına tek noktadan erişin. Bir uygulamaya tıklayarak başlayın.
        </div>
        <div style={{ marginTop: 14, fontSize: 13, color: S.textDim }}>
          Hoş geldin, <strong style={{ color: S.accent }}>{profile?.name}</strong> · {profile?.store}
          {profile?.role === "admin" && <span style={{ marginLeft: 8, padding: "2px 8px", background: "#a855f733", color: "#c084fc", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>ADMIN</span>}
        </div>
      </div>

      {/* App grid */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 24px 32px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
          Uygulamalar
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {visibleApps.map(app => (
            <div
              key={app.id}
              onClick={() => navigate(`/${app.id}`)}
              style={{
                background: S.card, borderRadius: 14, padding: 24,
                border: `1.5px solid ${S.border}`, cursor: "pointer",
                transition: "all 0.15s", position: "relative", overflow: "hidden",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = app.color; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: app.color + "11" }} />
              <div style={{ fontSize: 40, marginBottom: 14, position: "relative" }}>{app.icon}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: S.text, marginBottom: 8 }}>{app.name}</div>
              <div style={{ fontSize: 13, color: S.textMuted, lineHeight: 1.6, marginBottom: 16, minHeight: 62 }}>
                {app.description}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: app.color, fontWeight: 700 }}>
                Aç <span style={{ fontSize: 14 }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{
          marginTop: 24, background: S.card, borderRadius: 12, padding: "16px 20px",
          border: `1.5px solid ${S.border}`, display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ fontSize: 13, color: S.textMuted }}>
            <span style={{ color: S.text, fontWeight: 700 }}>Genel Bakış:</span>{" "}
            {stats.comments} yorum · {stats.products} ürün · {stats.displays} sergileme
          </div>
          {profile?.role === "admin" && (
            <button onClick={() => navigate("/admin")} style={{ ...btnSecondary, padding: "6px 14px", fontSize: 12 }}>
              👥 Kullanıcı Yönetimi →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
