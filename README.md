# Light Tower Table Top Guild

Light Tower is the public hub for a growing tabletop ecosystem: free D&D tools, original adventures, beginner learning resources, Dungeon Master support, and safe real-world table formation. Florence, South Carolina remains the founding chapter; the public platform is designed for use across the United States.

**Public promise:** Free tools. Table-ready adventures. Learn to play. Find your table.

## Product architecture

The website is the Guild front door rather than a social network or a single-purpose matching page.

- **Home (`/`)** — introduces the Light Tower ecosystem, features the strongest live projects, and routes visitors to Tools, Adventures, Learn, Guild, or Find a Table.
- **Learn (`/learn`)** — a guided beginner D&D walkthrough with a complete sample adventure, interactive combat sequence, and annotated character-sheet path.
- **Tools (`/tools`)** — the public app catalog for live, Beta, Coming Soon, and Workshop projects, plus private app requests.
- **Adventures (`/adventures`)** — the Guild Vault for complete original releases and clearly separated development previews.
- **Guild (`/guild`)** — community structure, chapters, venue verification, safety, GM support, and ways to contribute.
- **Find a Table (`/find-table`)** — structured 18+ interest and matching intake. This is a Guild service, not the entire public identity.
- **Youth (`/youth`)** — separate guardian-led path for existing youth groups. Minors never enter adult individual matching.

The platform deliberately avoids public member directories, stranger DMs, swipe mechanics, public contact details, adult/minor individual matching, and fabricated community activity.

## Visual and UX system

The public design uses a shared fantasy-guild system: dark plum/night surfaces, parchment content areas, gold accents, the Light Tower mark, an illustrated d20/open-book hero, and role-focused project presentation. Production pages receive one shared navigation/footer from `scripts/build-shell.mjs` so page shells cannot drift independently.

The production build also:

- converts internal navigation to clean public routes;
- adds the guided Learn progress path;
- fixes targeted cross-project handoffs such as Character Forge;
- emits content-hashed external CSS bundles for browser caching;
- generates canonical clean URLs, social-preview metadata, sitemap, and robots policy;
- marks preview deploys `noindex` and identifies their environment in page metadata.

## Project release tiers

Every public Guild project has an explicit status:

- **Live** — released for regular public use.
- **Beta** — usable public build; workflows or presentation may still change.
- **Coming Soon** — approaching release but not yet given a Guild launch link.
- **In the Workshop** — active project with important implementation or certification still incomplete.

Normal promotion path: **Workshop → Coming Soon → Beta → Live**. A public deployment alone is never proof that a project is finished.

Current catalog includes live Character Forge, DM Forge, Nothing But A TTRPG Dice Roller, Cleric in a Box, The Iron Pit, and Guild Vault content; Dungeon Cards is Beta; TomeForge is Coming Soon; The Living Table, DungeonMaps, D&D Language Translator, and Tabletop Scribe are Workshop projects.

## Guild Vault

Released adventures follow a complete-package standard. The first release is **Right to OwlBear Arms v1.1**, hosted directly on the Guild site as one verified ZIP with clearly separated player-safe and DM-only material. The exact binary package is protected by size and SHA-256 checks in `scripts/validate-site.mjs`.

**Demon's Wrath** is a development preview and remains Coming Soon until the complete campaign package is reviewed as one Guild-ready release.

## Public forms and data boundaries

Three public Netlify form definitions exist:

- `guild-interest` — adult national interest pool;
- `youth-group-interest` — existing youth-group inquiry;
- `guild-app-request` — private product-planning input.

JavaScript-enabled adult/youth intake uses dedicated Supabase Edge Functions. Browser code never contains a service-role credential. Accessibility and youth-sensitive information remain private organizer data.

Preview builds are explicitly marked by the build pipeline, and `assets/js/guild-intake.js` refuses to write preview/test submissions into production Supabase. Real matching intake only runs from a production build.

The private organizer console is `noindex,nofollow`, absent from public navigation, bearer-token protected, and uses session-scoped credentials. Magic-link requests do not auto-create unknown organizer users. Operational input uses labeled modal dialogs rather than browser `prompt()` calls.

## Build pipeline

Netlify runs:

```text
validate source
→ validate organizer boundaries
→ JavaScript syntax checks
→ build shared shell / clean routes
→ build guided experience fixes
→ build content-hashed CSS
→ build metadata / environment markers
→ validate production output
→ validate production organizer
```

Production CSS files are generated under `assets/css/build/` with content hashes and immutable cache headers. Source-named scripts and images revalidate normally.

## Quality gates

The GitHub workflow runs source validation, organizer-security validation, production build steps, then Lighthouse CI across the public pages. The existing target remains **100/100** for Performance, Accessibility, Best Practices, and SEO.

`main` should be protected in GitHub so the Lighthouse quality gate is a required status check before merge. The connected GitHub app used by ChatGPT does not have repository-administration permission, so branch protection itself must be enabled from repository settings by an owner/admin.

## Clean public routes

Netlify exposes:

```text
/                    Home
/learn               Beginner D&D walkthrough
/character-sheet     Annotated character sheet
/tools               Guild app catalog
/adventures          Guild Vault
/guild               Guild Hall
/find-table           Adult table-interest path
/youth                Guardian-led youth-group path
```

Legacy `.html` paths redirect permanently to these public routes.

## Support and independence

Light Tower is community-supported and intentionally ad-free. Optional support uses the canonical Buy Me a Coffee link already present on the public site.

Light Tower Table Top Guild is an independent community project and is not affiliated with Wizards of the Coast, Chaosium, or publishers of other games referenced on the site.
