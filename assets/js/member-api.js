(() => {
  "use strict";

  const ENDPOINT = "https://vtqoxflirpfhnxzzpxfa.supabase.co/functions/v1/member-api";
  const PUBLISHABLE_KEY = "sb_publishable_I17DfovO1Sp6YQd79fcF2A_MMCIUuDi";
  const logError = (message, error) => console.error(`[Guild Member API] ${message}`, error);

  const call = async (action, payload = {}) => {
    try {
      const token = window.GuildMemberAuth?.getAccessToken();
      if (!token) throw new Error("Member sign-in is required.");
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "apikey": PUBLISHABLE_KEY, "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) throw new Error(body.error || `Member API returned ${response.status}.`);
      return body.data;
    } catch (error) {
      logError(`Action ${action} failed.`, error);
      throw error;
    }
  };

  window.GuildMemberApi = {
    dashboard: () => call("dashboard"),
    updateSettings: (settings) => call("updateSettings", { settings }),
    replaceAvailability: (windows) => call("replaceAvailability", { windows }),
    respondInvitation: (invitationId, response) => call("respondInvitation", { invitationId, response }),
  };
})();