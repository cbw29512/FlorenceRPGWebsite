(() => {
  "use strict";

  const logError = (message, error) => console.error(`[Light Tower Table Top Guild] ${message}`, error);

  const setupNavigation = () => {
    try {
      const button = document.querySelector(".menu-button");
      const nav = document.querySelector("#primary-nav");
      if (!button || !nav) return;

      const setOpen = (open) => {
        button.setAttribute("aria-expanded", String(open));
        button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        nav.dataset.open = String(open);
      };

      button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
      nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
          setOpen(false);
          button.focus();
        }
      });
      window.addEventListener("resize", () => {
        if (window.matchMedia("(min-width: 881px)").matches) setOpen(false);
      });
    } catch (error) { logError("Navigation could not be initialized.", error); }
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
    } catch (error) { logError("Find-a-table prefill could not be applied.", error); }
  };

  const setYear = () => {
    try { document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); }); }
    catch (error) { logError("Footer year could not be updated.", error); }
  };

  setupNavigation();
  setupJoinPrefill();
  setYear();
})();
