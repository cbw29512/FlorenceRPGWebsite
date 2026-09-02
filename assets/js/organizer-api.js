(() => {
  "use strict";

  const ENDPOINT = "https://vtqoxflirpfhnxzzpxfa.supabase.co/functions/v1/organizer-api";
  const PUBLISHABLE_KEY = "sb_publishable_I17DfovO1Sp6YQd79fcF2A_MMCIUuDi";
  const logError = (message, error) => console.error(`[Guild Organizer API] ${message}`, error);

  const call = async (action, payload = {}) => {
    try {
      const token = window.GuildOrganizerAuth?.getAccessToken();
      if (!token) throw new Error("Organizer sign-in is required.");
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "apikey": PUBLISHABLE_KEY,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, payload }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.ok) throw new Error(body.error || `Organizer API returned ${response.status}.`);
      return body;
    } catch (error) {
      logError(`Action ${action} failed.`, error);
      throw error;
    }
  };

  window.GuildOrganizerApi = {
    dashboard: (limit = 50) => call("dashboard", { limit }),
    reviewAdult: (submissionId, state, notes = null) => call("reviewAdult", { submissionId, state, notes }),
    approveAdult: (submissionId) => call("approveAdult", { submissionId }),
    reviewYouth: (submissionId, state, notes = null) => call("reviewYouth", { submissionId, state, notes }),
    createProposal: (payload) => call("createProposal", payload),
    rankCandidates: (proposalId) => call("rankCandidates", { proposalId }),
    inviteCandidate: (proposalId, userId, seatRole) => call("inviteCandidate", { proposalId, userId, seatRole }),
    confirmProposal: (proposalId, startsAt, privateJoinDetails = null) => call("confirmProposal", { proposalId, startsAt, privateJoinDetails }),
  };
})();