import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAuth() {
  const [authUser, setAuthUser]   = useState(null);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthUser(session?.user ?? null);
        if (session?.user) loadProfile(session.user.id);
        else { setProfile(null); setLoading(false); }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return { authUser, profile, loading, logout, reloadProfile: () => authUser && loadProfile(authUser.id) };
}
