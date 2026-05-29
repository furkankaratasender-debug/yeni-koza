import { useState, useEffect } from "react";
import { supabase } from "../shared/lib/supabase";
import { S, inputStyle, btnPrimary, btnSecondary } from "../shared/lib/theme";
import { MAGAZALAR_TUMU } from "../shared/lib/constants";
import { SimpleSelect } from "../shared/components";

export function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({ next: "", confirm: "" });
  const [msg, setMsg] = useState("");

  useEffect(() => { if (open) { setForm({ next: "", confirm: "" }); setMsg(""); } }, [open]);

  if (!open) return null;

  async function change() {
    if (!form.next || !form.confirm) { setMsg("Tüm alanları doldurun."); return; }
    if (form.next !== form.confirm) { setMsg("Şifreler eşleşmiyor."); return; }
    if (form.next.length < 6) { setMsg("Şifre en az 6 karakter."); return; }
    const { error } = await supabase.auth.updateUser({ password: form.next });
    if (error) { setMsg(error.message); return; }
    setMsg("✅ Şifre güncellendi.");
    setTimeout(onClose, 1200);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: S.card, borderRadius: 14, padding: 28, width: "min(380px,92vw)", border: `1.5px solid ${S.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>🔑 Şifre Değiştir</div>
        {[["Yeni Şifre", "next"], ["Yeni Şifre (Tekrar)", "confirm"]].map(([lbl, k]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{lbl}</div>
            <input type="password" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} style={{ ...inputStyle }} />
          </div>
        ))}
        {msg && <div style={{ color: msg.startsWith("✅") ? "#4ade80" : "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{msg}</div>}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...btnSecondary }}>İptal</button>
          <button onClick={change} style={{ ...btnPrimary }}>Değiştir</button>
        </div>
      </div>
    </div>
  );
}

export function EditProfileModal({ open, onClose, profile, onSaved }) {
  const [form, setForm] = useState({ name: "", store: "" });

  useEffect(() => {
    if (open && profile) setForm({ name: profile.name || "", store: profile.store || "" });
  }, [open, profile]);

  if (!open) return null;

  async function save() {
    if (!form.name.trim() || !form.store) return;
    const { error } = await supabase.from("profiles").update({ name: form.name.trim(), store: form.store }).eq("id", profile.id);
    if (!error) { onSaved?.(); onClose(); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: S.card, borderRadius: 14, padding: 28, width: "min(380px,92vw)", border: `1.5px solid ${S.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>✏️ Profil Düzenle</div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Ad Soyad</div>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle }} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Mağaza</div>
          <SimpleSelect options={MAGAZALAR_TUMU} value={form.store} onChange={v => setForm(f => ({ ...f, store: v }))} placeholder="Mağaza seçin..." />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ ...btnSecondary }}>İptal</button>
          <button onClick={save} style={{ ...btnPrimary }}>Kaydet</button>
        </div>
      </div>
    </div>
  );
}
