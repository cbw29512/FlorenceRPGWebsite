/*
 * Light Tower future affiliate slot — OFF and EMPTY by default.
 *
 * Nothing renders until ALL of the following are true:
 *   1. enabled is true,
 *   2. disclosure is a non-empty FTC disclosure sentence, and
 *   3. at least one item has a real https:// URL from an affiliate program you have joined.
 * Placeholder, example, localhost, and TODO URLs are rejected by affiliate-slots.js.
 * Never paste invented or guessed links. Leave url as '' until you have the real one.
 * Amazon Associates disclosure, if you use Amazon: "As an Amazon Associate I earn from qualifying purchases."
 *
 * Before enabling: several pages promise "no ads" (and validate-site.mjs requires that phrase on
 * index, guild-hall, one-shots and tools). Decide how you want to word that alongside affiliate links.
 * The slot only exists on the Adventures page (one-shots.html), never on the youth-group pages.
 */
window.GuildAffiliateConfig = Object.freeze({
  enabled: false,
  heading: 'Gear for your next session',
  intro: 'Handy extras for new players and the person behind the screen.',
  disclosure: '',
  groups: Object.freeze([
    Object.freeze({
      id: 'start',
      title: 'Start playing',
      items: Object.freeze([
        Object.freeze({label: 'D&D Starter Set', note: 'Boxed adventure, pregens, and dice', url: ''}),
        Object.freeze({label: "Player's Handbook", note: 'Core rules for players', url: ''}),
        Object.freeze({label: 'Polyhedral dice set', note: 'd4 through d20', url: ''})
      ])
    }),
    Object.freeze({
      id: 'dm',
      title: 'Run the game',
      items: Object.freeze([
        Object.freeze({label: "Dungeon Master's Guide", note: 'Tools for game masters', url: ''}),
        Object.freeze({label: 'Monster Manual', note: 'Creatures and stat blocks', url: ''}),
        Object.freeze({label: 'DM screen', note: 'Quick rules at a glance', url: ''})
      ])
    }),
    Object.freeze({
      id: 'table',
      title: 'At the table',
      items: Object.freeze([
        Object.freeze({label: 'Dry-erase battle mat', note: 'Maps and encounters', url: ''}),
        Object.freeze({label: 'Miniatures or tokens', note: 'Heroes and monsters on the map', url: ''}),
        Object.freeze({label: 'Dice tray', note: 'Keeps rolls on the table', url: ''})
      ])
    })
  ])
});
