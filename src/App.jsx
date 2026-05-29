import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";

import { useAuth }       from "./shared/hooks/useAuth";
import { S }             from "./shared/lib/theme";

import { AuthPage }      from "./portal/AuthPage";
import { ProfileSetup }  from "./portal/ProfileSetup";
import { PortalHome }    from "./portal/PortalHome";
import { AppShell }      from "./portal/AppShell";
import { AdminPage }     from "./portal/AdminPage";
import { ChangePasswordModal, EditProfileModal } from "./portal/UserModals";

import { supabase }      from "./shared/lib/supabase";
import { APPS, getApp }  from "./portal/appRegistry";

/* ---------- Global CSS install ---------- */
function useGlobalStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box !important; }
      html { overflow-x: hidden; width: 100%; }
      body { margin: 0; padding: 0; overflow-x: hidden; width: 100%; max-width: 100vw; background: ${S.bg}; }
      input, textarea, select { font-size: 16px !important; }
      .hamburger { display: none !important; }
      .main-layout { display: flex; height: calc(100vh - 52px); overflow: hidden; }
      .content-area { flex: 1; overflow-y: auto; overflow-x: hidden; min-width: 0; max-width: 100%; }
      .sidebar { width: 260px; flex-shrink: 0; overflow-y: auto; }
      @media (max-width: 768px) {
        .hamburger { display: flex !important; align-items: center; justify-content: center; }
        .main-layout { display: block; height: auto; }
        .sidebar { position: fixed !important; left: -100vw; top: 52px; height: calc(100vh - 52px); transition: left 0.25s; box-shadow: 4px 0 20px rgba(0,0,0,0.5); z-index: 100; width: 80vw; max-width: 260px; overflow-y: auto; }
        .sidebar.sidebar-open { left: 0 !important; }
        .content-area { padding: 12px !important; width: 100% !important; max-width: 100% !important; overflow-x: hidden !important; }
        .admin-table { display: none !important; }
        .admin-cards { display: flex !important; flex-direction: column; gap: 10px; }
        .catalog-grid { grid-template-columns: 1fr !important; }
        .comment-grid { grid-template-columns: 1fr !important; }
        .display-grid { grid-template-columns: 1fr 1fr !important; }
        .filter-bar { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; -webkit-overflow-scrolling: touch; }
        .filter-bar::-webkit-scrollbar { display: none; }
        .home-grid { grid-template-columns: 1fr !important; }
        .back-label { display: none; }
        .user-chip { max-width: 80px !important; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}

/* ---------- App route loader ---------- */
function AppRouteLoader({ profile, ...shellProps }) {
  const { appId } = useParams();
  const app = getApp(appId);

  // Bilinmeyen app → portala dön
  if (!app) return <Navigate to="/" replace />;

  // Admin-only kontrolü
  if (app.adminOnly && profile?.role !== "admin") return <Navigate to="/" replace />;

  const Component = app.component;
  return (
    <AppShell app={app} profile={profile} {...shellProps}>
      <Component profile={profile} />
    </AppShell>
  );
}

/* ---------- Admin route (kayıtlı app değil, sabit) ---------- */
function AdminRoute({ profile, ...shellProps }) {
  if (profile?.role !== "admin") return <Navigate to="/" replace />;
  const adminApp = { id: "admin", name: "Kullanıcı Yönetimi", icon: "👥", color: "#a855f7" };
  return (
    <AppShell app={adminApp} profile={profile} {...shellProps}>
      <AdminPage />
    </AppShell>
  );
}

/* ---------- Root ---------- */
function Root() {
  useGlobalStyles();
  const { authUser, profile, loading, reloadProfile } = useAuth();
  const [showChangePw, setShowChangePw] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  if (loading) {
    return (
      <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: S.textMuted, fontSize: 14 }}>Yükleniyor...</div>
      </div>
    );
  }

  if (!authUser) return <AuthPage />;
  if (!profile || !profile.store) return <ProfileSetup authUser={authUser} onComplete={reloadProfile} />;

  const shellProps = {
    onLogout: () => supabase.auth.signOut(),
    onOpenSettings: () => setShowChangePw(true),
    onOpenEditProfile: () => setShowEditProfile(true),
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <PortalHome
            profile={profile}
            onLogout={shellProps.onLogout}
            onOpenSettings={shellProps.onOpenSettings}
            onOpenEditProfile={shellProps.onOpenEditProfile}
          />
        } />
        <Route path="/admin" element={<AdminRoute profile={profile} {...shellProps} />} />
        <Route path="/:appId" element={<AppRouteLoader profile={profile} {...shellProps} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ChangePasswordModal open={showChangePw} onClose={() => setShowChangePw(false)} />
      <EditProfileModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        profile={profile}
        onSaved={reloadProfile}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}
