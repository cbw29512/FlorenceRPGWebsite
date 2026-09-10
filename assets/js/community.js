(() => {
  "use strict";

  const ENDPOINT = "https://vtqoxflirpfhnxzzpxfa.supabase.co/functions/v1/community-api";
  const CATEGORY_LABELS = {
    "guild-notes": "Light Tower Notes",
    "ask-a-dm": "Ask a DM",
    "dm-corner": "DM's Corner",
    "new-adventurers": "New Adventurers",
    "table-tales": "Table Tales",
    "workshop": "Workshop",
  };
  const state = { filter: "all", posts: [], replies: [] };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const logError = (message, error) => console.error(`[Light Tower Community] ${message}`, error);
  const formatDate = (value) => {
    try { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
    catch { return "Recent"; }
  };
  const setBoardStatus = (message) => { const node = $("[data-board-status]"); if (node) node.textContent = message; };
  const setFormStatus = (node, message, kind = "") => {
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  };

  const request = async (url = ENDPOINT, options = {}) => {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.ok) throw new Error(body.error || `Community service returned ${response.status}.`);
    return body;
  };

  const replyForm = (postId) => {
    const details = el("details", "reply-toggle");
    const summary = el("summary", "", "Reply to this note");
    const form = el("form", "reply-form");
    form.dataset.replyForm = postId;

    const nameLabel = el("label", "", "Name or nickname");
    const name = document.createElement("input");
    name.name = "author-name"; name.maxLength = 60; name.required = true; name.autocomplete = "nickname";
    nameLabel.append(name);

    const emailLabel = el("label", "", "Private email");
    const email = document.createElement("input");
    email.name = "author-email"; email.type = "email"; email.maxLength = 254; email.required = true; email.autocomplete = "email";
    emailLabel.append(email);

    const bodyLabel = el("label", "", "Reply");
    const body = document.createElement("textarea");
    body.name = "body"; body.maxLength = 1600; body.required = true;
    bodyLabel.append(body);

    const honey = document.createElement("input");
    honey.name = "website"; honey.tabIndex = -1; honey.autocomplete = "off"; honey.className = "honeypot"; honey.setAttribute("aria-hidden", "true");

    const button = el("button", "button button-secondary", "Send Reply for Review");
    button.type = "submit";
    const status = el("p", "reply-form-status");
    status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");

    form.append(nameLabel, emailLabel, bodyLabel, honey, button, status);
    details.append(summary, form);
    return details;
  };

  const renderReply = (reply) => {
    const article = el("article", "notice-reply");
    article.dataset.dmAnswer = String(Boolean(reply.is_dm_answer));
    const byline = el("div", "reply-byline");
    const author = el("strong", "", reply.author_name || "Adventurer");
    byline.append(author, document.createTextNode(` · ${formatDate(reply.created_at)}`));
    if (reply.is_dm_answer) byline.append(el("span", "notice-dm-answer", "✓ DM Answer"));
    article.append(byline, el("p", "", reply.body || ""));
    return article;
  };

  const renderPost = (post) => {
    const article = el("article", "notice-card");
    article.dataset.category = post.category || "";
    article.append(el("span", "notice-pin"));
    article.lastElementChild.setAttribute("aria-hidden", "true");

    const top = el("div", "notice-top");
    top.append(el("span", "notice-category", CATEGORY_LABELS[post.category] || "Board Note"));
    if (post.is_official) top.append(el("span", "notice-official", "✦ Official Light Tower"));
    article.append(top, el("h3", "", post.title || "Untitled note"));
    article.append(el("p", "notice-byline", `${post.author_name || "Adventurer"} · ${formatDate(post.created_at)}`));
    article.append(el("p", "notice-body", post.body || ""));

    const replies = state.replies.filter((reply) => reply.post_id === post.id);
    if (replies.length) {
      const replyWrap = el("div", "notice-replies");
      replies.forEach((reply) => replyWrap.append(renderReply(reply)));
      article.append(replyWrap);
    }
    article.append(replyForm(post.id));
    return article;
  };

  const renderBoard = () => {
    const target = $("[data-community-list]");
    if (!target) return;
    target.replaceChildren();
    const posts = state.filter === "all" ? state.posts : state.posts.filter((post) => post.category === state.filter);
    if (!posts.length) {
      const empty = el("article", "notice-card");
      const pin = el("span", "notice-pin"); pin.setAttribute("aria-hidden", "true");
      empty.append(pin, el("h3", "", "No approved notes in this section yet."), el("p", "notice-body", "Be the first to leave a useful note for Light Tower review."));
      target.append(empty);
      return;
    }
    posts.forEach((post) => target.append(renderPost(post)));
  };

  const loadBoard = async () => {
    try {
      setBoardStatus("Opening approved notes…");
      const data = await request(`${ENDPOINT}?limit=30`);
      state.posts = Array.isArray(data.posts) ? data.posts : [];
      state.replies = Array.isArray(data.replies) ? data.replies : [];
      renderBoard();
      setBoardStatus(`${state.posts.length} approved note${state.posts.length === 1 ? "" : "s"} on the Board.`);
    } catch (error) {
      logError("Board could not be loaded.", error);
      setBoardStatus("The Board service is waking up or temporarily unavailable. Please try again shortly.");
      const target = $("[data-community-list]");
      if (target) {
        target.replaceChildren();
        const card = el("article", "notice-card");
        const pin = el("span", "notice-pin"); pin.setAttribute("aria-hidden", "true");
        card.append(pin, el("h3", "", "The noticeboard is temporarily quiet."), el("p", "notice-body", "No posts were lost. The community service could not be reached from this browser just now."));
        target.append(card);
      }
    }
  };

  const setupFilters = () => {
    $$("[data-board-filter]").forEach((button) => button.addEventListener("click", () => {
      state.filter = button.dataset.boardFilter || "all";
      $$("[data-board-filter]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      renderBoard();
    }));
  };

  const setupPostForm = () => {
    const form = $("[data-community-post-form]");
    const status = $("[data-community-form-status]");
    if (!form) return;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = $("button[type='submit']", form);
      try {
        const data = new FormData(form);
        if (!data.get("public-ok")) throw new Error("Confirm that your note can be reviewed for public posting.");
        if (button) button.disabled = true;
        setFormStatus(status, "Pinning your note for Light Tower review…");
        await request(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submitPost",
            category: data.get("category"),
            authorName: data.get("author-name"),
            authorEmail: data.get("author-email"),
            title: data.get("title"),
            body: data.get("body"),
            website: data.get("website"),
          }),
        });
        form.reset();
        setFormStatus(status, "Your note was submitted for review. It will not appear publicly until approved.", "success");
      } catch (error) {
        logError("Post submission failed.", error);
        setFormStatus(status, error.message || "Could not submit your note.", "error");
      } finally { if (button) button.disabled = false; }
    });
  };

  const setupReplyForms = () => {
    document.addEventListener("submit", async (event) => {
      const form = event.target.closest("[data-reply-form]");
      if (!form) return;
      event.preventDefault();
      const button = $("button[type='submit']", form);
      const status = $(".reply-form-status", form);
      try {
        const data = new FormData(form);
        if (button) button.disabled = true;
        setFormStatus(status, "Sending reply for review…");
        await request(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submitReply",
            postId: form.dataset.replyForm,
            authorName: data.get("author-name"),
            authorEmail: data.get("author-email"),
            body: data.get("body"),
            website: data.get("website"),
          }),
        });
        form.reset();
        setFormStatus(status, "Reply submitted for review. It will appear only after approval.", "success");
      } catch (error) {
        logError("Reply submission failed.", error);
        setFormStatus(status, error.message || "Could not submit your reply.", "error");
      } finally { if (button) button.disabled = false; }
    });
  };

  setupFilters();
  setupPostForm();
  setupReplyForms();
  void loadBoard();
})();
