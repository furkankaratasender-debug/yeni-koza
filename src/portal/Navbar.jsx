import { useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { S, inputStyle, btnPrimary, btnSecondary } from "../shared/lib/theme";
import { MAGAZALAR_TUMU } from "../shared/lib/constants";
import { SimpleSelect } from "../shared/components";

export function Navbar({ profile, onMenuToggle, onProfileUpdated }) {
  const [showChangePw, setShowChangePw] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [pwForm, setPwForm] = useState({ next: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState("");
  const [editForm, setEditForm] = useState({ name: "", store: "" });

  async function changePassword() {
    if (!pwForm.next || !pwForm.confirm) { setPwMsg("Tüm alanları doldurun."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwMsg("Şifreler eşleşmiyor."); return; }
    if (pwForm.next.length < 6) { setPwMsg("Şifre en az 6 karakter."); return; }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next });
    if (error) { setPwMsg(error.message); return; }
    setPwMsg("✅ Şifre güncellendi.");
    setPwForm({ next: "", confirm: "" });
  }

  async function updateProfile() {
    if (!editForm.name.trim() || !editForm.store) return;
    const { error } = await supabase.from("profiles").update({ name: editForm.name.trim(), store: editForm.store }).eq("id", profile.id);
    if (!error) { setShowEditProfile(false); onProfileUpdated?.(); }
  }

  async function doLogout() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <div style={{
        background: "#161c2d", padding: "0 12px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 52,
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)", position: "sticky", top: 0, zIndex: 50,
        borderBottom: `1px solid ${S.border}`, width: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
          <button onClick={onMenuToggle} style={{ ...btnSecondary, padding: "4px 10px", fontSize: 18, lineHeight: 1, flexShrink: 0 }} className="hamburger">
            ☰
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            🏪 Yeni Koza
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "4px 10px", fontSize: 11, border: `1px solid ${S.border}`, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {profile?.name}
          </div>
          <button onClick={() => { setShowChangePw(true); setPwMsg(""); setPwForm({ next: "", confirm: "" }); }} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 14, flexShrink: 0 }}>🔑</button>
          <button onClick={() => { setEditForm({ name: profile?.name || "", store: profile?.store || "" }); setShowEditProfile(true); }} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 12, flexShrink: 0 }}>✏️</button>
          <button onClick={doLogout} style={{ ...btnSecondary, padding: "4px 8px", fontSize: 11, flexShrink: 0 }}>Çıkış</button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePw && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowChangePw(false)}>
          <div style={{ background: S.card, borderRadius: 14, padding: 28, width: "min(380px,92vw)", border: `1.5px solid ${S.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>🔑 Şifre Değiştir</div>
            {[["Yeni Şifre", "next"], ["Yeni Şifre (Tekrar)", "confirm"]].map(([lbl, k]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{lbl}</div>
                <input type="password" value={pwForm[k]} onChange={e => setPwForm({ ...pwForm, [k]: e.target.value })} style={{ ...inputStyle }} />
              </div>
            ))}
            {pwMsg && <div style={{ color: pwMsg.startsWith("✅") ? "#4ade80" : "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{pwMsg}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowChangePw(false)} style={{ ...btnSecondary }}>İptal</button>
              <button onClick={changePassword} style={{ ...btnPrimary }}>Değiştir</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowEditProfile(false)}>
          <div style={{ background: S.card, borderRadius: 14, padding: 28, width: "min(380px,92vw)", border: `1.5px solid ${S.border}` }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>✏️ Profil Düzenle</div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Ad Soyad</div>
              <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ ...inputStyle }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Mağaza</div>
              <SimpleSelect options={MAGAZALAR_TUMU} value={editForm.store} onChange={v => setEditForm(f => ({ ...f, store: v }))} placeholder="Mağaza seçin..." />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowEditProfile(false)} style={{ ...btnSecondary }}>İptal</button>
              <button onClick={updateProfile} style={{ ...btnPrimary }}>Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
