# Florence Tabletop Guild

A responsive, accessibility-focused community website for tabletop role-playing games in Florence and the Pee Dee region of South Carolina.

## Current experience

The site now includes:

- A consistent Florence Tabletop Guild brand system
- A mathematically accurate icosahedron-style d20 used in the logo, favicon, and hero art
- Beginner pathways for Dungeons & Dragons and Call of Cthulhu
- Game Master and Keeper recruitment
- A community-voted roadmap for additional TTRPG systems
- Youth safety, accessibility, and community-standard commitments
- Florence-focused SEO metadata and Organization structured data
- Responsive keyboard-accessible navigation and a clearly labeled preview signup flow

## Architecture

```text
index.html
assets/
├── d20-book-hero.svg
├── guild-mark.svg
├── favicon.svg
├── css/
│   ├── base.css
│   ├── components.css
│   └── responsive.css
└── js/
    └── site.js
```

The production files are kept modular and below roughly 150 lines each where practical.

## GitHub Pages

Publish from the repository's `main` branch and root folder:

`https://cbw29512.github.io/FlorenceRPGWebsite/`

## Validation

The redesign was checked for:

- Duplicate IDs and broken internal anchors
- Missing local assets
- Bound form labels and semantic landmarks
- Balanced CSS blocks
- JavaScript syntax
- Responsive breakpoints and reduced-motion support

## Status

This remains a visual MVP. The interest form does not send or store data, and real event dates, seat counts, venues, accounts, and reservations will be connected in the production application.

## Trademark notice

Florence Tabletop Guild is an independent community concept and is not affiliated with Wizards of the Coast, Chaosium, or the publishers of other games referenced on the site.
