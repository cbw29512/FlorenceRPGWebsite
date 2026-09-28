window.GuildAffiliateSlots = (() => {
  const SLOT_ID = 'guild-gear';
  const BLOCKED = /(^|[./-])(example\.(com|org|net)|localhost|127\.0\.0\.1|0\.0\.0\.0)([:/]|$)|todo|placeholder|your-|yourtag|xxx|changeme/i;

  function isRealAffiliateUrl(value) {
    try {
      if (typeof value !== 'string' || !value.trim()) return false;
      const url = new URL(value.trim());
      if (url.protocol !== 'https:' || !url.hostname.includes('.')) return false;
      if (url.username || url.password) return false;
      return !BLOCKED.test(url.href);
    } catch (error) {
      return false;
    }
  }

  function renderableGroups(config) {
    try {
      if (!config || config.enabled !== true) return [];
      if (typeof config.disclosure !== 'string' || !config.disclosure.trim()) return [];
      return (Array.isArray(config.groups) ? config.groups : [])
        .map(group => ({
          title: String(group?.title || ''),
          items: (Array.isArray(group?.items) ? group.items : [])
            .filter(item => item && String(item.label || '').trim() && isRealAffiliateUrl(item.url))
            .map(item => ({label: String(item.label).trim(), note: String(item.note || '').trim(), url: item.url.trim()}))
        }))
        .filter(group => group.items.length);
    } catch (error) {
      console.error('Affiliate config check failed', error);
      return [];
    }
  }

  function el(doc, tag, className, text) {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function render(doc = document, config = window.GuildAffiliateConfig) {
    try {
      const slot = doc.getElementById(SLOT_ID);
      if (!slot) return false;
      slot.replaceChildren();
      slot.hidden = true;
      const groups = renderableGroups(config);
      if (!groups.length) return false;

      const title = el(doc, 'h2', 'gear-slot-title', String(config.heading || 'Gear for your next session'));
      title.id = 'guild-gear-title';
      slot.append(title);
      slot.append(el(doc, 'p', 'gear-slot-disclosure', config.disclosure.trim()));
      if (String(config.intro || '').trim()) slot.append(el(doc, 'p', 'gear-slot-intro', String(config.intro).trim()));
      const grid = el(doc, 'div', 'gear-slot-groups');
      for (const group of groups) {
        const box = el(doc, 'section', 'gear-slot-group');
        if (group.title) box.append(el(doc, 'h3', '', group.title));
        const list = el(doc, 'ul');
        for (const item of group.items) {
          const li = el(doc, 'li');
          const link = el(doc, 'a', '', item.label);
          link.href = item.url;
          link.target = '_blank';
          link.rel = 'sponsored nofollow noopener noreferrer';
          li.append(link);
          if (item.note) li.append(el(doc, 'span', '', item.note));
          list.append(li);
        }
        box.append(list);
        grid.append(box);
      }
      slot.append(grid);
      slot.setAttribute('aria-labelledby', title.id);
      slot.hidden = false;
      return true;
    } catch (error) {
      console.error('Affiliate slot render failed', error);
      return false;
    }
  }

  if (typeof document !== 'undefined' && document.getElementById) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => render());
    else render();
  }
  return {isRealAffiliateUrl, renderableGroups, render};
})();
