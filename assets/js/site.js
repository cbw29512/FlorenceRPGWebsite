(() => {
  "use strict";

  const logError = (message, error) => {
    console.error(`[Florence Tabletop Guild] ${message}`, error);
  };

  const setupNavigation = () => {
    try {
      const button = document.querySelector(".menu-button");
      const nav = document.querySelector("#primary-nav");
      if (!button || !nav) return;

      button.addEventListener("click", () => {
        const open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        nav.dataset.open = String(!open);
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          button.setAttribute("aria-expanded", "false");
          nav.dataset.open = "false";
        });
      });
    } catch (error) {
      logError("Navigation could not be initialized.", error);
    }
  };

  const focusInterestForm = () => {
    const firstInput = document.querySelector('[data-interest-form] input[name="name"]');
    if (firstInput) window.setTimeout(() => firstInput.focus(), 250);
  };

  const setupPathSelection = () => {
    try {
      document.querySelectorAll("[data-role-target]").forEach((link) => {
        link.addEventListener("click", () => {
          const role = link.dataset.roleTarget;
          const checkbox = document.querySelector(`#role-${role}`);
          if (checkbox) checkbox.checked = true;
          focusInterestForm();
        });
      });

      document.querySelectorAll("[data-system-target]").forEach((link) => {
        link.addEventListener("click", () => {
          const system = link.dataset.systemTarget;
          const checkbox = document.querySelector(`#system-${system}`);
          if (checkbox) checkbox.checked = true;
          focusInterestForm();
        });
      });
    } catch (error) {
      logError("Path selection could not be initialized.", error);
    }
  };

  const setupInterestValidation = () => {
    try {
      const form = document.querySelector("[data-interest-form]");
      if (!form) return;

      form.addEventListener("submit", (event) => {
        const roles = form.querySelectorAll('input[name="role"]:checked');
        const systems = form.querySelectorAll('input[name="system"]:checked');
        if (roles.length && systems.length) return;

        event.preventDefault();
        const missing = [];
        if (!roles.length) missing.push("whether you want to play or run games");
        if (!systems.length) missing.push("at least one game system");
        window.alert(`Please choose ${missing.join(" and ")}.`);
      });
    } catch (error) {
      logError("Interest form validation could not be initialized.", error);
    }
  };

  const setYear = () => {
    try {
      document.querySelectorAll("[data-year]").forEach((node) => {
        node.textContent = String(new Date().getFullYear());
      });
    } catch (error) {
      logError("The footer year could not be updated.", error);
    }
  };

  try {
    setupNavigation();
    setupPathSelection();
    setupInterestValidation();
    setYear();
  } catch (error) {
    logError("The site could not finish initializing.", error);
  }
})();
