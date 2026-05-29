import { useState } from "react";
import { useAuth } from "./shared/hooks/useAuth";
import { S } from "./shared/lib/theme";

import { AuthPage }     from "./portal/AuthPage";
import { ProfileSetup } from "./portal/ProfileSetup";
import { Navbar }       from "./portal/Navbar";
import { Sidebar }      from "./portal/Sidebar";
import { HomePage }     from "./portal/HomePage";
import { AdminPage }    from "./portal/AdminPage";

import { UrunYorumlari } from "./apps/urun-yorumlari/UrunYorumlari";
import { Sergileme }     from "./apps/sergileme/Sergileme";

export default function App() {
  const { authUser, profile, loading, reloadProfile } = useAuth();
  const [page, setPage]               = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global CSS
  useState(() => {
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box !important; }
      html { overflow-x: hidden; width: 100%; }
      body { margin: 0; padding: 0; overflow-x: hidden; width: 100%; max-width: 100vw; }
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
      }
    `;
    document.head.appendChild(style);
  });

  // Loading
  if (loading) {
    return (
      <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: S.textMuted, fontSize: 14 }}>Yükleniyor...</div>
      </div>
    );
  }

  // Not logged in
  if (!authUser) return <AuthPage />;

  // Profile incomplete
  if (!profile || !profile.store) {
    return <ProfileSetup authUser={authUser} onComplete={reloadProfile} />;
  }

  // Main app
  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", background: S.bg, minHeight: "100vh", fontSize: 14, color: S.text }}>
      <Navbar
        profile={profile}
        onMenuToggle={() => setSidebarOpen(o => !o)}
        onProfileUpdated={reloadProfile}
      />

      <div className="main-layout">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 99, top: 52 }} />
        )}

        {/* Portal sidebar (only for home / admin / gallery views) */}
        {page !== "products" && (
          <Sidebar
            page={page}
            onNavigate={setPage}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            profile={profile}
          />
        )}

        {/* App router */}
        <div className="content-area">
          {page === "home"     && <HomePage profile={profile} onNavigate={setPage} />}
          {page === "products" && <UrunYorumlari profile={profile} />}
          {page === "gallery"  && <Sergileme profile={profile} />}
          {page === "admin"    && profile.role === "admin" && <AdminPage />}
        </div>
      </div>
    </div>
  );
}
