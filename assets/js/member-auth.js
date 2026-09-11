(() => {
  "use strict";

  const PROJECT_URL = "https://vtqoxflirpfhnxzzpxfa.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_I17DfovO1Sp6YQd79fcF2A_MMCIUuDi";
  const TOKEN_KEY = "light-tower-member-token";
  const EXPIRY_KEY = "light-tower-member-expiry";
  const logError = (message, error) => console.error(`[Guild Member Auth] ${message}`, error);

  const clearHash = () => {
    try { history.replaceState(null, document.title, `${location.pathname}${location.search}`); }
    catch (error) { logError("Could not clear authentication fragment.", error); }
  };

  const captureSessionFromHash = () => {
    try {
      const params = new URLSearchParams(location.hash.replace(/^#/, ""));
      const token = params.get("access_token");
      if (!token) return false;
      const expiresIn = Number(params.get("expires_in") || 3600);
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(EXPIRY_KEY, String(Date.now() + Math.max(expiresIn - 30, 30) * 1000));
      clearHash();
      return true;
    } catch (error) {
      logError("Could not capture member session.", error);
      return false;
    }
  };

  const getAccessToken = () => {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const expiry = Number(sessionStorage.getItem(EXPIRY_KEY) || 0);
      if (!token || !expiry || Date.now() >= expiry) {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(EXPIRY_KEY);
        return null;
      }
      return token;
    } catch (error) {
      logError("Could not read member session.", error);
      return null;
    }
  };

  const requestMagicLink = async (email) => {
    try {
      const redirect = `${location.origin}${location.pathname}`;
      const response = await fetch(`${PROJECT_URL}/auth/v1/otp?redirect_to=${encodeURIComponent(redirect)}`, {
        method: "POST",
        headers: { "apikey": PUBLISHABLE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), create_user: false }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.msg || body.message || `Sign-in request returned ${response.status}.`);
      }
      return true;
    } catch (error) {
      logError("Member sign-in request failed.", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const token = getAccessToken();
      if (token) await fetch(`${PROJECT_URL}/auth/v1/logout`, { method: "POST", headers: { "apikey": PUBLISHABLE_KEY, "Authorization": `Bearer ${token}` } });
    } catch (error) { logError("Remote sign-out failed.", error); }
    finally { sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(EXPIRY_KEY); }
  };

  window.GuildMemberAuth = { captureSessionFromHash, getAccessToken, requestMagicLink, signOut };
})();