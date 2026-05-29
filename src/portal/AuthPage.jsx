import { useState } from "react";
import { supabase } from "../shared/lib/supabase";
import { S, inputStyle, btnPrimary, btnSecondary } from "../shared/lib/theme";
import { MAGAZALAR_TUMU } from "../shared/lib/constants";
import { SimpleSelect } from "../shared/components";

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [regForm, setRegForm] = useState({ name: "", email: "", password: "", password2: "", store: "" });
  const [regMsg, setRegMsg] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function doLogin() {
    setLoginErr("");
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass });
    if (error) setLoginErr(
      error.message.includes("Invalid") || error.message.includes("credentials")
        ? "E-posta veya şifre hatalı."
        : error.message
    );
  }

  async function doGoogleLogin() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  async function doRegister() {
    const { name, email, password, password2, store } = regForm;
    if (!name || !email || !password || !store) { setRegMsg("Tüm alanları doldurun."); return; }
    if (password !== password2) { setRegMsg("Şifreler eşleşmiyor."); return; }
    if (password.length < 6) { setRegMsg("Şifre en az 6 karakter olmalı."); return; }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name, store } } });
    setSubmitting(false);
    if (error) { setRegMsg(error.message); return; }
    if (data?.user) {
      setTimeout(async () => {
        await supabase.from("profiles").upsert({ id: data.user.id, name, store, role: "store" });
      }, 1000);
    }
    setRegMsg("✅ Kayıt başarılı! E-postanızı onaylayın, sonra giriş yapabilirsiniz.");
    setRegForm({ name: "", email: "", password: "", password2: "", store: "" });
  }

  async function doForgotPassword() {
    if (!forgotEmail) { setForgotMsg("E-posta adresinizi girin."); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, { redirectTo: window.location.origin });
    if (error) { setForgotMsg(error.message); return; }
    setForgotMsg("✅ Şifre sıfırlama linki e-postanıza gönderildi.");
  }

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "min(400px, 100%)", background: S.card, borderRadius: 16, padding: 32, border: `1.5px solid ${S.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="Yeni Koza"
            style={{ height: 56, width: "auto", marginBottom: 14 }}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "block"; }}
          />
          <div style={{ fontSize: 36, marginBottom: 10, display: "none" }}>🏪</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: S.text }}>Yeni Koza</div>
          <div style={{ fontSize: 13, color: S.textMuted, marginTop: 4 }}>Mağaza Yönetim Sistemi</div>
        </div>

        {/* Tab */}
        {mode !== "forgot" && (
          <div style={{ display: "flex", marginBottom: 24, background: S.sidebar, borderRadius: 8, padding: 3 }}>
            {[["login", "Giriş Yap"], ["register", "Kayıt Ol"]].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setLoginErr(""); setRegMsg(""); }}
                style={{ flex: 1, padding: "8px", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  background: mode === key ? S.accent : "transparent",
                  color: mode === key ? "white" : S.textMuted,
                }}
              >{label}</button>
            ))}
          </div>
        )}

        {mode === "login" && (
          <>
            <button onClick={doGoogleLogin} style={{ ...btnSecondary, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20, padding: "11px" }}>
              {GOOGLE_ICON} Google ile Giriş Yap
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: S.border }} />
              <span style={{ fontSize: 12, color: S.textDim }}>veya</span>
              <div style={{ flex: 1, height: 1, background: S.border }} />
            </div>
            {[["E-posta", "email", loginEmail, setLoginEmail], ["Şifre", "password", loginPass, setLoginPass]].map(([lbl, type, val, setter]) => (
              <div key={lbl} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, marginBottom: 6 }}>{lbl}</div>
                <input type={type} value={val} onChange={e => setter(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && doLogin()}
                  style={{ ...inputStyle }} />
              </div>
            ))}
            {loginErr && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{loginErr}</div>}
            <button onClick={doLogin} style={{ ...btnPrimary, width: "100%", marginBottom: 12 }}>Giriş Yap</button>
            <div style={{ textAlign: "center", fontSize: 13 }}>
              <span onClick={() => { setMode("forgot"); setForgotMsg(""); }} style={{ color: S.accent, cursor: "pointer" }}>Şifremi unuttum</span>
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            {[["Ad Soyad", "text", "name"], ["E-posta", "email", "email"], ["Şifre", "password", "password"], ["Şifre (Tekrar)", "password", "password2"]].map(([lbl, type, key]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, marginBottom: 6 }}>{lbl}</div>
                <input type={type} value={regForm[key]} onChange={e => setRegForm({ ...regForm, [key]: e.target.value })} style={{ ...inputStyle }} />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, marginBottom: 6 }}>Mağaza</div>
              <SimpleSelect options={MAGAZALAR_TUMU} value={regForm.store} onChange={v => setRegForm({ ...regForm, store: v })} placeholder="Mağaza seçin..." />
            </div>
            {regMsg && (
              <div style={{ color: regMsg.startsWith("✅") ? "#4ade80" : "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{regMsg}</div>
            )}
            <button onClick={doRegister} disabled={submitting} style={{ ...btnPrimary, width: "100%", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Kaydediliyor..." : "Kayıt Ol"}
            </button>
          </>
        )}

        {mode === "forgot" && (
          <>
            <div style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 8 }}>🔑 Şifremi Unuttum</div>
            <div style={{ fontSize: 13, color: S.textMuted, marginBottom: 16 }}>E-posta adresinize şifre sıfırlama linki göndereceğiz.</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: S.textDim, marginBottom: 6 }}>E-posta</div>
              <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} style={{ ...inputStyle }} />
            </div>
            <button onClick={doForgotPassword} style={{ ...btnPrimary, width: "100%" }}>Link Gönder</button>
            {forgotMsg && (
              <div style={{ color: forgotMsg.startsWith("✅") ? "#4ade80" : "#f87171", fontSize: 13, marginTop: 10, textAlign: "center" }}>{forgotMsg}</div>
            )}
            <div style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}>
              <span onClick={() => { setMode("login"); setForgotMsg(""); }} style={{ color: S.accent, cursor: "pointer" }}>← Giriş'e dön</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
