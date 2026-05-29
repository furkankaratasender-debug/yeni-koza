import { useState, useEffect } from "react";
import { supabase } from "../shared/lib/supabase";
import { S } from "../shared/lib/theme";

export function AdminPage() {
  const [allProfiles, setAllProfiles] = useState([]);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  useEffect(() => { loadProfiles(); }, []);

  async function loadProfiles() {
    const { data } = await supabase.from("profiles").select("*").order("name");
    if (data) setAllProfiles(data);
  }

  async function updateUserRole(userId, role) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
    if (!error) {
      setAllProfiles(ps => ps.map(p => p.id === userId ? { ...p, role } : p));
      showToast("✅ Rol güncellendi.");
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: S.text }}>👥 Kullanıcı Yönetimi</div>
        <div style={{ color: S.textMuted, fontSize: 13, marginTop: 4 }}>Kullanıcı rollerini yönetin</div>
      </div>
      <div style={{ background: S.card, borderRadius: 12, padding: 20, border: `1.5px solid ${S.border}` }}>
        {/* Desktop table */}
        <table style={{ width: "100%", borderCollapse: "collapse" }} className="admin-table">
          <thead>
            <tr>
              {["Ad Soyad", "Rol", "Mağaza", "E-posta"].map(h => (
                <th key={h} style={{ background: S.sidebar, padding: "10px 14px", textAlign: "left", fontSize: 11, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1.5px solid ${S.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allProfiles.map(p => (
              <tr key={p.id} style={{ borderBottom: `1px solid ${S.border}` }}>
                <td style={{ padding: "10px 14px", fontSize: 13, color: S.text }}>{p.name}</td>
                <td style={{ padding: "10px 14px" }}>
                  <select value={p.role} onChange={e => updateUserRole(p.id, e.target.value)}
                    style={{ background: S.input, color: S.text, border: `1px solid ${S.border}`, borderRadius: 5, padding: "4px 8px", fontSize: 12 }}>
                    <option value="store">Mağaza</option>
                    <option value="center">Merkez</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px", fontSize: 13, color: S.textMuted }}>{p.store}</td>
                <td style={{ padding: "10px 14px", fontSize: 12, color: S.textDim }}>{p.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mobile cards */}
        <div className="admin-cards" style={{ display: "none" }}>
          {allProfiles.map(p => (
            <div key={p.id} style={{ background: S.sidebar, borderRadius: 8, padding: "12px 14px", border: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: S.text, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: S.textMuted, marginTop: 2 }}>{p.store}</div>
                <div style={{ marginTop: 6 }}>
                  <select value={p.role} onChange={e => updateUserRole(p.id, e.target.value)}
                    style={{ background: S.input, color: S.text, border: `1px solid ${S.border}`, borderRadius: 5, padding: "4px 8px", fontSize: 12 }}>
                    <option value="store">Mağaza</option>
                    <option value="center">Merkez</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: S.card, color: S.text, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", zIndex: 999, border: `1.5px solid ${S.border}` }}>{toast}</div>}
    </div>
  );
}
