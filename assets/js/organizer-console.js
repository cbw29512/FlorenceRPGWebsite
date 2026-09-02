(() => {
  "use strict";

  const auth = window.GuildOrganizerAuth;
  const api = window.GuildOrganizerApi;
  const render = window.GuildOrganizerRender;
  const logError = (message, error) => console.error(`[Guild Organizer Console] ${message}`, error);
  const $ = (selector) => document.querySelector(selector);

  const setStatus = (message, kind = "") => {
    try {
      const box = $("[data-organizer-status]");
      if (!box) return;
      box.textContent = message;
      box.dataset.kind = kind;
    } catch (error) { logError("Could not update status.", error); }
  };

  const showSignedIn = (signedIn) => {
    $("[data-organizer-login]")?.classList.toggle("organizer-hidden", signedIn);
    $("[data-organizer-app]")?.classList.toggle("organizer-hidden", !signedIn);
  };

  const loadDashboard = async () => {
    try {
      setStatus("Loading organizer data…");
      const response = await api.dashboard(50);
      render.renderDashboard(response.data);
      showSignedIn(true);
      setStatus("Organizer data is current.", "success");
    } catch (error) {
      logError("Dashboard load failed.", error);
      setStatus(error.message || "Organizer access failed.", "error");
      if (/sign-in|auth|authorized|organizer/i.test(error.message || "")) showSignedIn(false);
    }
  };

  const toMinutes = (value) => {
    const [hours, minutes] = String(value || "").split(":").map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) throw new Error("Enter valid start and end times.");
    return hours * 60 + minutes;
  };

  const setupLogin = () => {
    $("[data-organizer-login-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const email = new FormData(event.currentTarget).get("email")?.toString().trim();
        if (!email) throw new Error("Enter the organizer email address.");
        setStatus("Sending secure sign-in link…");
        await auth.requestMagicLink(email);
        setStatus("Sign-in link sent. Open it in this browser to continue.", "success");
      } catch (error) { setStatus(error.message || "Could not send sign-in link.", "error"); }
    });
    $("[data-organizer-signout]")?.addEventListener("click", async () => {
      await auth.signOut();
      showSignedIn(false);
      setStatus("Signed out.", "success");
    });
  };

  const setupProposalForm = () => {
    $("[data-proposal-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const form = new FormData(event.currentTarget);
        const payload = {
          systemName: form.get("system-name"), venueMode: form.get("venue-mode"),
          coarseLocation: form.get("coarse-location")?.toString().trim() || null,
          targetSize: Number(form.get("target-size")),
          proposedSchedule: { day_of_week: Number(form.get("day-of-week")), start_minute: toMinutes(form.get("start-time")), end_minute: toMinutes(form.get("end-time")) },
        };
        if (payload.proposedSchedule.end_minute <= payload.proposedSchedule.start_minute) throw new Error("End time must be after start time.");
        setStatus("Creating table proposal…");
        await api.createProposal(payload);
        event.currentTarget.reset();
        await loadDashboard();
      } catch (error) { setStatus(error.message || "Could not create proposal.", "error"); }
    });
  };

  const handleAction = async (button) => {
    const action = button.dataset.action;
    if (!action) return;
    try {
      button.disabled = true;
      if (action === "approve-adult") await api.approveAdult(button.dataset.id);
      if (action === "decline-adult") await api.reviewAdult(button.dataset.id, "declined", prompt("Organizer note (optional):") || null);
      if (action === "youth-contacted") await api.reviewYouth(button.dataset.id, "contacted");
      if (action === "youth-closed") await api.reviewYouth(button.dataset.id, "closed", prompt("Organizer note (optional):") || null);
      if (action === "rank") {
        const response = await api.rankCandidates(button.dataset.id);
        const target = document.querySelector(`[data-candidates-for="${CSS.escape(button.dataset.id)}"]`);
        if (target) target.innerHTML = render.candidateRows(button.dataset.id, response.data);
        return;
      }
      if (action === "invite") await api.inviteCandidate(button.dataset.proposal, button.dataset.user, button.dataset.role);
      if (action === "confirm") {
        const starts = prompt("Confirmed start date/time (example: 2026-09-12T18:00):");
        if (!starts) return;
        const details = prompt("Private venue/join details for accepted participants (optional):") || null;
        await api.confirmProposal(button.dataset.id, new Date(starts).toISOString(), details);
      }
      await loadDashboard();
    } catch (error) {
      logError(`Action ${action} failed.`, error);
      setStatus(error.message || "Organizer action failed.", "error");
    } finally { button.disabled = false; }
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (button) void handleAction(button);
  });

  setupLogin();
  setupProposalForm();
  auth.captureSessionFromHash();
  if (auth.getAccessToken()) void loadDashboard(); else showSignedIn(false);
})();