(() => {
  "use strict";

  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const time = (minutes) => `${String(Math.floor(Number(minutes) / 60)).padStart(2,"0")}:${String(Number(minutes) % 60).padStart(2,"0")}`;
  const fmt = (value) => value ? new Date(value).toLocaleString() : "—";
  const join = (values) => Array.isArray(values) && values.length ? values.map(esc).join(", ") : "None";

  const availabilityRows = (items = []) => items.length ? items.map((item, index) => `<div class="availability-row"><div><strong>${esc(dayNames[item.day_of_week] || "Day")}</strong> · ${esc(time(item.start_minute))}–${esc(time(item.end_minute))} · ${esc(item.venue_mode)}<div class="member-meta"><span>${esc(item.timezone)}</span></div></div><button class="button button-ghost" type="button" data-action="remove-window" data-index="${index}">Remove</button></div>`).join("") : '<p class="member-empty">No availability saved yet.</p>';

  const invitationCards = (items = []) => items.length ? items.map((item) => `<article class="member-card"><div class="member-toolbar"><h3>${esc(item.system_name)} · ${esc(item.seat_role)}</h3><strong>${esc(item.response)}</strong></div><div class="member-meta"><span>${esc(item.venue_mode)}</span><span>${esc(item.coarse_location || "Location pending")}</span><span>Target ${esc(item.target_size)}</span><span>${esc(item.proposal_state)}</span></div><p><strong>Proposed schedule:</strong> ${esc(JSON.stringify(item.proposed_schedule || {}))}</p>${item.response === "pending" ? `<div class="member-actions"><button class="button button-primary" data-action="respond" data-id="${esc(item.id)}" data-response="accepted">Accept</button><button class="button button-ghost" data-action="respond" data-id="${esc(item.id)}" data-response="declined">Decline</button></div>` : ""}</article>`).join("") : '<p class="member-empty">No table invitations right now.</p>';

  const gameCards = (items = []) => items.length ? items.map((item) => `<article class="member-card"><div class="member-toolbar"><h3>${esc(item.system_name)}</h3><strong>${esc(item.state)}</strong></div><div class="member-meta"><span>${fmt(item.starts_at)}</span><span>${esc(item.venue_mode)}</span><span>${esc(item.coarse_location || "Location pending")}</span><span>${esc(item.seat_role)}</span><span>${esc(item.participant_count)} participants</span></div>${item.private_join_details ? `<p><strong>Private table details:</strong> ${esc(item.private_join_details)}</p>` : '<p class="member-private-note">Private table details have not been added yet.</p>'}</article>`).join("") : '<p class="member-empty">No confirmed games yet.</p>';

  const fillSettings = (data) => {
    const form = document.querySelector("[data-member-settings]");
    if (!form) return;
    const set = (name, value) => { const node = form.elements.namedItem(name); if (node && "value" in node) node.value = value ?? ""; };
    set("preferred-name", data.profile.preferred_name); set("timezone", data.profile.timezone); set("postal-code", data.private_settings.postal_code); set("travel-radius", data.private_settings.travel_radius_miles);
    set("experience", data.interests.experience_level); set("session-length", data.interests.preferred_session_length_minutes); set("group-min", data.preferences.group_size_min); set("group-max", data.preferences.group_size_max); set("campaign-commitment", data.preferences.campaign_commitment); set("accessibility-needs", data.private_settings.accessibility_needs);
    form.querySelectorAll('input[name="system"]').forEach((node) => { node.checked = data.interests.systems.includes(node.value); });
    form.querySelector('input[name="other-interest"]').checked = Boolean(data.interests.other_ttrpg_interest);
    form.querySelectorAll('input[name="role"]').forEach((node) => { node.checked = data.interests.participation_roles.includes(node.value); });
    form.querySelectorAll('input[name="venue"]').forEach((node) => { node.checked = data.preferences.venue_modes.includes(node.value); });
    form.querySelector('input[name="beginner-friendly"]').checked = Boolean(data.preferences.beginner_friendly);
  };

  const renderDashboard = (data, windows) => {
    document.querySelector("[data-member-kpis]").innerHTML = `<div class="member-kpi"><strong>${esc(data.profile.preferred_name)}</strong><span>Guild member</span></div><div class="member-kpi"><strong>${data.matching_ready ? "Ready" : "Needs setup"}</strong><span>Matching status</span></div><div class="member-kpi"><strong>${esc(join(data.interests.systems))}</strong><span>Active systems</span></div>`;
    document.querySelector("[data-availability-list]").innerHTML = availabilityRows(windows);
    document.querySelector("[data-invitation-list]").innerHTML = invitationCards(data.invitations);
    document.querySelector("[data-game-list]").innerHTML = gameCards(data.games);
    fillSettings(data);
  };

  window.GuildMemberRender = { renderDashboard, availabilityRows };
})();