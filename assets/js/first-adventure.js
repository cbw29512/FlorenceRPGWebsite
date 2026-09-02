(() => {
  "use strict";

  const logError = (message, error) => {
    console.error(`[Light Tower Table Top Guild: First Adventure] ${message}`, error);
  };

  const rollDie = (sides) => Math.floor(Math.random() * sides) + 1;

  const setupRuleLab = () => {
    try {
      const root = document.querySelector("[data-rule-lab]");
      if (!root) return;

      const output = root.querySelector("[data-rule-output]");
      const initiativeButton = root.querySelector("[data-roll-initiative]");
      const attackButton = root.querySelector("[data-roll-attack]");
      const saveButton = root.querySelector("[data-roll-save]");
      if (!output || !initiativeButton || !attackButton || !saveButton) return;

      const show = (title, body) => {
        const heading = document.createElement("strong");
        const detail = document.createElement("span");
        heading.textContent = title;
        detail.textContent = body;
        output.replaceChildren(heading, detail);
        output.focus();
      };

      initiativeButton.addEventListener("click", () => {
        try {
          const participants = [
            ["Mara", 2], ["Tess", 3], ["Alden", 0], ["Elira", 2],
            ["Goblin A", 2], ["Goblin B", 2]
          ].map(([name, modifier]) => ({ name, roll: rollDie(20), modifier }));
          participants.forEach((entry) => { entry.total = entry.roll + entry.modifier; });
          participants.sort((a, b) => b.total - a.total);
          const order = participants.map((entry) => `${entry.name}: ${entry.roll} ${entry.modifier >= 0 ? "+" : ""}${entry.modifier} = ${entry.total}`).join(" · ");
          show("Initiative order", `${order}. Highest total acts first.`);
        } catch (error) { logError("Initiative example failed.", error); }
      });

      attackButton.addEventListener("click", () => {
        try {
          const d20 = rollDie(20);
          const attackBonus = 5;
          const armorClass = 15;
          if (d20 === 1) {
            show("Attack roll", `Natural 1 — the attack misses. Attack total would have been ${d20 + attackBonus}.`);
            return;
          }
          const total = d20 + attackBonus;
          if (d20 !== 20 && total < armorClass) {
            show("Attack roll", `${d20} + ${attackBonus} = ${total} vs AC ${armorClass}. Miss.`);
            return;
          }
          const firstDie = rollDie(8);
          const secondDie = d20 === 20 ? rollDie(8) : 0;
          const damage = firstDie + secondDie + 3;
          const damageText = d20 === 20
            ? `Natural 20! Critical hit: ${firstDie} + ${secondDie} + 3 = ${damage} damage.`
            : `${d20} + ${attackBonus} = ${total} vs AC ${armorClass}. Hit! ${firstDie} + 3 = ${damage} damage.`;
          show("Attack roll", damageText);
        } catch (error) { logError("Attack example failed.", error); }
      });

      saveButton.addEventListener("click", () => {
        try {
          const d20 = rollDie(20);
          const modifier = 5;
          const dc = 12;
          const total = d20 + modifier;
          show("Dexterity saving throw", `${d20} + ${modifier} = ${total} vs DC ${dc}. ${total >= dc ? "Success" : "Failure"}.`);
        } catch (error) { logError("Saving throw example failed.", error); }
      });
    } catch (error) { logError("Rule lab could not be initialized.", error); }
  };

  setupRuleLab();
})();
