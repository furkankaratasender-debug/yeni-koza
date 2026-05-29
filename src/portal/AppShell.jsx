import { useNavigate } from "react-router-dom";
import { S, btnSecondary } from "../shared/lib/theme";

/**
 * Bir app açıkken üstte gözüken minimal bar.
 * Sol: "← Yeni Koza" (portala dön)
 * Orta: app ismi + ikon
 * Sağ: kullanıcı kısayolları
 */
export function AppShell({ app, profile, onLogout, onOpenSettings, onOpenEditProfile, children }) {
  const navigate = useNavigate();

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", color: S.text }}>
      {/* App top bar */}
      <div style={{
        background: "#161c2d", padding: "0 12px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 52,
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)", position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${S.border}`, width: "100%",
      }}>
        {/* Left: portal back + app name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              ...btnSecondary, padding: "5px 10px", fontSize: 12,
              display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            }}
            title="Portal'a dön"
          >
            <span style={{ fontSize: 14 }}>←</span>
            <img
              src="/logo.png"
              alt="Yeni Koza"
              style={{ height: 20, width: "auto" }}
              onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "inline"; }}
            />
            <span className="back-label" style={{ display: "none" }}>Yeni Koza</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{app.icon}</span>
            <span style={{
              fontSize: 14, fontWeight: 700, color: S.text,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{app.name}</span>
          </div>
        </div>

        {/* Right: user actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div className="user-chip" style={{
            background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 10px",
            fontSize: 11, border: `1px solid ${S.border}`,
            maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{profile?.name}</div>
          <button onClick={onOpenSettings} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 14, flexShrink: 0 }}>🔑</button>
          <button onClick={onOpenEditProfile} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 12, flexShrink: 0 }}>✏️</button>
          <button onClick={onLogout} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 11, flexShrink: 0 }}>Çıkış</button>
        </div>
      </div>

      {/* App content */}
      <div style={{ minHeight: "calc(100vh - 52px)" }}>
        {children}
      </div>
    </div>
  );
}
