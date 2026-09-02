# Light Tower Table Top Guild

A responsive, accessibility-focused tabletop role-playing community platform designed for use across the United States, with Florence, South Carolina preserved as the founding chapter.

**Working promise:** Find your table. Learn the game. Tell your story.

## Product direction

The site is intentionally divided by job so it does not become a repetitive social network:

- **Home** — asks what the visitor wants to do: Play, Learn, or Run Games.
- **Learn D&D** — teaches core D&D play through a beginner walkthrough.
- **Guild Hall** — explains community structure, chapters, matching, venues, safety, and ways to help.
- **One-Shots / Guild Vault** — shows complete original adventure packages and exactly what each package contains.
- **Tools / Tool Bench** — promotes only projects whose own release status supports public use.

Individual matching is **18+**. Youth participation is handled separately as an existing group with parent/guardian consent and manual review.

The matching product is deliberately **not** a messaging app: no public member directory, direct stranger messaging, swipe mechanics, public contact details, or adult/minor individual matching.

## National matching model

The public interest form collects the minimum information needed to measure real demand and later form compatible tables:

- name or nickname
- email
- U.S. ZIP code
- preferred travel radius
- player and/or GM/Keeper role
- D&D, Call of Cthulhu, and/or other TTRPG interest
- experience level
- preferred game format
- desired next step
- 18+ confirmation and email consent

Future matching should apply hard filters before preference scoring. Public counts must come from real stored records rather than fabricated launch numbers.

## D&D learning path

`first-adventure.html` teaches a new player what a complete D&D one-shot looks like while introducing rules in context. The walkthrough covers pregenerated characters, roleplay, ability checks, DCs, advantage/disadvantage, saving throws, initiative, attacks, Armor Class, damage, hit points, spells, death saves, resting, rewards, and milestone advancement.

The next planned flagship beginner product is **First Light**, a Session Zero adventure designed to teach new players and new DMs while remaining useful as a campaign opener for experienced DMs.

## Guild Vault

`one-shots.html` is the product-facing adventure page.

The first package is **Right to OwlBear Arms v1.1**. The package standard is one complete ZIP with clearly separated player-safe and DM-only assets. The current v1.1 package contains exactly 13 files, including the revised 29-page adventure with New DM Fast Start guidance and an expanded DM Cheat Sheet.

A public download link should only be enabled after the exact binary ZIP has been attached to the production host. The site must not point at a placeholder or incomplete package.

## Guild tools

`tools.html` uses explicit release labels:

- **Nothing But A TTRPG Dice Roller** — Live production tool: https://nothingbutattrpgdiceroller.netlify.app/
- **D&D Character Forge** — Public release candidate: https://cbw29512.github.io/dnd-character-forge/
- **The Iron Pit** — remains off the public finished-tool list while its own repository identifies it as an MVP.
- **Dungeon Cards** — remains off the public finished-tool list until its release/status surface is strong enough to justify promotion.

Using a Guild tool does not imply Guild matching data is shared with that separate project.

## Community forms

The static site is prepared for **Netlify Forms**:

- `guild-interest` — adult national interest pool
- `youth-group-interest` — parent/guardian existing-youth-group inquiry

Both forms use honeypot fields. `thanks.html` is the post-submission confirmation page and is marked `noindex`.

## Architecture

```text
index.html
first-adventure.html
guild-hall.html
one-shots.html
tools.html
thanks.html
netlify.toml
assets/
├── guild-mark.svg
├── favicon.svg
├── css/
│   ├── base.css
│   ├── components.css
│   ├── responsive.css
│   ├── home-paths.css
│   ├── fantasy-theme.css
│   ├── first-adventure.css
│   ├── first-adventure-rules.css
│   ├── one-shots.css
│   └── guild-pages.css
└── js/
    ├── site.js
    └── first-adventure.js
```

## Production quality gates

The production build bundles/inlines page CSS and Lighthouse CI checks:

- Performance
- Accessibility
- Best Practices
- SEO

The public gate includes Home, Learn D&D, Guild Hall, One-Shots, Tools, and the confirmation page.

## Netlify deployment

This is a static site. Connect the repository to Netlify and publish the repository root. `netlify.toml` sets the publish directory to `.` and adds baseline response headers.

After deployment:

1. Enable **Forms → Form detection**.
2. Confirm Netlify detects `guild-interest` and `youth-group-interest`.
3. Submit test entries and verify they appear under Forms.
4. Add the final Netlify/custom domain to canonical metadata, `robots.txt`, and a fresh `sitemap.xml`.
5. Configure form-submission notifications if desired.

## Trademark notice

Light Tower Table Top Guild is an independent community project and is not affiliated with Wizards of the Coast, Chaosium, or publishers of other games referenced on the site.
