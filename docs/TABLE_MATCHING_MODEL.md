# Light Tower Table Top Guild — Table Matching Model

Status: architecture decision for the first public matching release.

## Definition of Done

Light Tower Table Top Guild is a **table-formation service**, not a messaging app. The matching feature is ready only when it can take structured interest data, form compatible tables, connect those tables to verified places to play, and send structured invitations without exposing private member contact information.

The launch rules are:

1. **Individual matching is 18+.**
2. A person under 18 is never placed in the adult matching pool and is never individually paired with an unknown adult.
3. Youth participation is allowed only through an **existing youth group** with parent/guardian consent, following `docs/YOUTH_GROUP_POLICY.md`.
4. The Guild may train a young DM/GM/Keeper in an appropriate supervised/group context; the founder does not serve as the regular DM for a youth group.
5. There are no direct messages, open chat rooms, public member search, public email/phone numbers, swipe mechanics, public home addresses, follower systems, or anonymous conversations.
6. Every public event, venue, seat count, and community statistic comes from stored records and has a source or verification timestamp. No fake events, fabricated counts, fake testimonials, or implied venue partnerships.
7. A venue is never called a Guild venue until a human has confirmed permission to use it.
8. Matching uses hard eligibility filters before any preference score.
9. A human/admin keeps final control over real-world table formation and venue approval.
10. Participants can accept, decline, withdraw, or report a table without privately contacting another member.
11. The model must work anywhere in the United States without requiring a local chapter.

## Data Schema

### people

- `id: uuid`
- `display_name: text` — first name or nickname; not globally searchable
- `email: text` — private
- `participation_type: adult_18_plus | youth_group_guardian`
- `zip_code: text` — private matching input, not a public profile field
- `travel_radius_miles: integer`
- `timezone: text` — IANA timezone such as `America/New_York`
- `experience: never_played | beginner | regular | experienced`
- `accessibility_needs: enum[]`
- `status: active | paused | suspended | deleted`
- `created_at: timestamp`
- `last_active_at: timestamp`

### youth_group_requests

Youth requests are **not** people records in the adult matching pool.

- `id: uuid`
- `guardian_name: text`
- `guardian_email: text`
- `zip_code: text`
- `participant_count: integer`
- `age_range: text`
- `system: dnd_2014 | dnd_2024 | call_of_cthulhu | other`
- `experience: never_played | beginner | regular`
- `has_youth_gm: boolean`
- `wants_gm_training: boolean`
- `accessibility_needs: enum[]`
- `availability_summary: structured json`
- `guardian_consent_status: pending | verified | declined`
- `guardian_consent_verified_at: timestamp nullable`
- `status: new | reviewing | approved | declined | completed`

Do not collect unnecessary minor names, birthdays, phone numbers, social handles, or individual profiles.

### role_preferences

- `person_id: uuid`
- `role: player | gm | keeper`
- `system: dnd_2014 | dnd_2024 | call_of_cthulhu | other`
- `beginner_friendly: boolean`
- `campaign_length: one_shot[] | short_arc[] | campaign[]`
- `play_style: combat[] | roleplay[] | exploration[] | mystery[] | horror[] | balanced[]`
- `content_rating: family | teen | mature`
- `max_table_size: integer`

### availability_slots

- `person_id: uuid`
- `weekday: 0-6`
- `start_local: time`
- `end_local: time`
- `timezone: text`
- `cadence: weekly | biweekly | monthly | one_time`

Store absolute event timestamps in UTC and render them in each participant's local timezone. Recurring availability remains attached to the participant's declared IANA timezone so nationwide matching does not assume Eastern Time.

### venues

- `id: uuid`
- `name: text`
- `address: text` — public business/public-facility address only
- `city: text`
- `state: text`
- `zip_code: text`
- `latitude: numeric nullable`
- `longitude: numeric nullable`
- `venue_type: game_store | library | restaurant | brewery | community_space | other`
- `status: candidate | contacted | verified | declined | inactive`
- `source_url: text`
- `source_checked_at: timestamp`
- `permission_contact: text` — private organizer note
- `permission_verified_at: timestamp nullable`
- `capacity: integer nullable`
- `min_age: integer nullable`
- `alcohol_present: boolean`
- `accessibility_features: enum[]` — only verified facts
- `recurring_availability: json nullable`
- `notes_private: text`

### chapters

A chapter is optional local organization, not a prerequisite for matching.

- `id: uuid`
- `slug: text`
- `name: text`
- `city: text`
- `state: text`
- `status: forming | active | paused | retired`
- `founding_chapter: boolean`
- `organizer_person_id: uuid nullable`
- `verified_at: timestamp nullable`

