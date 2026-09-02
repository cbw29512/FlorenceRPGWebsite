# Florence Tabletop Guild

A responsive, accessibility-focused community website for tabletop role-playing games in Florence and the Pee Dee region of South Carolina.

## Product direction

The homepage is intentionally a decision page. A visitor starts by choosing what they want to do:

- **Play** — express interest in finding a local table.
- **Learn** — use beginner walkthroughs and quick-reference guides.
- **Run games** — join as a DM, Keeper, or other Game Master and help build tables.

Members can identify as a **player, GM/Keeper, or both**. Dungeons & Dragons and Call of Cthulhu are the lead systems, with room for other TTRPGs as the Florence community grows.

## D&D learning path

`first-adventure.html` teaches a new player what a complete D&D one-shot looks like while introducing rules in context. The current walkthrough covers pregenerated characters, roleplay, ability checks, DCs, advantage/disadvantage, saving throws, initiative, attacks, Armor Class, damage, hit points, spells, death saves, resting, rewards, and milestone advancement.

The next parallel learning path will teach Call of Cthulhu through an investigation-focused walkthrough rather than copying D&D's combat structure.

## Community interest form

The homepage form is prepared for **Netlify Forms**. It collects only the launch information needed to understand community demand:

- name or nickname
- email
- player and/or GM/Keeper role
- D&D, Call of Cthulhu, and/or other TTRPG interest
- experience level
- desired next step

A honeypot field is included for basic spam filtering. `thanks.html` provides the post-submission confirmation page.

## Architecture

```text
index.html
first-adventure.html
thanks.html
netlify.toml
assets/
├── d20-book-hero.svg
├── guild-mark.svg
├── favicon.svg
├── css/
│   ├── base.css
│   ├── components.css
│   ├── responsive.css
│   ├── home-paths.css
│   ├── first-adventure.css
│   └── first-adventure-rules.css
└── js/
    ├── site.js
    └── first-adventure.js
```

Production files are kept modular and below roughly 150 lines where practical.

## Netlify deployment

This is a static site. Connect this GitHub repository to Netlify and publish the repository root. `netlify.toml` already sets the publish directory to `.` and adds baseline response headers.

After the first Netlify deployment:

1. Enable **Forms → Form detection** for the site.
2. Confirm Netlify detects the `community-interest` form.
3. Submit a test signup and verify it appears under Forms.
4. Add the final Netlify/custom domain to canonical metadata, `robots.txt`, and `sitemap.xml`.
5. Configure form-submission email notifications if desired.

## Current status

The frontend community router and D&D walkthrough are functional static pages. The Netlify form becomes persistent once the site is deployed with form detection enabled. Accounts, direct player-to-GM messaging, event scheduling, and reservations remain later phases and should only be added after the interest-first launch proves demand.

## Trademark notice

Florence Tabletop Guild is an independent community project and is not affiliated with Wizards of the Coast, Chaosium, or the publishers of other games referenced on the site.
