import { useState, useEffect } from "react";
import { supabase } from "../../shared/lib/supabase";
import { S, inputStyle, btnPrimary, btnSecondary } from "../../shared/lib/theme";
import { REYONLAR, URUN_GRUPLARI, MARKALAR, MAGAZALAR_TUMU } from "../../shared/lib/constants";
import { fmt } from "../../shared/lib/utils";
import { Badge, SmallSelect, SearchSelect, SimpleSelect } from "../../shared/components";

async function loadCatalogFiltered(field, reyon, grup) {
  let q = supabase.from("catalog_products").select(field);
  if (reyon) q = q.eq("reyon", reyon);
  if (grup) q = q.eq("urun_grubu", grup);
  const { data } = await q;
  return [...new Set((data || []).map(r => r[field]).filter(Boolean))].sort();
}

export function Sergileme({ profile }) {
  const [displays, setDisplays] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [showAddDisplay, setShowAddDisplay] = useState(false);
  const [newDisplay, setNewDisplay] = useState({ reyon: "", grup: "", marka: "", store: "", note: "", file: null, preview: null });
  const [displayUploading, setDisplayUploading] = useState(false);
  const [displayFilter, setDisplayFilter] = useState({ reyon: "", grup: "", marka: "", store: "" });
  const [displayFilteredGruplar, setDisplayFilteredGruplar] = useState([]);
  const [displayFilteredMarkalar, setDisplayFilteredMarkalar] = useState([]);
  const [displayTimeFilter, setDisplayTimeFilter] = useState("all");
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data } = await supabase.from("displays").select("*").order("created_at", { ascending: false });
    if (data) setDisplays(data);
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const filteredDisplays = displays.filter(d => {
    if (displayFilter.reyon && d.reyon !== displayFilter.reyon) return false;
    if (displayFilter.grup && d.urun_grubu !== displayFilter.grup) return false;
    if (displayFilter.marka && d.marka !== displayFilter.marka) return false;
    if (displayFilter.store && d.store !== displayFilter.store) return false;
    if (displayTimeFilter === "week" && new Date(d.created_at) <= oneWeekAgo) return false;
    return true;
  });

  async function submitDisplay() {
    if (!newDisplay.reyon || !newDisplay.marka || !newDisplay.file) {
      showToast("⚠️ Reyon, marka ve fotoğraf zorunlu."); return;
    }
    const store = newDisplay.store || profile.store;
    if (!store) { showToast("⚠️ Mağaza seçin."); return; }
    setDisplayUploading(true);
    const ext = newDisplay.file.name.split(".").pop();
    const path = `displays/${Date.now()}_${profile.id}.${ext}`;
    const { data: up } = await supabase.storage.from("Photos").upload(path, newDisplay.file, { upsert: true });
    if (!up) { setDisplayUploading(false); showToast("❌ Fotoğraf yüklenemedi."); return; }
    const { data: { publicUrl } } = supabase.storage.from("Photos").getPublicUrl(path);
    const { error } = await supabase.from("displays").insert({
      user_id: profile.id, user_name: profile.name, store,
      reyon: newDisplay.reyon, urun_grubu: newDisplay.grup || null, marka: newDisplay.marka,
      note: newDisplay.note || null, url: publicUrl,
    });
    setDisplayUploading(false);
    if (error) { showToast("❌ " + error.message); return; }
    showToast("✅ Sergileme paylaşıldı!");
    setShowAddDisplay(false);
    setNewDisplay({ reyon: "", grup: "", marka: "", store: "", note: "", file: null, preview: null });
    loadData();
  }

  function clearFilters() {
    setDisplayFilter({ reyon: "", grup: "", marka: "", store: "" });
    setDisplayFilteredGruplar([]); setDisplayFilteredMarkalar([]);
  }

  return (
    <div style={{ padding: 24, overflowY: "auto", height: "calc(100vh - 52px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: S.text }}>🖼️ Sergileme Galerisi</div>
          <div style={{ fontSize: 13, color: S.textMuted, marginTop: 3 }}>Başarılı sergileme ve kombinasyon fikirlerini keşfedin</div>
        </div>
        <button onClick={() => setShowAddDisplay(true)} style={{ ...btnPrimary }}>+ Sergileme Paylaş</button>
      </div>

      {/* Filters */}
      <div style={{ background: S.sidebar, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px solid ${S.border}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          {[
            { label: "Reyon", opts: ["Tümü", ...REYONLAR], key: "reyon" },
            { label: "Ürün Grubu", opts: ["Tümü", ...(displayFilteredGruplar.length ? displayFilteredGruplar : URUN_GRUPLARI)], key: "grup" },
            { label: "Marka", opts: ["Tümü", ...(displayFilteredMarkalar.length ? displayFilteredMarkalar : MARKALAR)], key: "marka" },
          ].map(({ label, opts, key }) => (
            <div key={key}>
              <div style={{ fontSize: 10, color: S.textDim, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
              <SmallSelect options={opts} value={displayFilter[key] || "Tümü"} onChange={async v => {
                if (key === "reyon") {
                  const reyon = v === "Tümü" ? "" : v;
                  setDisplayFilter(f => ({ ...f, reyon, grup: "", marka: "" }));
                  if (reyon) {
                    const g = await loadCatalogFiltered("urun_grubu", reyon, null);
                    setDisplayFilteredGruplar(g);
                    const m = await loadCatalogFiltered("marka", reyon, null);
                    setDisplayFilteredMarkalar(m);
                  } else { setDisplayFilteredGruplar([]); setDisplayFilteredMarkalar([]); }
                } else if (key === "grup") {
                  const grup = v === "Tümü" ? "" : v;
                  setDisplayFilter(f => ({ ...f, grup, marka: "" }));
                  if (grup) { const m = await loadCatalogFiltered("marka", displayFilter.reyon || null, grup); setDisplayFilteredMarkalar(m); }
                } else {
                  setDisplayFilter(f => ({ ...f, marka: v === "Tümü" ? "" : v }));
                }
              }} />
            </div>
          ))}
        </div>
        {(displayFilter.reyon || displayFilter.grup || displayFilter.marka) && (
          <button onClick={clearFilters} style={{ background: "none", border: "none", color: S.accent, fontSize: 11, cursor: "pointer", padding: 0 }}>× Filtreleri temizle</button>
        )}
      </div>

      {/* Store + time filter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5 }}>Mağazalar</div>
          <div style={{ display: "flex", gap: 4 }}>
            {[["all", "Tüm Zamanlar"], ["week", "Son Hafta"]].map(([val, lbl]) => (
              <button key={val} onClick={() => setDisplayTimeFilter(val)}
                style={{ padding: "3px 10px", borderRadius: 12, border: `1px solid ${displayTimeFilter === val ? S.accent : S.border}`, background: displayTimeFilter === val ? S.accent + "33" : "transparent", color: displayTimeFilter === val ? S.accent : S.textDim, fontSize: 11, cursor: "pointer", fontWeight: displayTimeFilter === val ? 700 : 400 }}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MAGAZALAR_TUMU.map(store => {
            const cnt = displays.filter(d => d.store === store && (displayTimeFilter === "all" || new Date(d.created_at) > oneWeekAgo)).length;
            const isActive = displayFilter.store === store;
            return (
              <button key={store} onClick={() => setDisplayFilter(f => ({ ...f, store: isActive ? "" : store }))}
                style={{ padding: "4px 10px", borderRadius: 16, border: `1px solid ${isActive ? S.accent : cnt > 0 ? "#4ade8044" : S.border}`, background: isActive ? S.accent + "33" : cnt > 0 ? "#4ade8011" : "transparent", color: isActive ? S.accent : cnt > 0 ? "#4ade80" : S.textDim, fontSize: 11, cursor: "pointer", fontWeight: isActive ? 700 : 400 }}>
                {store}{cnt > 0 && <span style={{ fontSize: 10, marginLeft: 4 }}>({cnt})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filteredDisplays.length === 0 ? (
        <div style={{ textAlign: "center", color: S.textDim, padding: "60px 0", fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
          <div>Henüz sergileme paylaşılmamış.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 16 }}>
          {filteredDisplays.map(d => (
            <div key={d.id} style={{ background: S.card, borderRadius: 12, overflow: "hidden", border: `1.5px solid ${S.border}` }}>
              <img src={d.url} alt="" onClick={() => setLightbox(d.url)} style={{ width: "100%", height: 180, objectFit: "cover", cursor: "pointer", display: "block" }} />
              <div style={{ padding: "12px 14px" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <Badge>{d.reyon}</Badge><Badge>{d.marka}</Badge>{d.urun_grubu && <Badge>{d.urun_grubu}</Badge>}
                </div>
                {d.note && <div style={{ fontSize: 12, color: S.textMuted, lineHeight: 1.6, marginBottom: 8 }}>{d.note}</div>}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 11, color: S.textDim }}>👤 {d.user_name} · {d.store}</span>
                  <span style={{ fontSize: 11, color: S.textDim }}>{fmt(d.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Display Modal */}
      {showAddDisplay && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowAddDisplay(false)}>
          <div style={{ background: S.card, borderRadius: 14, padding: 28, width: "min(460px,92vw)", border: `1.5px solid ${S.border}`, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 6 }}>🖼️ Sergileme Paylaş</div>
            <div style={{ fontSize: 12, color: S.textMuted, marginBottom: 20 }}>Başarılı bir sergileme veya kombinasyonu paylaşın</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Reyon *</div>
                <SimpleSelect options={REYONLAR} value={newDisplay.reyon} onChange={v => setNewDisplay({ ...newDisplay, reyon: v })} placeholder="Seç..." />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Marka *</div>
                <SearchSelect options={MARKALAR} value={newDisplay.marka} onChange={v => setNewDisplay({ ...newDisplay, marka: v })} placeholder="Seç..." />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Ürün Grubu</div>
              <SimpleSelect options={URUN_GRUPLARI} value={newDisplay.grup} onChange={v => setNewDisplay({ ...newDisplay, grup: v })} placeholder="Opsiyonel..." />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Mağaza *</div>
              <SimpleSelect options={MAGAZALAR_TUMU} value={newDisplay.store || profile?.store} onChange={v => setNewDisplay({ ...newDisplay, store: v })} placeholder="Mağaza seç..." />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Not</div>
              <textarea value={newDisplay.note} onChange={e => setNewDisplay({ ...newDisplay, note: e.target.value })} placeholder="Ne işe yaradı? Hangi kombinasyon iyi sattı?" style={{ ...inputStyle, minHeight: 70, resize: "vertical", fontFamily: "inherit" }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Fotoğraf *</div>
              {newDisplay.preview ? (
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                  <img src={newDisplay.preview} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, border: `1.5px solid ${S.border}` }} />
                  <button onClick={() => setNewDisplay({ ...newDisplay, file: null, preview: null })} style={{ position: "absolute", top: 6, right: 6, background: "#dc2626", color: "white", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>×</button>
                </div>
              ) : (
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "28px 16px", border: `2px dashed ${S.inputBorder}`, borderRadius: 8, cursor: "pointer", color: S.textDim, fontSize: 13 }}>
                  <span style={{ fontSize: 28 }}>📷</span><span>Fotoğraf seç veya çek</span>
                  <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files[0]; if (f) setNewDisplay({ ...newDisplay, file: f, preview: URL.createObjectURL(f) }); }} style={{ display: "none" }} />
                </label>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAddDisplay(false)} style={{ ...btnSecondary }}>İptal</button>
              <button onClick={submitDisplay} disabled={displayUploading} style={{ ...btnPrimary, opacity: displayUploading ? 0.7 : 1 }}>{displayUploading ? "Yükleniyor..." : "Paylaş"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={lightbox} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }} />
        </div>
      )}

      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: S.card, color: S.text, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", zIndex: 999, border: `1.5px solid ${S.border}` }}>{toast}</div>}
    </div>
  );
}
