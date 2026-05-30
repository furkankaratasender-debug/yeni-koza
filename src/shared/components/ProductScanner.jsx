import { useState, useRef } from "react";
import { S, btnPrimary, btnSecondary } from "../lib/theme";

/**
 * ProductScanner
 * Etiket fotoğrafı çek → OCR ile ürün kodu tanı → onCodeDetected(code) çağır.
 *
 * Akıl:
 *  - Tesseract.js dinamik olarak yüklenir (ilk açılışta ~2MB indirir)
 *  - Kod formatı: 2XL-XXXXX (örn: 26Y-12345, 27K45782) — esnek regex
 *  - Bulamazsa kullanıcıya OCR'in gördüğü metni göster + manuel düzenleme imkanı
 */
export function ProductScanner({ open, onClose, onCodeDetected }) {
  const [stage, setStage]       = useState("idle");      // idle | scanning | result | error
  const [progress, setProgress] = useState(0);
  const [preview, setPreview]   = useState(null);
  const [foundCode, setFoundCode] = useState("");
  const [manualCode, setManualCode] = useState("");
  const [rawText, setRawText]   = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  if (!open) return null;

  function reset() {
    setStage("idle"); setProgress(0); setPreview(null);
    setFoundCode(""); setManualCode(""); setRawText(""); setErrorMsg("");
  }
  function close() { reset(); onClose(); }

  function extractCode(text) {
    // 2X + letter + (- veya boşluk veya hiç) + 3-10 alfanümerik
    const cleaned = text.replace(/[|]/g, "1").replace(/[oO](?=\d)/g, "0");
    const regex = /(2\d)\s*([A-Z])\s*[-\s]?\s*([A-Z0-9]{3,10})/gi;
    const matches = [];
    let m;
    while ((m = regex.exec(cleaned)) !== null) {
      const code = `${m[1]}${m[2].toUpperCase()}-${m[3].toUpperCase()}`;
      if (!matches.includes(code)) matches.push(code);
    }
    return matches;
  }

  async function handleFile(file) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStage("scanning");
    setProgress(0);
    setErrorMsg("");
    try {
      const Tesseract = await import("tesseract.js");
      const { data: { text } } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") setProgress(Math.round((m.progress || 0) * 100));
        },
      });
      setRawText(text);
      const codes = extractCode(text);
      if (codes.length > 0) {
        setFoundCode(codes[0]);
        setManualCode(codes[0]);
        setStage("result");
      } else {
        setErrorMsg("Ürün kodu algılanamadı. Manuel düzeltebilir veya tekrar deneyebilirsin.");
        setManualCode("");
        setStage("result");
      }
    } catch (err) {
      setErrorMsg("Tarama hatası: " + err.message);
      setStage("error");
    }
  }

  function confirm() {
    const code = manualCode.trim().toUpperCase();
    if (!code) return;
    onCodeDetected(code);
    close();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={close}>
      <div style={{
        background: S.card, borderRadius: 14, padding: 24, width: "min(480px, 95vw)",
        border: `1.5px solid ${S.border}`, maxHeight: "94vh", overflowY: "auto",
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: S.text }}>📷 Etiket Tara</div>
          <button onClick={close} style={{ background: "none", border: "none", color: S.textDim, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* IDLE - take photo */}
        {stage === "idle" && (
          <>
            <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
              Ürün etiketinin fotoğrafını çek. Sistem ürün kodunu otomatik tanıyacak (örn: <code style={{ background: S.input, padding: "1px 6px", borderRadius: 4, fontSize: 12 }}>26Y-12345</code>).
            </div>
            <label style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 12, padding: "44px 16px", border: `2px dashed ${S.inputBorder}`,
              borderRadius: 12, cursor: "pointer", color: S.textDim, fontSize: 13,
              background: S.sidebar,
            }}>
              <span style={{ fontSize: 42 }}>📷</span>
              <span style={{ fontWeight: 600 }}>Etiket Fotoğrafı Çek</span>
              <span style={{ fontSize: 11 }}>Kamera açılır veya galeriden seç</span>
              <input
                ref={fileInputRef}
                type="file" accept="image/*" capture="environment"
                onChange={e => handleFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
            {errorMsg && <div style={{ color: "#f87171", fontSize: 12, marginTop: 10, textAlign: "center" }}>{errorMsg}</div>}
          </>
        )}

        {/* SCANNING */}
        {stage === "scanning" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {preview && <img src={preview} style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, marginBottom: 18, border: `1px solid ${S.border}` }} />}
            <div style={{ fontSize: 14, color: S.text, marginBottom: 12, fontWeight: 600 }}>Etiket taranıyor...</div>
            <div style={{ width: "100%", height: 6, background: S.input, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: S.accent, transition: "width 0.2s" }} />
            </div>
            <div style={{ fontSize: 11, color: S.textDim, marginTop: 8 }}>%{progress}</div>
          </div>
        )}

        {/* RESULT */}
        {stage === "result" && (
          <>
            {preview && (
              <img src={preview} style={{
                width: "100%", maxHeight: 160, objectFit: "cover",
                borderRadius: 8, marginBottom: 14, border: `1px solid ${S.border}`,
              }} />
            )}
            {foundCode ? (
              <div style={{
                background: "#14532d44", border: "1.5px solid #16a34a88",
                borderRadius: 10, padding: "12px 14px", marginBottom: 14,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 22 }}>✅</span>
                <div>
                  <div style={{ fontSize: 11, color: "#86efac", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Algılandı</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#4ade80", fontFamily: "monospace" }}>{foundCode}</div>
                </div>
              </div>
            ) : (
              <div style={{
                background: "#7c2d1244", border: "1.5px solid #f59e0b88",
                borderRadius: 10, padding: "12px 14px", marginBottom: 14,
                color: "#fbbf24", fontSize: 13,
              }}>
                ⚠️ Kod otomatik algılanamadı. Aşağıdan manuel girebilirsin.
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Ürün Kodu</div>
              <input
                value={manualCode}
                onChange={e => setManualCode(e.target.value.toUpperCase())}
                placeholder="örn: 26Y-12345"
                style={{
                  width: "100%", padding: "10px 14px",
                  border: `1.5px solid ${S.inputBorder}`, borderRadius: 7,
                  background: S.input, color: S.text, fontSize: 16,
                  fontFamily: "monospace", letterSpacing: 1,
                  outline: "none", boxSizing: "border-box",
                }}
                autoFocus
              />
            </div>

            {rawText && (
              <details style={{ marginBottom: 14 }}>
                <summary style={{ fontSize: 11, color: S.textDim, cursor: "pointer", userSelect: "none" }}>OCR Çıktısı (debug)</summary>
                <div style={{
                  marginTop: 6, padding: 10, background: S.input,
                  borderRadius: 6, fontSize: 11, color: S.textMuted,
                  whiteSpace: "pre-wrap", maxHeight: 100, overflowY: "auto",
                  fontFamily: "monospace",
                }}>{rawText}</div>
              </details>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
              <button onClick={reset} style={{ ...btnSecondary, padding: "8px 14px", fontSize: 12 }}>↻ Tekrar Tara</button>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={close} style={{ ...btnSecondary, padding: "8px 14px", fontSize: 12 }}>İptal</button>
                <button
                  onClick={confirm}
                  disabled={!manualCode.trim()}
                  style={{ ...btnPrimary, padding: "8px 16px", fontSize: 13, opacity: !manualCode.trim() ? 0.5 : 1 }}
                >
                  Devam →
                </button>
              </div>
            </div>
          </>
        )}

        {/* ERROR */}
        {stage === "error" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 13, color: "#f87171", marginBottom: 16 }}>{errorMsg}</div>
            <button onClick={reset} style={{ ...btnPrimary, padding: "8px 16px", fontSize: 13 }}>Tekrar Dene</button>
          </div>
        )}
      </div>
    </div>
  );
}
