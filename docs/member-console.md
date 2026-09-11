# Guild Member Portal

The member portal is the authenticated self-service side of Light Tower Table Top Guild matching. It is available only after organizer approval creates the member's Auth account and Guild membership.

## Member state flow

```text
approved adult intake
  -> Auth account + active Guild membership
  -> member signs in
  -> matching settings
  -> availability
  -> matching ready
  -> table invitation
  -> accept / decline
  -> confirmed game
```

## Access boundary

- `member-api` requires a valid Supabase user JWT.
- Every database operation calls a service-role-only RPC that re-checks active adult Guild membership.
- Member Magic Link requests use `create_user: false`; the member page cannot create an unapproved account.
- The browser receives only the public publishable key and the member's short-lived user token.
- User tokens are stored in `sessionStorage`, not persistent local storage.
- `member.html` is `noindex,nofollow` and is not included in public navigation or the public sitemap.

## Member-controlled data

Members can update:

- preferred name
- timezone
- exact ZIP code and travel radius
- active D&D / Call of Cthulhu interest
- other-TTRPG interest-only flag
- player / GM roles
- experience
- preferred session length
- group-size range
- venue modes
- campaign commitment
- beginner-friendly preference
- optional accessibility/table needs
- weekly availability windows

Exact ZIP, travel radius, and accessibility notes stay in the private schema. The public member row uses only a masked coarse location such as `295xx`.

## Other-TTRPG boundary

An approved member may select only **Other TTRPG interest** with no active D&D or Call of Cthulhu system. That member remains a Guild member but is not considered `matching_ready` for the current active matching engine. The backend never substitutes D&D to satisfy a schema constraint.

## Invitations

A member can accept or decline only an invitation whose `user_id` matches the authenticated user. Database triggers:

- move proposals to `ready` when accepted seats meet the target and include a GM/Keeper
- prevent invitation-response changes after a proposal is confirmed or cancelled

## Confirmed games

Members see only games in which they are listed in `game_participants`. Private venue/join details are returned only to those participants.

## Required Auth redirect configuration

Before production Magic Links can return to the member portal, add the exact deployed member URL under **Supabase Auth -> URL Configuration -> Redirect URLs**.

Examples:

```text
https://<production-domain>/member.html
https://cbw29512.github.io/FlorenceRPGWebsite/member.html
```

Use exact real deployment URLs rather than broad wildcards.

## Current geographic limitation

Exact ZIP and travel radius are collected and available to authorized organizers, but the matching engine does not yet calculate road or straight-line distance between ZIP centroids. Geographic distance should be added as a separate deterministic matching layer rather than approximated with fabricated distances.
