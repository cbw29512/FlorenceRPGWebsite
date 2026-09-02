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

  const addFirstAdventurePath = () => {
    try {
      const nav = document.querySelector("#primary-nav");
      if (nav && !nav.querySelector('a[href="first-adventure.html"]')) {
        const link = document.createElement("a");
        link.href = "first-adventure.html";
        link.textContent = "First Adventure";
        const cta = nav.querySelector(".nav-cta");
        nav.insertBefore(link, cta || null);
      }

      const learnHeading = document.querySelector("#learn .section-heading");
      if (learnHeading && !learnHeading.querySelector('a[href="first-adventure.html"]')) {
        const link = document.createElement("a");
        link.className = "button button-ghost";
        link.href = "first-adventure.html";
        link.textContent = "See a Complete Adventure";
        link.style.marginLeft = ".65rem";
        learnHeading.appendChild(link);
      }
    } catch (error) {
      logError("The first-adventure pathway could not be added.", error);
    }
  };

  const setupPreviewForm = () => {
    try {
      const form = document.querySelector("[data-interest-form]");
      const status = document.querySelector("[data-form-status]");
      if (!form || !status) return;

      form.addEventListener("submit", (event) => {
        try {
          event.preventDefault();
          const data = new FormData(form);
          const name = String(data.get("name") || "Adventurer").trim();
          const interest = String(data.get("interest") || "tabletop RPGs");
          status.textContent = `${name}, the launch-list preview works. Your interest in ${interest} was not sent or stored.`;
          status.focus();
        } catch (error) {
          logError("Preview signup could not be processed.", error);
          status.textContent = "The preview could not be processed. Please try again.";
          status.focus();
        }
      });
    } catch (error) {
      logError("The preview form could not be initialized.", error);
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
    addFirstAdventurePath();
    setupNavigation();
    setupPreviewForm();
    setYear();
  } catch (error) {
    logError("The site could not finish initializing.", error);
  }
})();
