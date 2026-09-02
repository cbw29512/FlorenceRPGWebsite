(() => {
  "use strict";
  try {
    const button = document.querySelector("[data-print-sheet]");
    if (button) button.addEventListener("click", () => window.print());
  } catch (error) {
    console.error("[Light Tower Table Top Guild: Character Sheet Guide] Print control could not be initialized.", error);
  }
})();
