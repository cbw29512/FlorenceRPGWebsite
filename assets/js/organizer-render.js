(() => {
  "use strict";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  const join = (values) => Array.isArray(values) ? values.map(esc).join(", ") : esc(values);
  const fmt = (value) => value ? new Date(value).toLocaleString() : "—";

  const adultCard = (item) => `<article class="organizer-card" data-state="${esc(item.review_state)}">
    <div class="organizer-toolbar"><h3>${esc(item.name_or_nickname)}</h3><strong>${esc(item.review_state)}</strong></div>
    <div class="organizer-meta"><span>${esc(item.email)}</span><span>ZIP ${esc(item.postal_code)}</span><span>${esc(item.travel_radius_miles)} mi</span><span>${fmt(item.submitted_at)}</span></div>
    <p><strong>Roles:</strong> ${join(item.roles)} · <strong>Systems:</strong> ${join(item.systems)} · <strong>Experience:</strong> ${esc(item.experience)}</p>
    <p><strong>Format:</strong> ${esc(item.preferred_format)} · <strong>Next:</strong> ${esc(item.next_step)}</p>
    ${item.accessibility_needs ? `<p><strong>Private accessibility note:</strong> ${esc(item.accessibility_needs)}</p>` : ""}
    ${item.organizer_notes ? `<p><strong>Organizer note:</strong> ${esc(item.organizer_notes)}</p>` : ""}
    <div class="organizer-actions">
      ${item.review_state !== "promoted" ? `<button class="button button-primary" data-action="approve-adult" data-id="${esc(item.id)}">Approve &amp; promote</button>` : ""}
      ${item.review_state !== "promoted" ? `<button class="button button-ghost" data-action="decline-adult" data-id="${esc(item.id)}">Decline</button>` : ""}
    </div></article>`;

  const youthCard = (item) => `<article class="organizer-card" data-state="${esc(item.review_state)}">
    <div class="organizer-toolbar"><h3>${esc(item.guardian_name)}</h3><strong>${esc(item.review_state)}</strong></div>
    <div class="organizer-meta"><span>${esc(item.guardian_email)}</span><span>ZIP ${esc(item.postal_code)}</span><span>Group ${esc(item.group_size)}</span><span>Ages ${esc(item.age_range)}</span></div>
    <p><strong>System:</strong> ${esc(item.system_name)} · <strong>Status:</strong> ${esc(item.group_status)}</p>
    ${item.venue_or_accessibility_needs ? `<p><strong>Private venue/accessibility note:</strong> ${esc(item.venue_or_accessibility_needs)}</p>` : ""}
    <div class="organizer-actions"><button class="button button-primary" data-action="youth-contacted" data-id="${esc(item.id)}">Mark contacted</button><button class="button button-ghost" data-action="youth-closed" data-id="${esc(item.id)}">Close</button></div>
  </article>`;

  const proposalCard = (item) => `<article class="organizer-card" data-state="${esc(item.state)}">
    <div class="organizer-toolbar"><h3>${esc(item.system_name)} · ${esc(item.venue_mode)}</h3><strong>${esc(item.state)}</strong></div>
    <div class="organizer-meta"><span>${esc(item.coarse_location || "No location")}</span><span>Target ${esc(item.target_size)}</span><span>${esc(item.accepted_count)}/${esc(item.invitation_count)} accepted/invited</span></div>
    <p><strong>Schedule:</strong> ${esc(JSON.stringify(item.proposed_schedule || {}))}</p>
    <div class="organizer-actions"><button class="button button-primary" data-action="rank" data-id="${esc(item.id)}">Rank candidates</button>${item.state !== "confirmed" ? `<button class="button button-ghost" data-action="confirm" data-id="${esc(item.id)}">Confirm table</button>` : ""}</div>
    <div class="organizer-candidates" data-candidates-for="${esc(item.id)}"></div>
  </article>`;

  const candidateRows = (proposalId, items) => !items?.length ? '<p class="organizer-empty">No compatible candidates yet.</p>' : items.map((item) => `<div class="organizer-candidate"><div><strong>${esc(item.preferred_name)}</strong><div class="organizer-meta"><span>Score ${esc(item.compatibility_score)}</span><span>${esc(item.postal_code || item.coarse_location || "Location unavailable")}</span><span>${join(item.participation_roles)}</span></div></div><div class="organizer-actions">${item.participation_roles?.includes("player") ? `<button class="button button-ghost" data-action="invite" data-proposal="${esc(proposalId)}" data-user="${esc(item.user_id)}" data-role="player">Invite player</button>` : ""}${item.participation_roles?.includes("gm") ? `<button class="button button-ghost" data-action="invite" data-proposal="${esc(proposalId)}" data-user="${esc(item.user_id)}" data-role="gm">Invite GM</button>` : ""}</div></div>`).join("");

  const renderDashboard = (data) => {
    const counts = data.counts || {};
    document.querySelector("[data-organizer-kpis]").innerHTML = [["New adults", counts.adult_new],["Members", counts.active_members],["New youth", counts.youth_new],["Open tables", counts.open_proposals],["Scheduled", counts.scheduled_games]].map(([label,value]) => `<div class="organizer-kpi"><strong>${esc(value ?? 0)}</strong><span>${esc(label)}</span></div>`).join("");
    document.querySelector("[data-adult-list]").innerHTML = data.adult_intake?.length ? data.adult_intake.map(adultCard).join("") : '<p class="organizer-empty">No adult intake submissions.</p>';
    document.querySelector("[data-youth-list]").innerHTML = data.youth_intake?.length ? data.youth_intake.map(youthCard).join("") : '<p class="organizer-empty">No youth-group inquiries.</p>';
    document.querySelector("[data-proposal-list]").innerHTML = data.proposals?.length ? data.proposals.map(proposalCard).join("") : '<p class="organizer-empty">No table proposals yet.</p>';
  };

  window.GuildOrganizerRender = { renderDashboard, candidateRows };
})();