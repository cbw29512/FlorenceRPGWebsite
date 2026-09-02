(() => {
  "use strict";

  const ENDPOINTS = {
    adult: "https://vtqoxflirpfhnxzzpxfa.supabase.co/functions/v1/guild-interest",
    youth: "https://vtqoxflirpfhnxzzpxfa.supabase.co/functions/v1/youth-group-interest",
  };
  const logError = (message, error) => console.error(`[Light Tower Guild Intake] ${message}`, error);
  const checkedValues = (form, name) => Array.from(form.querySelectorAll(`input[name="${name}"]:checked`)).map((node) => node.value);

  const showErrors = (box, messages) => {
    try {
      box.dataset.visible = messages.length ? "true" : "false";
      box.textContent = messages.join(" ");
      if (messages.length) box.focus();
    } catch (error) { logError("Could not update form errors.", error); }
  };

  const sendPayload = async (endpoint, payload) => {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Intake endpoint returned ${response.status}.`);
      const result = await response.json();
      if (!result?.ok) throw new Error("Intake endpoint did not confirm submission.");
      return true;
    } catch (error) {
      logError("Submission failed.", error);
      return false;
    }
  };

  const submitWithState = async (form, button, errors, endpoint, payload) => {
    const originalText = button.textContent;
    try {
      showErrors(errors, []);
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.textContent = "Submitting…";
      if (!await sendPayload(endpoint, payload)) throw new Error("Intake service rejected submission.");
      window.location.assign("thanks.html");
    } catch (error) {
      logError("Form submission could not be completed.", error);
      button.disabled = false;
      button.removeAttribute("aria-busy");
      button.textContent = originalText;
      showErrors(errors, ["We could not save your request right now. Please try again."]);
    }
  };

  const setupAdultIntake = () => {
    try {
      const form = document.querySelector("[data-interest-form]");
      const errors = document.querySelector("[data-form-errors]");
      const button = form?.querySelector('button[type="submit"]');
      if (!form || !errors || !button) return;
      form.addEventListener("submit", async (event) => {
        try {
          const emailNode = form.querySelector('input[name="email"]');
          const payload = {
            name: form.querySelector('input[name="name"]')?.value.trim() ?? "",
            email: emailNode?.value.trim() ?? "",
            postalCode: form.querySelector('input[name="zip"]')?.value.trim() ?? "",
            travelRadius: Number(form.querySelector('select[name="travel-radius"]')?.value ?? 0),
            adultConfirmed: Boolean(form.querySelector('input[name="adult-18-plus"]')?.checked),
            consentEmail: Boolean(form.querySelector('input[name="consent"]')?.checked),
            roles: checkedValues(form, "role"), systems: checkedValues(form, "system"),
            experience: form.querySelector('select[name="experience"]')?.value ?? "",
            preferredFormat: form.querySelector('select[name="format"]')?.value ?? "",
            nextStep: form.querySelector('select[name="next-step"]')?.value ?? "",
            accessibilityNeeds: form.querySelector('textarea[name="accessibility-needs"]')?.value.trim() ?? "",
            botField: form.querySelector('input[name="bot-field"]')?.value ?? "",
          };
          const messages = [];
          if (!payload.name) messages.push("Enter a name or nickname.");
          if (!emailNode?.validity.valid) messages.push("Enter a valid email address.");
          if (!/^\d{5}(?:-\d{4})?$/.test(payload.postalCode)) messages.push("Enter a valid U.S. ZIP code.");
          if (!payload.adultConfirmed) messages.push("Confirm that you are 18 or older for individual matching.");
          if (!payload.roles.length) messages.push("Choose Player, GM/Keeper, or both.");
          if (!payload.systems.length) messages.push("Choose at least one game system.");
          if (!payload.consentEmail) messages.push("Confirm that we may email you about the Guild.");
          if (messages.length) { event.preventDefault(); showErrors(errors, messages); return; }
          event.preventDefault();
          await submitWithState(form, button, errors, ENDPOINTS.adult, payload);
        } catch (error) { event.preventDefault(); logError("Adult intake handler failed.", error); showErrors(errors, ["Please review the form and try again."]); }
      });
    } catch (error) { logError("Adult intake could not be initialized.", error); }
  };

  const setupYouthIntake = () => {
    try {
      const form = document.querySelector("[data-youth-group-form]");
      const errors = document.querySelector("[data-youth-form-errors]");
      const button = form?.querySelector('button[type="submit"]');
      if (!form || !errors || !button) return;
      form.addEventListener("submit", async (event) => {
        try {
          const emailNode = form.querySelector('input[name="guardian-email"]');
          const payload = {
            guardianName: form.querySelector('input[name="guardian-name"]')?.value.trim() ?? "",
            guardianEmail: emailNode?.value.trim() ?? "",
            postalCode: form.querySelector('input[name="zip"]')?.value.trim() ?? "",
            groupSize: Number(form.querySelector('input[name="group-size"]')?.value ?? 0),
            ageRange: form.querySelector('input[name="age-range"]')?.value.trim() ?? "",
            systemName: form.querySelector('select[name="system"]')?.value ?? "",
            groupStatus: form.querySelector('select[name="group-status"]')?.value ?? "",
            accessibilityNeeds: form.querySelector('textarea[name="group-accessibility-needs"]')?.value.trim() ?? "",
            guardianConsent: Boolean(form.querySelector('input[name="guardian-consent"]')?.checked),
            botField: form.querySelector('input[name="bot-field-youth"]')?.value ?? "",
          };
          const messages = [];
          if (!payload.guardianName) messages.push("Enter the parent or guardian name.");
          if (!emailNode?.validity.valid) messages.push("Enter a valid parent or guardian email.");
          if (!/^\d{5}(?:-\d{4})?$/.test(payload.postalCode)) messages.push("Enter a valid U.S. ZIP code.");
          if (!Number.isInteger(payload.groupSize) || payload.groupSize < 2 || payload.groupSize > 20) messages.push("Enter a group size from 2 to 20.");
          if (!payload.ageRange) messages.push("Enter the group's age range without individual minor names.");
          if (!payload.guardianConsent) messages.push("Confirm parent, guardian, or authorized-adult consent.");
          if (messages.length) { event.preventDefault(); showErrors(errors, messages); return; }
          event.preventDefault();
          await submitWithState(form, button, errors, ENDPOINTS.youth, payload);
        } catch (error) { event.preventDefault(); logError("Youth intake handler failed.", error); showErrors(errors, ["Please review the form and try again."]); }
      });
    } catch (error) { logError("Youth intake could not be initialized.", error); }
  };

  setupAdultIntake();
  setupYouthIntake();
})();
