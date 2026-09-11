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

  const ask = ({ title, label, type = "text", placeholder = "", optional = false }) => new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "organizer-dialog";
    const form = document.createElement("form");
    form.method = "dialog";
    const heading = document.createElement("h2");
    heading.textContent = title;
    const fieldLabel = document.createElement("label");
    fieldLabel.textContent = label;
    const field = type === "textarea" ? document.createElement("textarea") : document.createElement("input");
    if (field instanceof HTMLInputElement) field.type = type;
    field.placeholder = placeholder;
    field.required = !optional;
    fieldLabel.append(field);
    const actions = document.createElement("div");
    actions.className = "organizer-dialog-actions";
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.className = "button button-ghost";
    cancel.textContent = "Cancel";
    const confirm = document.createElement("button");
    confirm.type = "submit";
    confirm.className = "button button-primary";
    confirm.textContent = "Continue";
    actions.append(cancel, confirm);
    form.append(heading, fieldLabel, actions);
    dialog.append(form);
    document.body.append(dialog);
    const finish = (value) => {
      if (dialog.open) dialog.close();
      dialog.remove();
      resolve(value);
    };
    cancel.addEventListener("click", () => finish(null));
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); finish(null); });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      finish(field.value.trim());
    });
    dialog.showModal();
    field.focus();
  });

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
      button.setAttribute("aria-busy", "true");
      if (action === "approve-adult") await api.approveAdult(button.dataset.id);
      if (action === "decline-adult") {
        const note = await ask({ title: "Decline adult submission", label: "Organizer note (optional)", type: "textarea", optional: true });
        if (note === null) return;
        await api.reviewAdult(button.dataset.id, "declined", note || null);
      }
      if (action === "youth-contacted") await api.reviewYouth(button.dataset.id, "contacted");
      if (action === "youth-closed") {
        const note = await ask({ title: "Close youth-group inquiry", label: "Organizer note (optional)", type: "textarea", optional: true });
        if (note === null) return;
        await api.reviewYouth(button.dataset.id, "closed", note || null);
      }
      if (action === "rank") {
        const response = await api.rankCandidates(button.dataset.id);
        const target = document.querySelector(`[data-candidates-for="${CSS.escape(button.dataset.id)}"]`);
        if (target) target.innerHTML = render.candidateRows(button.dataset.id, response.data);
        return;
      }
      if (action === "invite") await api.inviteCandidate(button.dataset.proposal, button.dataset.user, button.dataset.role);
      if (action === "confirm") {
        const starts = await ask({ title: "Confirm table", label: "Confirmed start date and time", type: "datetime-local" });
        if (starts === null) return;
        const startDate = new Date(starts);
        if (Number.isNaN(startDate.getTime())) throw new Error("Enter a valid start date and time.");
        const details = await ask({ title: "Private table details", label: "Venue or join details (optional)", type: "textarea", optional: true });
        if (details === null) return;
        await api.confirmProposal(button.dataset.id, startDate.toISOString(), details || null);
      }
      await loadDashboard();
    } catch (error) {
      logError(`Action ${action} failed.`, error);
      setStatus(error.message || "Organizer action failed.", "error");
    } finally {
      button.disabled = false;
      button.removeAttribute("aria-busy");
    }
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
