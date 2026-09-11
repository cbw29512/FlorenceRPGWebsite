(() => {
  "use strict";

  const auth = window.GuildMemberAuth;
  const api = window.GuildMemberApi;
  const render = window.GuildMemberRender;
  const logError = (message, error) => console.error(`[Guild Member Console] ${message}`, error);
  const $ = (selector) => document.querySelector(selector);
  let availabilityWindows = [];

  const setStatus = (message, kind = "") => {
    const box = $("[data-member-status]");
    if (!box) return;
    box.textContent = message;
    box.dataset.kind = kind;
  };

  const showSignedIn = (signedIn) => {
    $("[data-member-login]")?.classList.toggle("member-hidden", signedIn);
    $("[data-member-app]")?.classList.toggle("member-hidden", !signedIn);
  };

  const checked = (form, name) => Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((node) => node.value);
  const toMinutes = (value) => { const [h,m] = String(value || "").split(":").map(Number); if (!Number.isInteger(h) || !Number.isInteger(m)) throw new Error("Enter valid times."); return h * 60 + m; };

  const loadDashboard = async () => {
    try {
      setStatus("Loading your Guild data…");
      const data = await api.dashboard();
      availabilityWindows = (data.availability || []).map(({ day_of_week,start_minute,end_minute,timezone,venue_mode }) => ({ day_of_week,start_minute,end_minute,timezone,venue_mode }));
      render.renderDashboard(data, availabilityWindows);
      showSignedIn(true);
      setStatus(data.matching_ready ? "Your matching profile is ready." : "Finish your settings and add availability to enter active matching.", "success");
    } catch (error) {
      logError("Dashboard load failed.", error);
      setStatus(error.message || "Member access failed.", "error");
      if (/sign-in|auth|membership|required/i.test(error.message || "")) showSignedIn(false);
    }
  };

  $("[data-member-login-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const email = new FormData(event.currentTarget).get("email")?.toString().trim();
      if (!email) throw new Error("Enter your approved Guild email address.");
      setStatus("Sending secure sign-in link…");
      await auth.requestMagicLink(email);
      setStatus("Sign-in link sent. Open it in this browser to continue.", "success");
    } catch (error) { setStatus(error.message || "Could not send sign-in link.", "error"); }
  });

  $("[data-member-signout]")?.addEventListener("click", async () => {
    await auth.signOut(); availabilityWindows = []; showSignedIn(false); setStatus("Signed out.", "success");
  });

  $("[data-member-settings]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const form = event.currentTarget;
      const values = new FormData(form);
      const settings = {
        preferred_name: values.get("preferred-name"), timezone: values.get("timezone"), postal_code: values.get("postal-code"), travel_radius_miles: Number(values.get("travel-radius")),
        systems: checked(form,"system"), other_ttrpg_interest: form.querySelector('input[name="other-interest"]').checked,
        participation_roles: checked(form,"role"), experience_level: values.get("experience"), preferred_session_length_minutes: Number(values.get("session-length")),
        group_size_min: Number(values.get("group-min")), group_size_max: Number(values.get("group-max")), venue_modes: checked(form,"venue"),
        campaign_commitment: values.get("campaign-commitment"), beginner_friendly: form.querySelector('input[name="beginner-friendly"]').checked,
        accessibility_needs: values.get("accessibility-needs"),
      };
      setStatus("Saving matching settings…");
      await api.updateSettings(settings);
      await loadDashboard();
    } catch (error) { setStatus(error.message || "Could not save settings.", "error"); }
  });

  $("[data-availability-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const values = new FormData(event.currentTarget);
      const start = toMinutes(values.get("start-time")); const end = toMinutes(values.get("end-time"));
      if (end - start < 60) throw new Error("Availability windows must be at least 60 minutes.");
      availabilityWindows.push({ day_of_week:Number(values.get("day-of-week")),start_minute:start,end_minute:end,timezone:$("[data-member-settings]")?.elements.namedItem("timezone")?.value || "UTC",venue_mode:values.get("venue-mode") });
      $("[data-availability-list]").innerHTML = render.availabilityRows(availabilityWindows);
      event.currentTarget.reset(); setStatus("Availability added locally. Save availability to apply it.");
    } catch (error) { setStatus(error.message || "Could not add availability.", "error"); }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]"); if (!button) return;
    try {
      button.disabled = true;
      if (button.dataset.action === "remove-window") { availabilityWindows.splice(Number(button.dataset.index),1); $("[data-availability-list]").innerHTML = render.availabilityRows(availabilityWindows); return; }
      if (button.dataset.action === "save-availability") { setStatus("Saving availability…"); await api.replaceAvailability(availabilityWindows); await loadDashboard(); return; }
      if (button.dataset.action === "respond") { setStatus("Saving invitation response…"); await api.respondInvitation(button.dataset.id,button.dataset.response); await loadDashboard(); }
    } catch (error) { logError("Member action failed.", error); setStatus(error.message || "Member action failed.", "error"); }
    finally { button.disabled = false; }
  });

  auth.captureSessionFromHash();
  if (auth.getAccessToken()) void loadDashboard(); else showSignedIn(false);
})();