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

  const setYear = () => {
    try { document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); }); }
    catch (error) { logError("Footer year could not be updated.", error); }
  };

  repairLegacyLinks();
  setupNavigation();
  setupJoinPrefill();
  setYear();
})();
