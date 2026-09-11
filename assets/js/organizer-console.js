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

  const openDialog = (dialog, beforeOpen) => new Promise((resolve) => {
    if (!dialog) { resolve(null); return; }
    beforeOpen?.(dialog);
    const onClose = () => {
      dialog.removeEventListener("close", onClose);
      resolve(dialog.returnValue === "confirm" ? new FormData(dialog.querySelector("form")) : null);
    };
    dialog.addEventListener("close", onClose);
    dialog.showModal();
  });

  const requestNote = async (title) => {
    const formData = await openDialog($("[data-note-dialog]"), (dialog) => {
      dialog.querySelector("[data-note-title]").textContent = title;
      dialog.querySelector("form").reset();
    });
    return formData ? (formData.get("note")?.toString().trim() || null) : undefined;
  };

  const requestConfirmation = async () => {
    const formData = await openDialog($("[data-confirm-dialog]"), (dialog) => dialog.querySelector("form").reset());
    if (!formData) return null;
    const startsAt = formData.get("starts-at")?.toString();
    if (!startsAt) throw new Error("Choose the confirmed start date and time.");
    const parsed = new Date(startsAt);
    if (Number.isNaN(parsed.getTime())) throw new Error("Choose a valid confirmed start date and time.");
    return { startsAt: parsed.toISOString(), privateJoinDetails: formData.get("join-details")?.toString().trim() || null };
  };

  const setupLogin = () => {
    $("[data-organizer-login-form]")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const email = new FormData(event.currentTarget).get("email")?.toString().trim();
        if (!email) throw new Error("Enter the organizer email address.");
        setStatus("Sending secure sign-in link…");
        await auth.requestMagicLink(email);
        setStatus("If this is an authorized organizer account, a sign-in link has been sent.", "success");
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
      if (action === "decline-adult") {
        const note = await requestNote("Decline adult interest");
        if (note === undefined) return;
        await api.reviewAdult(button.dataset.id, "declined", note);
      }
      if (action === "youth-contacted") await api.reviewYouth(button.dataset.id, "contacted");
      if (action === "youth-closed") {
        const note = await requestNote("Close youth-group inquiry");
        if (note === undefined) return;
        await api.reviewYouth(button.dataset.id, "closed", note);
      }
      if (action === "rank") {
        const response = await api.rankCandidates(button.dataset.id);
        const target = document.querySelector(`[data-candidates-for="${CSS.escape(button.dataset.id)}"]`);
        if (target) target.innerHTML = render.candidateRows(button.dataset.id, response.data);
        return;
      }
      if (action === "invite") await api.inviteCandidate(button.dataset.proposal, button.dataset.user, button.dataset.role);
      if (action === "confirm") {
        const confirmation = await requestConfirmation();
        if (!confirmation) return;
        await api.confirmProposal(button.dataset.id, confirmation.startsAt, confirmation.privateJoinDetails);
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
