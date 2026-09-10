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

  const communityPostCard = (item) => `<article class="organizer-card" data-state="pending">
    <div class="organizer-toolbar"><h3>${esc(item.title)}</h3><strong>POST · ${esc(item.category)}</strong></div>
    <div class="organizer-meta"><span>${esc(item.author_name)}</span><span>${esc(item.author_email)}</span><span>${fmt(item.created_at)}</span></div>
    <p>${esc(item.body)}</p>
    <div class="organizer-actions"><button class="button button-primary" data-action="approve-community-post" data-id="${esc(item.id)}">Approve post</button><button class="button button-ghost" data-action="reject-community-post" data-id="${esc(item.id)}">Reject</button></div>
  </article>`;

  const communityReplyCard = (item) => `<article class="organizer-card" data-state="pending">
    <div class="organizer-toolbar"><h3>Reply waiting for review</h3><strong>REPLY</strong></div>
    <div class="organizer-meta"><span>${esc(item.author_name)}</span><span>${esc(item.author_email)}</span><span>Post ${esc(item.post_id)}</span><span>${fmt(item.created_at)}</span></div>
    <p>${esc(item.body)}</p>
    <div class="organizer-actions"><button class="button button-primary" data-action="approve-community-reply" data-id="${esc(item.id)}">Approve reply</button><button class="button button-primary" data-action="approve-dm-answer" data-id="${esc(item.id)}">Approve as DM Answer</button><button class="button button-ghost" data-action="reject-community-reply" data-id="${esc(item.id)}">Reject</button></div>
  </article>`;

  const candidateRows = (proposalId, items) => !items?.length ? '<p class="organizer-empty">No compatible candidates yet.</p>' : items.map((item) => `<div class="organizer-candidate"><div><strong>${esc(item.preferred_name)}</strong><div class="organizer-meta"><span>Score ${esc(item.compatibility_score)}</span><span>${esc(item.postal_code || item.coarse_location || "Location unavailable")}</span><span>${join(item.participation_roles)}</span></div></div><div class="organizer-actions">${item.participation_roles?.includes("player") ? `<button class="button button-ghost" data-action="invite" data-proposal="${esc(proposalId)}" data-user="${esc(item.user_id)}" data-role="player">Invite player</button>` : ""}${item.participation_roles?.includes("gm") ? `<button class="button button-ghost" data-action="invite" data-proposal="${esc(proposalId)}" data-user="${esc(item.user_id)}" data-role="gm">Invite GM</button>` : ""}</div></div>`).join("");

  const renderDashboard = (data) => {
    const counts = data.counts || {};
    const kpis = document.querySelector("[data-organizer-kpis]");
    if (kpis) kpis.innerHTML = [["New adults", counts.adult_new],["Members", counts.active_members],["New youth", counts.youth_new],["Open tables", counts.open_proposals],["Scheduled", counts.scheduled_games]].map(([label,value]) => `<div class="organizer-kpi"><strong>${esc(value ?? 0)}</strong><span>${esc(label)}</span></div>`).join("");
    const adult = document.querySelector("[data-adult-list]");
    if (adult) adult.innerHTML = data.adult_intake?.length ? data.adult_intake.map(adultCard).join("") : '<p class="organizer-empty">No adult intake submissions.</p>';
    const youth = document.querySelector("[data-youth-list]");
    if (youth) youth.innerHTML = data.youth_intake?.length ? data.youth_intake.map(youthCard).join("") : '<p class="organizer-empty">No youth-group inquiries.</p>';
    const proposals = document.querySelector("[data-proposal-list]");
    if (proposals) proposals.innerHTML = data.proposals?.length ? data.proposals.map(proposalCard).join("") : '<p class="organizer-empty">No table proposals yet.</p>';
  };

  const renderCommunityQueue = (data) => {
    const target = document.querySelector("[data-community-moderation-list]");
    if (!target) return;
    const posts = Array.isArray(data?.posts) ? data.posts : [];
    const replies = Array.isArray(data?.replies) ? data.replies : [];
    const cards = [...posts.map(communityPostCard), ...replies.map(communityReplyCard)];
    target.innerHTML = cards.length ? cards.join("") : '<p class="organizer-empty">No Guild Board posts or replies are waiting for review.</p>';
    const count = document.querySelector("[data-community-moderation-count]");
    if (count) count.textContent = String(cards.length);
  };

  window.GuildOrganizerRender = { renderDashboard, renderCommunityQueue, candidateRows };
})();