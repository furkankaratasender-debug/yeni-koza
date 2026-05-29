import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../shared/lib/supabase";
import { S, inputStyle, btnPrimary, btnSecondary } from "../../shared/lib/theme";
import { REYONLAR, URUN_GRUPLARI, MARKALAR, KATEGORILER, MAGAZALAR, KAT_BORDER } from "../../shared/lib/constants";
import { fmt } from "../../shared/lib/utils";
import { Badge, SearchSelect, SimpleSelect } from "../../shared/components";

async function loadCatalogFiltered(field, reyon, grup) {
  let q = supabase.from("catalog_products").select(field);
  if (reyon) q = q.eq("reyon", reyon);
  if (grup) q = q.eq("urun_grubu", grup);
  const { data } = await q;
  return [...new Set((data || []).map(r => r[field]).filter(Boolean))].sort();
}

async function loadCatalogCodes(reyon, grup, marka) {
  let q = supabase.from("catalog_products").select("code");
  if (reyon) q = q.eq("reyon", reyon);
  if (grup) q = q.eq("urun_grubu", grup);
  if (marka) q = q.eq("marka", marka);
  const { data } = await q;
  return [...new Set((data || []).map(r => r.code).filter(Boolean))].sort();
}

export function UrunYorumlari({ profile }) {
  const [products, setProducts]             = useState([]);
  const [comments, setComments]             = useState([]);
  const [photos, setPhotos]                 = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [filterCat, setFilterCat]           = useState("Tümü");
  const [productSearch, setProductSearch]   = useState("");
  const [lightbox, setLightbox]             = useState(null);
  const [showAddProd, setShowAddProd]       = useState(false);
  const [newProd, setNewProd]               = useState({ code: "", desc: "", reyon: "", grup: "", marka: "" });
  const [catalogCodes, setCatalogCodes]     = useState([]);
  const [manualCode, setManualCode]         = useState(false);
  const [filteredGruplar, setFilteredGruplar] = useState([]);
  const [filteredMarkalar, setFilteredMarkalar] = useState([]);
  const [newComment, setNewComment]         = useState({ text: "", category: "", store: "" });
  const [pendingPhoto, setPendingPhoto]     = useState(null);
  const [pendingPhotoPreview, setPendingPhotoPreview] = useState(null);
  const [submitting, setSubmitting]         = useState(false);
  const [toast, setToast]                   = useState("");
  const [openR, setOpenR]                   = useState({});
  const [openG, setOpenG]                   = useState({});
  const [openM, setOpenM]                   = useState({});

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [{ data: p }, { data: c }, { data: ph }] = await Promise.all([
      supabase.from("products").select("*").order("code"),
      supabase.from("comments").select("*").order("created_at", { ascending: false }),
      supabase.from("photos").select("*").order("created_at", { ascending: false }),
    ]);
    if (p) setProducts(p);
    if (c) setComments(c);
    if (ph) setPhotos(ph);
  }

  const selectedProduct = products.find(p => p.id === selectedProductId) || null;
  const productCommentCount = (id) => comments.filter(c => c.product_id === id).length;
  const filteredComments = selectedProductId
    ? comments.filter(c => c.product_id === selectedProductId && (filterCat === "Tümü" || c.category === filterCat))
    : [];
  const productPhotos = selectedProductId ? photos.filter(ph => ph.product_id === selectedProductId && !ph.comment_id) : [];

  // Sidebar tree
  const tree = useMemo(() => {
    const t = {};
    products.forEach(p => {
      if (!t[p.reyon]) t[p.reyon] = {};
      if (!t[p.reyon][p.urun_grubu || "Diğer"]) t[p.reyon][p.urun_grubu || "Diğer"] = {};
      if (!t[p.reyon][p.urun_grubu || "Diğer"][p.marka || "Diğer"]) t[p.reyon][p.urun_grubu || "Diğer"][p.marka || "Diğer"] = [];
      t[p.reyon][p.urun_grubu || "Diğer"][p.marka || "Diğer"].push(p);
    });
    return t;
  }, [products]);

  async function addProduct() {
    if (!newProd.reyon || !newProd.grup || !newProd.marka || !newProd.code) {
      showToast("⚠️ Zorunlu alanları doldurun."); return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("products").insert({
      code: newProd.code, description: newProd.desc || null,
      reyon: newProd.reyon, urun_grubu: newProd.grup, marka: newProd.marka,
      created_by: profile.id,
    });
    setSubmitting(false);
    if (error) { showToast("❌ " + error.message); return; }
    showToast("✅ Ürün eklendi!");
    setShowAddProd(false);
    setNewProd({ code: "", desc: "", reyon: "", grup: "", marka: "" });
    setManualCode(false); setCatalogCodes([]); setFilteredGruplar([]); setFilteredMarkalar([]);
    loadData();
  }

  async function submitComment() {
    if (!newComment.text.trim() || !newComment.category || !newComment.store) {
      showToast("⚠️ Yorum, kategori ve mağaza zorunlu."); return;
    }
    setSubmitting(true);
    const { data: commentData, error } = await supabase.from("comments").insert({
      product_id: selectedProductId, user_id: profile.id,
      user_name: profile.name, store: newComment.store,
      category: newComment.category, text: newComment.text,
    }).select().single();
    if (error) { setSubmitting(false); showToast("❌ " + error.message); return; }
    if (pendingPhoto && commentData) {
      const ext = pendingPhoto.name.split(".").pop();
      const path = `${Date.now()}_${profile.id}.${ext}`;
      const { data: up } = await supabase.storage.from("Photos").upload(path, pendingPhoto, { upsert: true });
      if (up) {
        const { data: { publicUrl } } = supabase.storage.from("Photos").getPublicUrl(path);
        await supabase.from("photos").insert({
          product_id: selectedProductId, comment_id: commentData.id,
          user_id: profile.id, user_name: profile.name, store: newComment.store, url: publicUrl,
        });
      }
    }
    setSubmitting(false);
    setNewComment({ text: "", category: "", store: "" });
    setPendingPhoto(null); setPendingPhotoPreview(null);
    showToast("✅ Yorum eklendi!");
    loadData();
  }

  function resetAddProd() {
    setShowAddProd(false); setManualCode(false);
    setCatalogCodes([]); setFilteredGruplar([]); setFilteredMarkalar([]);
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 52px)", overflow: "hidden" }}>
      {/* Product tree sidebar */}
      <div style={{ width: 260, flexShrink: 0, background: S.sidebar, borderRight: `1.5px solid ${S.border}`, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px 8px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim }}>Ürünler</div>
          <button onClick={() => setShowAddProd(true)} style={{ background: S.accent, color: "white", border: "none", borderRadius: "50%", width: 22, height: 22, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>+</button>
        </div>
        {Object.keys(tree).length === 0 && <div style={{ padding: "12px 16px", fontSize: 12, color: S.textDim }}>Henüz ürün yok.</div>}
        {Object.keys(tree).sort().map(reyon => {
          const rOpen = !!openR[reyon];
          return (
            <div key={reyon}>
              <div onClick={() => setOpenR(o => ({ ...o, [reyon]: !o[reyon] }))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px 6px 14px", cursor: "pointer", userSelect: "none" }}>
                <span style={{ fontSize: 10, color: S.textDim, width: 12 }}>{rOpen ? "▾" : "▸"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: S.text }}>{reyon}</span>
              </div>
              {rOpen && Object.keys(tree[reyon]).sort().map(grup => {
                const gKey = reyon + "|" + grup; const gOpen = !!openG[gKey];
                return (
                  <div key={grup}>
                    <div onClick={() => setOpenG(o => ({ ...o, [gKey]: !o[gKey] }))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px 5px 26px", cursor: "pointer", userSelect: "none" }}>
                      <span style={{ fontSize: 10, color: S.textDim, width: 12 }}>{gOpen ? "▾" : "▸"}</span>
                      <span style={{ fontSize: 12, color: S.textMuted }}>{grup}</span>
                    </div>
                    {gOpen && Object.keys(tree[reyon][grup]).sort().map(marka => {
                      const mKey = reyon + "|" + grup + "|" + marka; const mOpen = !!openM[mKey];
                      return (
                        <div key={marka}>
                          <div onClick={() => setOpenM(o => ({ ...o, [mKey]: !o[mKey] }))} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px 4px 38px", cursor: "pointer", userSelect: "none" }}>
                            <span style={{ fontSize: 10, color: S.textDim, width: 12 }}>{mOpen ? "▾" : "▸"}</span>
                            <span style={{ fontSize: 12, color: S.textDim, fontStyle: "italic" }}>{marka}</span>
                          </div>
                          {mOpen && tree[reyon][grup][marka].map(prod => {
                            const cnt = productCommentCount(prod.id);
                            const isSel = selectedProductId === prod.id;
                            return (
                              <div key={prod.id} onClick={() => { setSelectedProductId(prod.id); setFilterCat("Tümü"); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 12px 5px 50px", cursor: "pointer", background: isSel ? S.accent + "22" : "transparent", borderLeft: `3px solid ${isSel ? S.accent : "transparent"}` }}>
                                <span style={{ fontSize: 12, color: isSel ? S.accent : S.textMuted, fontWeight: isSel ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{prod.code}</span>
                                {cnt > 0 && <span style={{ fontSize: 10, background: S.border, color: S.textMuted, borderRadius: 10, padding: "1px 6px", flexShrink: 0, marginLeft: 4 }}>{cnt}</span>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 24, minWidth: 0 }}>
        {!selectedProduct ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: S.text }}>📦 Ürün Yorumları</div>
                <div style={{ fontSize: 13, color: S.textMuted, marginTop: 3 }}>Bir ürün seçin veya yeni ürün ekleyin</div>
              </div>
              <button onClick={() => setShowAddProd(true)} style={{ background: "#2d4a2d", color: "#4ade80", border: "1.5px solid #16a34a88", padding: "10px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                + Yeni Ürün Ekle
              </button>
            </div>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: S.textDim }}>🔍</div>
              <input value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Ürün kodu, marka veya açıklama ara..." style={{ ...inputStyle, paddingLeft: 42, borderColor: productSearch ? S.accent : S.inputBorder }} />
              {productSearch && <span onClick={() => setProductSearch("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: S.textDim, fontSize: 18 }}>×</span>}
            </div>
            {(() => {
              const q = productSearch.toLowerCase();
              const filtered = productSearch
                ? products.filter(p => p.code.toLowerCase().includes(q) || (p.marka || "").toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.urun_grubu || "").toLowerCase().includes(q))
                : [...products].sort((a, b) => productCommentCount(b.id) - productCommentCount(a.id)).slice(0, 12);
              if (products.length === 0) return (
                <div style={{ textAlign: "center", color: S.textDim, padding: "60px 0" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                  <div style={{ marginBottom: 8, color: S.textMuted }}>Henüz ürün eklenmemiş.</div>
                  <button onClick={() => setShowAddProd(true)} style={{ ...btnPrimary, marginTop: 8 }}>+ İlk Ürünü Ekle</button>
                </div>
              );
              if (productSearch && filtered.length === 0) return (
                <div style={{ textAlign: "center", color: S.textDim, padding: "40px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
                  <div style={{ color: S.textMuted, marginBottom: 16 }}>"{productSearch}" ile eşleşen ürün bulunamadı.</div>
                  <button onClick={() => setShowAddProd(true)} style={{ background: "#2d4a2d", color: "#4ade80", border: "1.5px solid #16a34a88", padding: "10px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    + Bu ürünü sisteme ekle
                  </button>
                </div>
              );
              return (
                <>
                  <div style={{ fontSize: 12, color: S.textDim, marginBottom: 12 }}>
                    {productSearch ? `${filtered.length} sonuç bulundu` : `En çok yorumlanan ürünler — ${products.length} ürün sistemde`}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 12 }}>
                    {filtered.map(p => {
                      const cnt = productCommentCount(p.id);
                      return (
                        <div key={p.id} onClick={() => { setSelectedProductId(p.id); setProductSearch(""); }}
                          style={{ background: S.card, borderRadius: 12, padding: 16, border: `1.5px solid ${S.border}`, cursor: "pointer", transition: "border-color 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = S.accent}
                          onMouseLeave={e => e.currentTarget.style.borderColor = S.border}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: S.text, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.code}</div>
                          {p.description && <div style={{ fontSize: 11, color: S.textDim, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</div>}
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}><Badge>{p.reyon}</Badge><Badge>{p.marka}</Badge></div>
                          <div style={{ fontSize: 12, color: cnt > 0 ? S.accent : S.textDim, fontWeight: cnt > 0 ? 600 : 400 }}>{cnt > 0 ? `💬 ${cnt} yorum` : "Henüz yorum yok"}</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div>
            <div style={{ background: S.card, borderRadius: 12, padding: "14px 18px", marginBottom: 16, border: `1.5px solid ${S.border}` }}>
              <button onClick={() => setSelectedProductId(null)} style={{ background: "none", border: "none", color: S.accent, fontSize: 13, cursor: "pointer", padding: 0, fontWeight: 600, marginBottom: 10, display: "block" }}>← Ürünlere Dön</button>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: S.text }}>{selectedProduct.code}</div>
                {selectedProduct.description && <div style={{ fontSize: 13, color: S.textMuted, marginTop: 2 }}>{selectedProduct.description}</div>}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
                  {[selectedProduct.reyon, selectedProduct.urun_grubu, selectedProduct.marka].map(tag => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </div>
            </div>
            <div style={{ background: S.card, borderRadius: 12, padding: 20, border: `1.5px solid ${S.border}` }}>
              {/* Add comment */}
              <div style={{ background: S.sidebar, borderRadius: 10, padding: 18, marginBottom: 8, border: `1.5px solid ${S.border}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.textMuted, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.5 }}>✏️ Yorum Ekle</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <SimpleSelect options={KATEGORILER} value={newComment.category} onChange={v => setNewComment({ ...newComment, category: v })} placeholder="Kategori seç..." />
                  <SimpleSelect options={MAGAZALAR} value={newComment.store} onChange={v => setNewComment({ ...newComment, store: v })} placeholder="Mağaza seç..." />
                </div>
                <textarea value={newComment.text} onChange={e => setNewComment({ ...newComment, text: e.target.value })} placeholder="Yorumunuzu yazın..."
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical", fontFamily: "inherit", marginBottom: 12 }} />
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <button onClick={submitComment} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
                  </button>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", background: "#14532d44", border: "1.5px solid #16a34a88", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#4ade80" }}>
                    📷 {pendingPhoto ? "Seçildi ✓" : "Fotoğraf Ekle"}
                    <input type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files[0]; if (f) { setPendingPhoto(f); setPendingPhotoPreview(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
                  </label>
                  {pendingPhotoPreview && (
                    <div style={{ position: "relative" }}>
                      <img src={pendingPhotoPreview} style={{ height: 44, width: 58, objectFit: "cover", borderRadius: 6, border: "1.5px solid #16a34a", cursor: "pointer" }} onClick={() => setLightbox(pendingPhotoPreview)} />
                      <span onClick={() => { setPendingPhoto(null); setPendingPhotoPreview(null); }} style={{ position: "absolute", top: -6, right: -6, background: "#dc2626", color: "white", borderRadius: "50%", width: 16, height: 16, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700 }}>×</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Product photos */}
              {productPhotos.length > 0 && (
                <div style={{ margin: "16px 0", padding: 14, background: S.sidebar, borderRadius: 10, border: `1.5px solid ${S.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>📷 Fotoğraflar ({productPhotos.length})</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {productPhotos.map(ph => (
                      <div key={ph.id}>
                        <img src={ph.url} alt="" onClick={() => setLightbox(ph.url)} style={{ width: 90, height: 65, objectFit: "cover", borderRadius: 7, border: `1.5px solid ${S.border}`, cursor: "pointer" }} />
                        <div style={{ fontSize: 10, color: S.textDim, marginTop: 2, textAlign: "center" }}>{ph.user_name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Filter + comments */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0 14px" }}>
                <div style={{ flex: 1, height: 1, background: S.border }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim }}>Yorumlar ({filteredComments.length})</span>
                <div style={{ flex: 1, height: 1, background: S.border }} />
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {["Tümü", ...KATEGORILER].map(c => (
                  <button key={c} onClick={() => setFilterCat(c)}
                    style={{ padding: "5px 12px", borderRadius: 20, border: `1.5px solid ${filterCat === c ? S.accent : S.border}`, background: filterCat === c ? S.accent + "33" : "transparent", color: filterCat === c ? S.accent : S.textMuted, fontSize: 12, cursor: "pointer", fontWeight: filterCat === c ? 700 : 400, whiteSpace: "nowrap" }}>
                    {c}
                  </button>
                ))}
              </div>
              {filteredComments.length === 0 ? (
                <div style={{ textAlign: "center", color: S.textDim, padding: 28, fontSize: 13 }}>Bu kategoride henüz yorum yok.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filteredComments.map(c => {
                    const commentPhotos = photos.filter(ph => ph.comment_id === c.id);
                    return (
                      <div key={c.id} style={{ background: S.sidebar, border: `1.5px solid ${S.border}`, borderLeft: `4px solid ${KAT_BORDER[c.category] || S.accent}`, borderRadius: 10, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: S.text }}>👤 {c.user_name}</span>
                          <Badge>{c.store}</Badge><Badge>{c.category}</Badge>
                          <span style={{ fontSize: 11, color: S.textDim, marginLeft: "auto" }}>{fmt(c.created_at)}</span>
                        </div>
                        <div style={{ fontSize: 13, color: S.textMuted, lineHeight: 1.7 }}>{c.text}</div>
                        {commentPhotos.length > 0 && (
                          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                            {commentPhotos.map(ph => <img key={ph.id} src={ph.url} alt="" onClick={() => setLightbox(ph.url)} style={{ height: 65, width: 90, objectFit: "cover", borderRadius: 7, border: `1.5px solid ${S.border}`, cursor: "pointer" }} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={resetAddProd}>
          <div style={{ background: S.card, borderRadius: 14, padding: 28, width: "min(500px,92vw)", border: `1.5px solid ${S.border}`, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 20 }}>➕ Yeni Ürün Ekle</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["Reyon *", REYONLAR, "reyon", false], ["Ürün Grubu *", filteredGruplar.length ? filteredGruplar : URUN_GRUPLARI, "grup", !newProd.reyon], ["Marka *", filteredMarkalar.length ? filteredMarkalar : MARKALAR, "marka", !newProd.grup]].map(([lbl, opts, key, dis]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>{lbl}</div>
                  <SearchSelect options={opts} value={newProd[key]} disabled={dis}
                    onChange={async v => {
                      if (key === "reyon") { setNewProd({ ...newProd, reyon: v, grup: "", marka: "", code: "" }); setCatalogCodes([]); setManualCode(false); const g = await loadCatalogFiltered("urun_grubu", v, null); setFilteredGruplar(g); setFilteredMarkalar([]); }
                      else if (key === "grup") { setNewProd({ ...newProd, grup: v, marka: "", code: "" }); setCatalogCodes([]); setManualCode(false); const m = await loadCatalogFiltered("marka", newProd.reyon, v); setFilteredMarkalar(m); }
                      else { setNewProd({ ...newProd, marka: v, code: "" }); setManualCode(false); const codes = await loadCatalogCodes(newProd.reyon, newProd.grup, v); setCatalogCodes(codes); }
                    }}
                    placeholder={dis ? "Önce öncekini seçin" : "Seç..."} />
                </div>
              ))}
            </div>
            {newProd.marka && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Ürün Kodu *</div>
                {!manualCode && catalogCodes.length > 0
                  ? <SearchSelect options={catalogCodes} value={newProd.code} onChange={v => setNewProd({ ...newProd, code: v })} placeholder="Kod ara veya seçin..." />
                  : <input value={newProd.code} onChange={e => setNewProd({ ...newProd, code: e.target.value })} placeholder="Ürün kodunu girin" style={{ ...inputStyle }} />
                }
                {!manualCode && <div onClick={() => setManualCode(true)} style={{ fontSize: 12, color: S.accent, cursor: "pointer", marginTop: 5 }}>{catalogCodes.length === 0 ? "⚠️ Katalogda bulunamadı — manuel gir" : "Kodumu listede göremiyorum"}</div>}
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Ürün Açıklaması</div>
              <input value={newProd.desc} onChange={e => setNewProd({ ...newProd, desc: e.target.value })} placeholder="Opsiyonel" style={{ ...inputStyle }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={resetAddProd} style={{ ...btnSecondary }}>İptal</button>
              <button onClick={addProduct} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.7 : 1 }}>{submitting ? "Ekleniyor..." : "Ekle"}</button>
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

      {/* Toast */}
      {toast && <div style={{ position: "fixed", bottom: 24, right: 24, background: S.card, color: S.text, padding: "12px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 20px rgba(0,0,0,0.4)", zIndex: 999, border: `1.5px solid ${S.border}` }}>{toast}</div>}
    </div>
  );
}
