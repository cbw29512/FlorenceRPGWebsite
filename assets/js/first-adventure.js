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
      const resetButton = root.querySelector("[data-reset-lab]");
      if (!output || !initiativeButton || !attackButton || !saveButton || !resetButton) return;

      const steps = [initiativeButton, attackButton, saveButton];

      const show = (title, body, order = []) => {
        const heading = document.createElement("strong");
        const detail = document.createElement("span");
        heading.textContent = title;
        detail.textContent = body;
        output.replaceChildren(heading, detail);

        if (order.length) {
          const row = document.createElement("div");
          row.className = "initiative-order";
          row.setAttribute("aria-label", "Initiative order from highest to lowest");
          order.forEach((entry, index) => {
            const item = document.createElement("b");
            item.textContent = `${index + 1}. ${entry}`;
            row.append(item);
          });
          output.append(row);
        }
        output.focus({ preventScroll: true });
      };

      const setActiveStep = (index) => {
        steps.forEach((button, buttonIndex) => {
          button.classList.remove("is-active");
          button.removeAttribute("aria-current");
          if (buttonIndex < index) {
            button.disabled = true;
            button.classList.add("is-complete");
          } else if (buttonIndex === index) {
            button.disabled = false;
            button.classList.remove("is-complete");
            button.classList.add("is-active");
            button.setAttribute("aria-current", "step");
          } else {
            button.disabled = true;
            button.classList.remove("is-complete");
          }
        });

        const finished = index >= steps.length;
        if (finished) {
          steps.forEach((button) => {
            button.disabled = true;
            button.classList.remove("is-active");
            button.classList.add("is-complete");
            button.removeAttribute("aria-current");
          });
          resetButton.disabled = false;
          resetButton.classList.add("is-active");
        } else {
          resetButton.disabled = true;
          resetButton.classList.remove("is-active");
        }
      };

      initiativeButton.addEventListener("click", () => {
        try {
          if (initiativeButton.disabled) return;
          const participants = [
            ["Mara", 2], ["Tess", 3], ["Alden", 0], ["Elira", 2], ["Goblins", 2]
          ].map(([name, modifier]) => ({ name, roll: rollDie(20), modifier }));
          participants.forEach((entry) => { entry.total = entry.roll + entry.modifier; });
          participants.sort((a, b) => b.total - a.total || b.modifier - a.modifier);
          const order = participants.map((entry) => `${entry.name} — ${entry.roll} ${entry.modifier >= 0 ? "+" : ""}${entry.modifier} = ${entry.total}`);
          show(
            "Initiative complete — highest total goes first.",
            "The DM writes the totals from highest to lowest. Everyone takes one turn in that order; then the next round starts at the top again.",
            order
          );
          setActiveStep(1);
        } catch (error) { logError("Initiative example failed.", error); }
      });

      attackButton.addEventListener("click", () => {
        try {
          if (attackButton.disabled) return;
          const d20 = rollDie(20);
          const attackBonus = 5;
          const armorClass = 15;
          if (d20 === 1) {
            show("Mara's attack", `Natural 1 — the attack misses. The printed attack bonus is +${attackBonus}, but a natural 1 on an attack misses.`);
            setActiveStep(2);
            return;
          }
          const total = d20 + attackBonus;
          if (d20 !== 20 && total < armorClass) {
            show("Mara's attack", `${d20} + ${attackBonus} = ${total} vs AC ${armorClass}. Miss. Meeting or beating AC would hit.`);
            setActiveStep(2);
            return;
          }
          const firstDie = rollDie(8);
          const secondDie = d20 === 20 ? rollDie(8) : 0;
          const damage = firstDie + secondDie + 3;
          const damageText = d20 === 20
            ? `Natural 20! Critical hit. Damage dice: ${firstDie} + ${secondDie}, then +3 = ${damage} slashing damage.`
            : `${d20} + ${attackBonus} = ${total} vs AC ${armorClass}. Hit. Damage: ${firstDie} + 3 = ${damage} slashing.`;
          show("Mara's attack", damageText);
          setActiveStep(2);
        } catch (error) { logError("Attack example failed.", error); }
      });

      saveButton.addEventListener("click", () => {
        try {
          if (saveButton.disabled) return;
          const d20 = rollDie(20);
          const modifier = 5;
          const dc = 12;
          const total = d20 + modifier;
          show(
            "Tess's Dexterity saving throw",
            `${d20} + ${modifier} = ${total} vs DC ${dc}. ${total >= dc ? "Success — she resists the listed danger." : "Failure — apply the trap or effect's listed consequence."}`
          );
          setActiveStep(3);
        } catch (error) { logError("Saving throw example failed.", error); }
      });

      resetButton.addEventListener("click", () => {
        try {
          if (resetButton.disabled) return;
          steps.forEach((button) => button.classList.remove("is-complete"));
          setActiveStep(0);
          show("Step 1 — Initiative", "Roll for everyone, add each Initiative bonus, then rank the totals from highest to lowest.");
        } catch (error) { logError("Rule lab reset failed.", error); }
      });

      setActiveStep(0);
    } catch (error) { logError("Rule lab could not be initialized.", error); }
  };

  setupRuleLab();
})();
