# Guild Organizer Console

The organizer console is a private operational surface for Light Tower Table Top Guild. It is intentionally not a public member directory or messaging product.

## State flow

```text
adult intake
  -> organizer review
  -> approved Auth user + Guild member
  -> member preferences / availability
  -> draft adult table proposal
  -> deterministic compatibility ranking
  -> invitations
  -> accepted roster
  -> confirmed game
```

Youth-group inquiries remain a separate manual-review path and never enter adult matching.

## Data boundaries

- Original adult and youth submissions stay in the non-exposed `private` schema.
- Adult accessibility information remains separated from general intake data.
- Exact member ZIP code and travel radius are stored in `private.member_match_location`.
- Public member records carry only a coarse location such as a masked ZIP prefix.
- Organizer actions write to `private.organizer_audit_log`.
- Browser clients never receive the Supabase service-role key.
- Authenticated users cannot self-create `guild_members`; promotion is organizer-controlled.

## Organizer authorization

`organizer-api` requires all three layers:

1. Supabase Edge Function JWT verification.
2. Server-side `auth.getUser()` validation of the bearer token.
3. A matching active record in `private.organizer_access`.

The initial owner email is allowlisted in the database. The verified Auth user ID is bound to that allowlist record on first successful organizer authentication.

## Browser authentication

`organizer.html` requests a Supabase passwordless email link through the public Auth API. The resulting access token is kept in `sessionStorage`, not persistent local storage, and is removed on sign-out or expiry.

The organizer page is:

- `noindex,nofollow`
- absent from public navigation
- absent from the public sitemap list
- protected by the organizer API even if someone discovers the URL

Hiding the URL is not treated as an authorization mechanism.

## Required hosted Auth configuration

Supabase Auth only redirects Magic Links to configured Site URLs / allowed redirect URLs. Before relying on the organizer login in production, add the exact deployed organizer URL to **Auth -> URL Configuration -> Redirect URLs** in the Supabase Dashboard.

Examples depend on the production host:

```text
https://<production-domain>/organizer.html
https://cbw29512.github.io/FlorenceRPGWebsite/organizer.html
```

Only add URLs that are actually used. Do not add a broad wildcard unless there is a specific deployment requirement.

## Content Security Policy

Netlify's CSP permits outbound browser connections only to the same site and the exact Guild Supabase origin:

```text
connect-src 'self' https://vtqoxflirpfhnxzzpxfa.supabase.co
```

The organizer validation gate fails if this is replaced with a wildcard.

## Current limitations

- Member self-service for preferences, availability, invitation response, and confirmed-game viewing is the next product phase.
- Travel radius is retained privately for organizer decisions, but the deterministic matcher does not yet calculate geographic distance between ZIP centroids.
- Approval creates the member's Auth account but does not send a separate welcome email. Member passwordless access will be wired in the member-console phase.