Florence, South Carolina is the founding chapter. Other chapters are created only when real local organization exists.

### tables

- `id: uuid`
- `gm_person_id: uuid`
- `chapter_id: uuid nullable`
- `system: enum`
- `edition: text nullable`
- `title: text`
- `campaign_length: enum`
- `play_style: enum[]`
- `beginner_friendly: boolean`
- `content_rating: enum`
- `min_players: integer`
- `max_players: integer`
- `venue_id: uuid nullable`
- `start_at_utc: timestamp nullable`
- `timezone: text`
- `cadence: one_shot | weekly | biweekly | monthly`
- `status: draft | matching | ready_for_review | inviting | confirmed | completed | cancelled`

### match_scores

- `table_id: uuid`
- `person_id: uuid`
- `eligibility: boolean`
- `schedule_score: 0-35`
- `system_score: 0-25`
- `experience_score: 0-15`
- `campaign_score: 0-10`
- `style_score: 0-10`
- `accessibility_score: 0-5`
- `total_score: 0-100`
- `reason_codes: enum[]`
- `calculated_at: timestamp`

### invitations

- `id: uuid`
- `table_id: uuid`
- `person_id: uuid`
- `status: pending | accepted | declined | expired | withdrawn`
- `expires_at: timestamp`
- `sent_at: timestamp`
- `responded_at: timestamp nullable`

### reports

- `id: uuid`
- `reporter_person_id: uuid`
- `subject_type: person | table | event | venue | organizer`
- `subject_id: uuid`
- `reason: enum`
- `details_private: text`
- `status: new | reviewing | resolved | dismissed | escalated`
- `created_at: timestamp`
- `resolved_at: timestamp nullable`

## Matching Logic

### Hard filters first

An adult player is eligible for a table only when:

1. Both player and GM/Keeper records are active and 18+.
2. Game system/edition is compatible.
3. There is enough schedule overlap after timezone normalization.
4. The table has an open seat.
5. The selected verified venue is inside the player's declared travel radius, or the table is still in pre-venue planning.
6. Required accessibility needs are compatible with verified venue information.
7. Content rating and table environment are compatible.
8. No moderation/safety rule blocks the pairing.

Youth-group requests never enter this algorithm.

### Weighted score after eligibility

- Schedule fit: **35 points**
- Game/system fit: **25 points**
- Experience/beginner fit: **15 points**
- Campaign-length fit: **10 points**
- Play-style fit: **10 points**
- Accessibility/venue fit: **5 points**

Suggested thresholds:

- **85-100:** strong recommendation
- **70-84:** usable if the table needs seats
- **Below 70:** do not auto-suggest

## Efficient Formation Flow

1. Adult participant submits structured preferences once.
2. GM/Keeper creates a structured table request.
3. Matching engine removes impossible candidates, then ranks the remainder.
4. Admin sees a compact proposed table rather than conversations.
5. Admin confirms venue permission/availability and approves the proposal.
6. Selected participants receive the same structured invitation: game, date/time in their local timezone, venue, seat count, content expectations, accessibility notes, safety tools, and table rules.
7. Acceptances fill seats; declines immediately promote the next compatible candidate.
8. Once minimum seats are accepted, the table becomes confirmed.
9. Operational updates are event-wide announcements, not private member-to-member messages.

## Youth Group Flow

1. Parent/guardian submits an existing group inquiry.
2. The group remains outside adult matching.
3. Guardian consent is verified before any youth event is arranged.
4. The group may request a learn-to-play session or training for its own young DM/GM/Keeper.
5. Venue and supervision requirements are reviewed manually.
6. No individual youth contact data is exposed to adult participants.

## Real-Data Contract

The UI must distinguish:

- **Verified Guild venue** — permission confirmed by a human and still current.
- **Community venue candidate** — a real place that appears potentially suitable from public information but has not agreed to host Guild tables.
- **Public event** — a current event linked to an identifiable source and last-checked date.
- **Guild event** — created from a confirmed Guild table and verified venue.

Never convert `candidate` to `verified` automatically.

Florence-area places previously identified during founding-chapter research remain **candidates** until directly confirmed. Internal research does not imply sponsorship, partnership, reservation availability, or endorsement.

## Tool Bench

Verified public tool URLs:

- **Nothing But A TTRPG Dice Roller** — https://nothingbutattrpgdiceroller.netlify.app/
- **D&D Character Forge** — https://cbw29512.github.io/dnd-character-forge/

Character Forge currently identifies itself as a release-candidate/friend-test build, so Light Tower labels it **Public Preview / Release Candidate** until that project is formally promoted.

Tool links remain optional and do not share Light Tower matching data unless a future integration is deliberately designed with explicit consent.
