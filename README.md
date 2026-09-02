# Florence Tabletop Guild

A responsive, accessibility-focused community website for tabletop role-playing games in Florence and the Pee Dee region of South Carolina.

## Current experience

The site now includes:

- A consistent Florence Tabletop Guild brand system
- A mathematically accurate icosahedron-style d20 used in the logo, favicon, and hero art
- Beginner pathways for Dungeons & Dragons and Call of Cthulhu
- A guided D&D first-adventure walkthrough that teaches the shape of a complete one-shot
- Contextual beginner explanations for ability checks, saving throws, advantage/disadvantage, initiative, Armor Class, attacks, damage, hit points, spell resolution, death saves, resting, and advancement
- An interactive teaching lab for initiative, weapon attacks, critical hits, damage, and saving throws
- Game Master and Keeper recruitment
- A community-voted roadmap for additional TTRPG systems
- Youth safety, accessibility, and community-standard commitments
- Florence-focused SEO metadata and Organization structured data
- Responsive keyboard-accessible navigation and a clearly labeled preview signup flow

## Architecture

```text
index.html
first-adventure.html
assets/
├── d20-book-hero.svg
├── guild-mark.svg
├── favicon.svg
├── css/
│   ├── base.css
│   ├── components.css
│   ├── responsive.css
│   ├── first-adventure.css
│   └── first-adventure-rules.css
└── js/
    ├── site.js
    └── first-adventure.js
```

The production files are kept modular and below roughly 150 lines each where practical. Content-heavy HTML pages may exceed that threshold while behavior and styling remain separated.

## GitHub Pages

Publish from the repository's `main` branch and root folder:

`https://cbw29512.github.io/FlorenceRPGWebsite/`

## Validation

The redesign is checked for:

- Duplicate IDs and broken internal anchors
- Missing local assets
- Bound form labels and semantic landmarks
- Balanced CSS blocks
- JavaScript syntax
- Responsive breakpoints and reduced-motion support
- Beginner rules language that distinguishes attack rolls, ability checks, saving throws, Armor Class, and Difficulty Class

The walkthrough intentionally focuses on core 5e concepts that are common across typical 2014 and 2024 play. Edition-specific exceptions should be taught at the table when they become relevant rather than overloaded into the first-time-player path.

## Status

This remains a visual/community MVP. The interest form does not send or store data yet, and real member accounts, DM/player roles, messaging, event dates, seat counts, venues, and reservations will be connected in the production application.

The D&D first-adventure walkthrough is the first complete learning path. A parallel Call of Cthulhu walkthrough is planned after the D&D experience is visually reviewed and rules-audited.

## Trademark notice

Florence Tabletop Guild is an independent community concept and is not affiliated with Wizards of the Coast, Chaosium, or the publishers of other games referenced on the site.
