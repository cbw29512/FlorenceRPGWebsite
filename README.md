# Light Tower Table Top Guild

A responsive, accessibility-focused tabletop role-playing community platform designed for use across the United States, with Florence, South Carolina preserved as the founding chapter.

**Working promise:** Find your table. Learn the game. Tell your story.

## Product direction

The site is intentionally divided by job so it does not become a repetitive social network:

- **Home** — asks what the visitor wants to do: Play, Learn, or Run Games.
- **Learn D&D** — teaches core D&D play through a beginner walkthrough.
- **Guild Hall** — explains community structure, chapters, matching, venues, safety, and ways to help.
- **One-Shots / Guild Vault** — shows complete original adventure packages and exactly what each package contains.
- **Tools / Tool Bench** — serves as the central Light Tower hub for public D&D/tabletop projects, clearly separates release tiers, and accepts private requests for specific future Guild apps.

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

Matching applies hard compatibility filters before any preference scoring. Public counts must come from real stored records rather than fabricated launch numbers.

## D&D learning path

`first-adventure.html` teaches a new player what a complete D&D one-shot looks like while introducing rules in context. The walkthrough covers pregenerated characters, roleplay, ability checks, DCs, advantage/disadvantage, saving throws, initiative, attacks, Armor Class, damage, hit points, spells, death saves, resting, rewards, and milestone advancement.

The next planned flagship beginner product is **First Light**, a Session Zero adventure designed to teach new players and new DMs while remaining useful as a campaign opener for experienced DMs.

## Guild Vault

`one-shots.html` is the product-facing adventure page.

The first package is **Right to OwlBear Arms v1.1**. The package standard is one complete ZIP with clearly separated player-safe and DM-only assets. The current v1.1 package contains exactly 13 files, including the revised 29-page adventure with New DM Fast Start guidance and an expanded DM Cheat Sheet.

A public download link should only be enabled after the exact binary ZIP has been attached to the production host. The site must not point at a placeholder or incomplete package.

## Guild tools and release tiers

`tools.html` is the central public directory for Light Tower-built tabletop projects. Every listed project must have an explicit release tier:

- **Live** — released for regular public use and allowed to expose a launch link.
- **Beta** — has a tested public build that Guild members can use now, but features, data, workflow, or presentation may still change; the public card must say it is Beta.
- **Coming Soon** — approaching a Guild release but not yet allowed to expose a launch link.
- **In the Workshop** — a real active project with a working foundation, but important capability, validation, or release certification is still incomplete; no Guild launch link is exposed.

The normal promotion path is **Workshop → Coming Soon → Beta → Live**. A public deployment by itself is not proof that a project is release-ready.

Current project inventory:

- **Nothing But A TTRPG Dice Roller** — Live production tool: https://nothingbutattrpgdiceroller.netlify.app/
- **Character Forge** — Live production tool: https://characterforgerdnd.netlify.app/
- **DM Forge** — Live DM toolkit: https://cbw29512.github.io/monstercardforge/
- **Cleric in a Box** — Live table companion: https://cbw29512.github.io/healingbox/
- **Dungeon Cards** — Beta public test: https://cbw29512.github.io/DNDCards/ — its repository has a tested production build and successful public Pages deployment, while the broader platform remains actively evolving.
- **TomeForge** — Coming Soon: free, offline/local-first Player and DM digital tomes with no account required.
- **The Living Table** — In the Workshop: live multiplayer and the seven-slot card board exist, while exact combat persistence, broader rules certification, homebrew builders, accessibility review, and release hardening remain incomplete.
- **DungeonMaps** — In the Workshop: Node/SQLite campaign state, API, and WebSocket foundations exist, while the battle-map canvas, tokens, fog of war, DM/player roles, state broadcasting, upload, and map-resume workflow remain incomplete.
- **The Iron Pit** — remains governed by its own project status and is intentionally excluded from this optimization pass.

Using a Guild tool does not imply Guild matching data is shared with that separate project. Standalone Guild projects should provide a clear return path to the Light Tower hub as they are brought under the shared brand.

## Request a Guild app

The Tool Bench includes a public `guild-app-request` Netlify form so players, DMs, and organizers can request a specific future tool without creating an account or a public post.

The request asks for:

- the app or tool idea
- who needs it
- the table problem it should solve
- one optional must-have feature
- expected use frequency
- whether an existing Guild tool should be improved instead
- optional name and optional follow-up email

The form is private planning input. Submitting an idea does not guarantee implementation, but repeated requests can inform what moves into the Workshop next. It uses a honeypot field and the same noindex confirmation page as the other public forms.

## Community forms and private intake

JavaScript-enabled matching submissions use dedicated Supabase Edge Functions and service-role-only database RPCs:

- `guild-interest` — adult national interest pool → `guild-interest` Edge Function
- `youth-group-interest` — existing youth-group inquiry → `youth-group-interest` Edge Function

The browser never receives a service-role key and cannot query the private intake tables. Adult accessibility information is stored separately from the general adult submission. Youth group data uses its own tables and Edge Function; optional venue/accessibility information is also stored separately. Youth inquiries never enter adult automatic matching.

The existing Netlify form definitions remain as a no-JavaScript fallback for the adult/youth intake forms. The separate `guild-app-request` form is intentionally a simple Netlify planning form rather than part of the matching database. All public forms retain honeypot protection. `thanks.html` is the shared post-submission confirmation page and is marked `noindex`.

## Matching backend boundaries

The Supabase backend separates three layers:

1. **Interest intake** — private, non-public submissions used to measure demand and begin organizer follow-up.
2. **Authenticated matching records** — member interests, matching preferences, availability, proposals, invitations, and confirmed games protected by Row Level Security.
3. **Sensitive organizer data** — accessibility, guardian, safety, and compatibility-evaluation data in the non-exposed `private` schema.

There is intentionally no public member-directory table or stranger-messaging system. Member-facing policies expose only the authenticated user's own records, invitations, and confirmed games in which that user participates.

## Architecture

```text
index.html
first-adventure.html
guild-hall.html
one-shots.html
tools.html
join.html
youth-groups.html
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
    ├── guild-intake.js
    └── first-adventure.js
```

## Production quality gates

The production build bundles/inlines page CSS and Lighthouse CI checks:

- Performance
- Accessibility
- Best Practices
- SEO

The public gate covers all production pages configured in `lighthouserc.js`, and source validation runs before and after the production build steps.

## Deployment

This remains a static front end. Netlify publishes the repository root using `netlify.toml`; Supabase provides the private matching intake/backend while Netlify handles the standalone app-request form.

After deployment:

1. Confirm adult and youth matching forms still submit successfully with JavaScript enabled.
2. Confirm those matching submissions appear only in the expected private Supabase tables.
3. Confirm Netlify detects `guild-interest`, `youth-group-interest`, and `guild-app-request`.
4. Confirm a Guild app request reaches the Netlify form inbox and the confirmation page without creating a public profile.
5. Keep the Supabase service-role key server-side only; never add it to this repository or browser JavaScript.
6. Run the repository quality workflow before merging any production change.

## Trademark notice

Light Tower Table Top Guild is an independent community project and is not affiliated with Wizards of the Coast, Chaosium, or publishers of other games referenced on the site.