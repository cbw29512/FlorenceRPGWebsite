(() => {
  "use strict";

  const GUILD_INTEREST_ENDPOINT = "https://vtqoxflirpfhnxzzpxfa.supabase.co/functions/v1/guild-interest";
  const logError = (message, error) => console.error(`[Light Tower Table Top Guild] ${message}`, error);

  const setupNavigation = () => {
    try {
      const button = document.querySelector(".menu-button");
      const nav = document.querySelector("#primary-nav");
      if (!button || !nav) return;
      button.setAttribute("aria-label", "Open menu");
      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        button.setAttribute("aria-label", open ? "Open menu" : "Close menu");
        nav.dataset.open = String(!open);
      });
      nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Open menu");
        nav.dataset.open = "false";
      }));
    } catch (error) { logError("Navigation could not be initialized.", error); }
  };

  const repairLegacyLinks = () => {
    try {
      document.querySelectorAll('a[href="index.html#games"]').forEach((link) => { link.href = "index.html#systems"; });
      document.querySelectorAll('a[href="index.html#learn"]').forEach((link) => { link.href = "first-adventure.html"; });
      document.querySelectorAll('a[href="index.html#community"]').forEach((link) => { link.href = "guild-hall.html"; });
      document.querySelectorAll('a[href="index.html#interest"]').forEach((link) => { link.href = "join.html"; });
    } catch (error) { logError("Legacy links could not be repaired.", error); }
  };

  const setupJoinPrefill = () => {
    try {
      const form = document.querySelector("[data-interest-form]");
      if (!form) return;
      const params = new URLSearchParams(window.location.search);
      const role = params.get("role");
      const system = params.get("system");
      if (["player", "gm"].includes(role)) {
        const checkbox = document.querySelector(`#role-${role}`);
        if (checkbox) checkbox.checked = true;
      }
      if (["dnd", "cthulhu", "other"].includes(system)) {
        const checkbox = document.querySelector(`#system-${system}`);
        if (checkbox) checkbox.checked = true;
      }
    } catch (error) { logError("Join-page prefill could not be applied.", error); }
  };

  const collectInterestPayload = (form) => ({
    name: form.querySelector('input[name="name"]')?.value.trim() ?? "",
    email: form.querySelector('input[name="email"]')?.value.trim() ?? "",
    postalCode: form.querySelector('input[name="zip"]')?.value.trim() ?? "",
    travelRadius: Number(form.querySelector('select[name="travel-radius"]')?.value ?? 0),
    adultConfirmed: Boolean(form.querySelector('input[name="adult-18-plus"]')?.checked),
    consentEmail: Boolean(form.querySelector('input[name="consent"]')?.checked),
    roles: Array.from(form.querySelectorAll('input[name="role"]:checked')).map((node) => node.value),
    systems: Array.from(form.querySelectorAll('input[name="system"]:checked')).map((node) => node.value),
    experience: form.querySelector('select[name="experience"]')?.value ?? "",
    preferredFormat: form.querySelector('select[name="format"]')?.value ?? "",
    nextStep: form.querySelector('select[name="next-step"]')?.value ?? "",
    accessibilityNeeds: form.querySelector('textarea[name="accessibility-needs"]')?.value.trim() ?? "",
    botField: form.querySelector('input[name="bot-field"]')?.value ?? "",
  });

  const validateInterestPayload = (form, payload) => {
    const messages = [];
    try {
      const email = form.querySelector('input[name="email"]');
      if (!payload.name) messages.push("Enter a name or nickname.");
      if (!email?.validity.valid) messages.push("Enter a valid email address.");
      if (!/^\d{5}(?:-\d{4})?$/.test(payload.postalCode)) messages.push("Enter a valid U.S. ZIP code.");
      if (!payload.adultConfirmed) messages.push("Confirm that you are 18 or older for individual matching.");
      if (!payload.roles.length) messages.push("Choose Player, GM/Keeper, or both.");
      if (!payload.systems.length) messages.push("Choose at least one game system.");
      if (!payload.consentEmail) messages.push("Confirm that we may email you about Light Tower Table Top Guild.");
    } catch (error) {
      logError("Interest form payload validation failed.", error);
      messages.push("Please review the form and try again.");
    }
    return messages;
  };

  const submitInterestPayload = async (payload) => {
    try {
      const response = await fetch(GUILD_INTEREST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Guild interest endpoint returned ${response.status}.`);
      const result = await response.json();
      if (!result?.ok) throw new Error("Guild interest endpoint did not confirm the submission.");
      return true;
    } catch (error) {
      logError("Guild interest submission failed.", error);
      return false;
    }
  };

  const setupInterestSubmission = () => {
    try {
      const form = document.querySelector("[data-interest-form]");
      const errors = document.querySelector("[data-form-errors]");
      const submitButton = form?.querySelector('button[type="submit"]');
      if (!form || !errors || !submitButton) return;

      form.addEventListener("submit", async (event) => {
        try {
          const payload = collectInterestPayload(form);
          const messages = validateInterestPayload(form, payload);
          if (messages.length) {
            event.preventDefault();
            errors.dataset.visible = "true";
            errors.textContent = messages.join(" ");
            errors.focus();
            return;
          }

          // JavaScript-enabled submissions go to the private Supabase intake.
          // The existing Netlify form remains as a no-JavaScript fallback.
          event.preventDefault();
          errors.dataset.visible = "false";
          errors.textContent = "";
          submitButton.disabled = true;
          submitButton.setAttribute("aria-busy", "true");
          const originalText = submitButton.textContent;
          submitButton.textContent = "Submitting…";

          const submitted = await submitInterestPayload(payload);
          if (submitted) {
            window.location.assign("thanks.html");
            return;
          }

          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
          submitButton.textContent = originalText;
          errors.dataset.visible = "true";
          errors.textContent = "We could not save your interest right now. Please try again.";
          errors.focus();
        } catch (error) {
          event.preventDefault();
          logError("Interest form submission could not be completed.", error);
          submitButton.disabled = false;
          submitButton.removeAttribute("aria-busy");
          errors.dataset.visible = "true";
          errors.textContent = "We could not save your interest right now. Please try again.";
          errors.focus();
        }
      });
    } catch (error) { logError("Interest form submission could not be initialized.", error); }
  };

  const setYear = () => {
    try { document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); }); }
    catch (error) { logError("Footer year could not be updated.", error); }
  };

  repairLegacyLinks();
  setupNavigation();
  setupJoinPrefill();
  setupInterestSubmission();
  setYear();
})();
