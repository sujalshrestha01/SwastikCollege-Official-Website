import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { getToken, setToken, fetchMe, login as apiLogin } from "../api/client";
import { disablePushNotifications, enablePushNotifications } from "../api/push";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { admin } = await fetchMe();
      setAdmin(admin);
    } catch {
      setToken(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  async function login(email, password) {
    const { token, admin } = await apiLogin(email, password);
    setToken(token);
    setAdmin(admin);

    // The toggle already says "on" (that flag lives on the account, not
    // the browser), but logout() deliberately tears down the actual push
    // subscription — so without this, the toggle would look on while
    // being silently dead until manually re-toggled. Browser permission
    // was already granted the first time, so this re-subscribes quietly,
    // no permission popup. Best-effort: never block login if it fails.
    if (admin?.notificationsEnabled) {
      enablePushNotifications().catch(() => {});
    }

    return admin;
  }

  async function logout() {
    // Unsubscribe this device from push *before* clearing the token —
    // the unsubscribe endpoint needs auth, and once the token's gone it
    // can't reach the server. Otherwise this browser stays subscribed
    // forever after logout, silently getting pinged about students it
    // no longer has dashboard access to respond to.
    try {
      await disablePushNotifications();
    } catch {
      // Best-effort — don't block logout if this fails (e.g. offline).
    }
    setToken(null);
    setAdmin(null);
  }

  // Merges a partial update into the current admin (e.g. after toggling
  // "Available" or "Notifications") without a full re-fetch. Wrapped in
  // useCallback so it has a stable identity across renders — consumers
  // (like AdminLayout's socket-listener effects) can safely list it as a
  // dependency without re-subscribing on every unrelated re-render.
  const updateAdmin = useCallback((partial) => {
    setAdmin((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
        updateAdmin,
        isAuthenticated: !!admin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
