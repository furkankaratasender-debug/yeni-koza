import { useState, useEffect } from "react";
import { supabase } from "../shared/lib/supabase";
import { S, btnPrimary, btnSecondary } from "../shared/lib/theme";

export function HomePage({ profile, onNavigate }) {
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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🏪</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: S.text, marginBottom: 8 }}>Yeni Koza</div>
        <div style={{ fontSize: 14, color: S.textMuted, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
          Mağazalar arasında ürün geri bildirimi paylaşın, başarılı sergileme fikirlerini keşfedin.
        </div>
        {profile && (
          <div style={{ marginTop: 12, fontSize: 13, color: S.textDim }}>
            Hoş geldin, <strong style={{ color: S.accent }}>{profile.name}</strong> · {profile.store}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {[
          { key: "products", icon: "📦", title: "Ürün Yorumları", desc: "Belirli bir ürün hakkında satış performansı, fiyat değerlendirmesi, müşteri geri bildirimi gibi notlar paylaşın.", cta: "Ürünlere git →" },
          { key: "gallery", icon: "🖼️", title: "Sergileme Galerisi", desc: "Başarılı reyon düzenlemelerini ve kombinasyon fikirlerini paylaşın. Diğer mağazaların ilham verici sergilemeleri görseller eşliğinde keşfedin.", cta: "Galeriye git →" },
        ].map(item => (
          <div
            key={item.key}
            onClick={() => onNavigate(item.key)}
            style={{ background: S.card, borderRadius: 14, padding: 28, border: `1.5px solid ${S.border}`, cursor: "pointer", transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = S.accent}
            onMouseLeave={e => e.currentTarget.style.borderColor = S.border}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 8 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: S.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: S.accent, fontWeight: 600 }}>{item.cta}</div>
          </div>
        ))}
      </div>

      <div style={{ background: S.card, borderRadius: 12, padding: "16px 20px", border: `1.5px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: S.text }}>Genel Bakış</div>
          <div style={{ fontSize: 12, color: S.textMuted }}>{stats.comments} yorum · {stats.products} ürün · {stats.displays} sergileme</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onNavigate("products")} style={{ ...btnPrimary, padding: "8px 16px", fontSize: 12 }}>+ Ürün Yorumu</button>
          <button onClick={() => onNavigate("gallery")} style={{ ...btnSecondary, padding: "8px 16px", fontSize: 12 }}>+ Sergileme</button>
        </div>
      </div>
    </div>
  );
}
