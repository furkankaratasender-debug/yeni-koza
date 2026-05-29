import { useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { S, inputStyle, btnPrimary } from "../shared/lib/theme";
import { MAGAZALAR_TUMU } from "../shared/lib/constants";
import { SimpleSelect } from "../shared/components";

export function ProfileSetup({ authUser, onComplete }) {
  const [name, setName] = useState(authUser?.user_metadata?.name || authUser?.email?.split("@")[0] || "");
  const [store, setStore] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  async function save() {
    if (!name.trim() || !store) { setErr("Ad ve mağaza seçimi zorunlu."); return; }
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ id: authUser.id, name: name.trim(), store, role: "store" });
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onComplete();
  }

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "min(400px,100%)", background: S.card, borderRadius: 16, padding: 32, border: `1.5px solid ${S.border}` }}>
        <div style={{ fontSize: 28, marginBottom: 8, textAlign: "center" }}>👤</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: S.text, marginBottom: 6, textAlign: "center" }}>Profilini Tamamla</div>
        <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 24, textAlign: "center" }}>Sistemi kullanabilmek için adın ve mağazan gerekli.</div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, marginBottom: 6 }}>Ad Soyad</div>
          <input value={name} onChange={e => setName(e.target.value)} style={{ ...inputStyle }} placeholder="Adın Soyadın" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, marginBottom: 6 }}>Mağaza</div>
          <SimpleSelect options={MAGAZALAR_TUMU} value={store} onChange={setStore} placeholder="Mağazanı seçin..." />
        </div>
        {err && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</div>}
        <button onClick={save} disabled={saving} style={{ ...btnPrimary, width: "100%", opacity: saving ? 0.7 : 1 }}>
          {saving ? "Kaydediliyor..." : "Devam Et"}
        </button>
      </div>
    </div>
  );
}
