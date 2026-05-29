import { S } from "../shared/lib/theme";

const NAV_ITEMS = [
  { key: "home",     label: "🏠 Ana Sayfa",          desc: "Genel bakış" },
  { key: "products", label: "📦 Ürün Yorumları",      desc: "Ürün bazlı geri bildirim" },
  { key: "gallery",  label: "🖼️ Sergileme Galerisi",  desc: "Başarılı sergileme fikirleri" },
  { key: "admin",    label: "👥 Kullanıcı Yönetimi",  adminOnly: true },
];

export function Sidebar({ page, onNavigate, isOpen, onClose, profile }) {
  return (
    <div
      style={{ background: S.sidebar, borderRight: `1.5px solid ${S.border}`, display: "flex", flexDirection: "column" }}
      className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
    >
      <div style={{ padding: "14px 0 8px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, padding: "0 16px 8px" }}>
          Menü
        </div>
        {NAV_ITEMS
          .filter(item => !item.adminOnly || profile?.role === "admin")
          .map(item => (
            <div
              key={item.key}
              onClick={() => { onNavigate(item.key); onClose(); }}
              style={{
                padding: "10px 16px", cursor: "pointer",
                borderLeft: `3px solid ${page === item.key ? S.accent : "transparent"}`,
                background: page === item.key ? S.accent + "22" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 13, color: page === item.key ? S.accent : S.text, fontWeight: page === item.key ? 700 : 400 }}>
                {item.label}
              </div>
              {item.desc && (
                <div style={{ fontSize: 11, color: S.textDim, marginTop: 1 }}>{item.desc}</div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
