(() => {
  "use strict";

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
    } catch (error) { logError("Legacy links could not be repaired.", error); }
  };

  const focusInterestForm = () => {
    const firstInput = document.querySelector('[data-interest-form] input[name="name"]');
    if (firstInput) window.setTimeout(() => firstInput.focus(), 150);
  };

  const setupPathSelection = () => {
    try {
      document.querySelectorAll("[data-role-target]").forEach((link) => link.addEventListener("click", () => {
        const checkbox = document.querySelector(`#role-${link.dataset.roleTarget}`);
        if (checkbox) checkbox.checked = true;
        focusInterestForm();
      }));
      document.querySelectorAll("[data-system-target]").forEach((link) => link.addEventListener("click", () => {
        const checkbox = document.querySelector(`#system-${link.dataset.systemTarget}`);
        if (checkbox) checkbox.checked = true;
        focusInterestForm();
      }));
    } catch (error) { logError("Path selection could not be initialized.", error); }
  };

  const setupInterestValidation = () => {
    try {
      const form = document.querySelector("[data-interest-form]");
      const errors = document.querySelector("[data-form-errors]");
      if (!form || !errors) return;
      form.addEventListener("submit", (event) => {
        try {
          const messages = [];
          const name = form.querySelector('input[name="name"]');
          const email = form.querySelector('input[name="email"]');
          const zip = form.querySelector('input[name="zip"]');
          const age = form.querySelector('input[name="adult-18-plus"]');
          const consent = form.querySelector('input[name="consent"]');
          if (!name?.value.trim()) messages.push("Enter a name or nickname.");
          if (!email?.validity.valid) messages.push("Enter a valid email address.");
          if (zip && !/^\d{5}(?:-\d{4})?$/.test(zip.value.trim())) messages.push("Enter a valid U.S. ZIP code.");
          if (!age?.checked) messages.push("Confirm that you are 18 or older for individual matching.");
          if (!form.querySelectorAll('input[name="role"]:checked').length) messages.push("Choose Player, GM/Keeper, or both.");
          if (!form.querySelectorAll('input[name="system"]:checked').length) messages.push("Choose at least one game system.");
          if (!consent?.checked) messages.push("Confirm that we may email you about Light Tower Table Top Guild.");
          if (!messages.length) { errors.dataset.visible = "false"; errors.textContent = ""; return; }
          event.preventDefault();
          errors.dataset.visible = "true";
          errors.textContent = messages.join(" ");
          errors.focus();
        } catch (error) {
          event.preventDefault();
          logError("Interest form validation failed.", error);
          errors.dataset.visible = "true";
          errors.textContent = "Please review the form and try again.";
          errors.focus();
        }
      });
    } catch (error) { logError("Interest form validation could not be initialized.", error); }
  };

  const setYear = () => {
    try { document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); }); }
    catch (error) { logError("Footer year could not be updated.", error); }
  };

  repairLegacyLinks();
  setupNavigation();
  setupPathSelection();
  setupInterestValidation();
  setYear();
})();
