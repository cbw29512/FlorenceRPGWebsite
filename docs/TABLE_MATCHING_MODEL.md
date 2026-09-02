# Florence Tabletop Guild — Table Matching Model

Status: architecture decision for the first public matching release.

## Definition of Done

The matching system is ready for public use only when all of the following are true:

1. It uses structured player, GM/Keeper, table, availability, and venue records. It does not expose a user-to-user inbox, direct messages, public email addresses, phone numbers, or free-form public profiles.
2. Public matching is 18+ at launch. Users under 18 are not matched with unknown adults and are directed to supervised public youth programs instead.
3. Every published venue is explicitly marked as either `candidate` or `verified`. A venue cannot be presented as a Guild host until a human has confirmed the venue permits the use and recorded when/how that confirmation happened.
4. A player can specify system, experience level, preferred campaign length, availability, travel radius, accessibility needs, table environment, and play-style preferences.
5. A GM/Keeper can specify the same compatibility fields plus table capacity, minimum players, content rating, safety tools, beginner friendliness, and venue requirements.
6. Matching uses hard eligibility filters before scoring. No amount of preference similarity can override age, schedule, venue, capacity, or safety incompatibility.
7. A match does not expose members to one another immediately. The Guild/admin flow creates a proposed table, reviews it, then sends each person an invitation to the same structured event.
8. Participants can accept, decline, withdraw, or report a table/event without contacting another member.
9. Free-form text is minimized. Where text is necessary, it is private to organizers/admins until reviewed.
10. Every public count, venue claim, event listing, and availability statement is generated from stored records with a verification timestamp. No fabricated member counts, fake events, fake testimonials, or implied venue partnerships.
11. The system records moderation/report events and supports suspension of a person, table, venue listing, or organizer without deleting the audit trail.
12. The user-facing site remains usable for learning D&D and using Guild tools without creating a matching profile.

## Product Boundary: This Is Not a Messaging App

The Guild exists to form real tabletop groups and help them reach a real table. It is not a social feed, dating surface, chat service, or anonymous conversation platform.

Not included:
- Direct messages
- Open chat rooms
- Public comments
- Public user search
- Follower/friend counts
- Swipe mechanics
- Public contact details
- Photo-first profiles
- Location tracking
- Public home addresses
- Unmoderated adult/minor matching

Allowed communication:
- Structured event invitations
- RSVP / decline / waitlist actions
- Organizer announcements sent to the whole registered table
- Safety/report forms
- Admin-to-participant operational email when necessary

## Data Schema

### people

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Internal only |
| display_name | text | First name or nickname; not globally searchable |
| email | text | Private; never exposed to other members |
| age_band | enum | `adult_18_plus`; future youth flows must be separate/supervised |
| experience | enum | `never_played`, `beginner`, `regular`, `experienced` |
| travel_radius_miles | integer | Used only for matching |
| accessibility_needs | enum[] | Structured options, private to matching/admin flow |
| status | enum | `active`, `paused`, `suspended`, `deleted` |
| created_at | timestamp | Audit |
| last_active_at | timestamp | Helps avoid stale matching |

### role_preferences

| Field | Type | Notes |
| --- | --- | --- |
| person_id | uuid | FK people |
| role | enum | `player`, `gm`, `keeper` |
| system | enum | `dnd_2014`, `dnd_2024`, `call_of_cthulhu`, `other` |
| beginner_friendly | boolean | Especially important for GMs |
| campaign_length | enum[] | `one_shot`, `short_arc`, `campaign` |
| play_style | enum[] | `combat`, `roleplay`, `exploration`, `mystery`, `horror`, `balanced` |
| content_rating | enum | `family`, `teen`, `mature` (18+ matching still applies at launch) |
| max_table_size | integer | Preference, not public profile data |

### availability_slots

| Field | Type | Notes |
| --- | --- | --- |
| person_id | uuid | FK people |
| weekday | integer | 0-6 |
| start_local | time | America/New_York at launch |
| end_local | time | Must overlap minimum session duration |
| cadence | enum | `weekly`, `biweekly`, `monthly`, `one_time` |

### venues

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Internal |
| name | text | Real-world venue name |
| address | text | Public business/public-facility address only |
| venue_type | enum | `game_store`, `library`, `restaurant`, `brewery`, `community_space`, `other` |
| status | enum | `candidate`, `contacted`, `verified`, `declined`, `inactive` |
| source_url | text | Where the public information came from |
| source_checked_at | timestamp | Freshness record |
| permission_contact | text | Private organizer note; never public |
| permission_verified_at | timestamp | Required before `verified` |
| capacity | integer nullable | Only after verified |
| min_age | integer nullable | Venue/event constraint |
| alcohol_present | boolean | Helps table suitability |
| accessibility_features | enum[] | Only verified facts |
| recurring_availability | json nullable | Only after venue confirmation |
| notes_private | text | Admin only |

### tables

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Internal |
| gm_person_id | uuid | FK people |
| system | enum | Hard match filter |
| edition | text nullable | e.g. 2014 / 2024 |
| title | text | Moderated table title |
| campaign_length | enum | Match field |
| play_style | enum[] | Match field |
| beginner_friendly | boolean | Match field |
| content_rating | enum | Must be compatible |
| min_players | integer | Readiness threshold |
| max_players | integer | Hard capacity |
| venue_id | uuid nullable | Must be verified before confirmed event |
| start_at | timestamp nullable | Event time |
| cadence | enum | `one_shot`, `weekly`, `biweekly`, `monthly` |
| status | enum | `draft`, `matching`, `ready_for_review`, `inviting`, `confirmed`, `completed`, `cancelled` |

### match_scores

| Field | Type | Notes |
| --- | --- | --- |
| table_id | uuid | FK tables |
| person_id | uuid | FK people |
| eligibility | boolean | Hard filters pass/fail |
| schedule_score | integer | 0-35 |
| system_score | integer | 0-25 |
| experience_score | integer | 0-15 |
| campaign_score | integer | 0-10 |
| style_score | integer | 0-10 |
| accessibility_score | integer | 0-5 |
| total_score | integer | 0-100 |
| reason_codes | enum[] | Explainable matching |
| calculated_at | timestamp | Audit/reproducibility |

### invitations

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Internal |
| table_id | uuid | FK tables |
| person_id | uuid | FK people |
| status | enum | `pending`, `accepted`, `declined`, `expired`, `withdrawn` |
| expires_at | timestamp | Prevent stale seats |
| sent_at | timestamp | Audit |
| responded_at | timestamp nullable | Audit |

### reports

| Field | Type | Notes |
| --- | --- | --- |
| id | uuid | Internal |
| reporter_person_id | uuid | Private |
| subject_type | enum | `person`, `table`, `event`, `venue`, `organizer` |
| subject_id | uuid | Target |
| reason | enum | Structured reason |
| details_private | text | Moderation only |
| status | enum | `new`, `reviewing`, `resolved`, `dismissed`, `escalated` |
| created_at | timestamp | Audit |
| resolved_at | timestamp nullable | Audit |

## Matching Logic

### Hard filters — fail first

A player is not eligible for a table unless all required conditions pass:

1. Both records are active and the public-matching age band is `adult_18_plus`.
2. The requested game system/edition is compatible.
3. The player has at least one availability overlap long enough for the session.
4. The table has an open seat.
5. Travel radius can reach the selected verified venue, or the table has not yet selected a venue and is still in planning.
6. Required accessibility needs are compatible with verified venue data.
7. Content rating and table environment are compatible.
8. The person is not blocked by a moderation/safety rule for that organizer/table.

### Weighted score after eligibility

- Schedule fit: **35 points**
- Game/system fit: **25 points**
- Experience/beginner fit: **15 points**
- Campaign-length fit: **10 points**
- Play-style fit: **10 points**
- Accessibility/venue fit: **5 points**

Suggested operating thresholds:
- 85-100: strong recommendation
- 70-84: usable if table needs seats
- below 70: do not auto-suggest

A table should become `ready_for_review` only when it has one GM/Keeper, a verified venue/time path, and at least the minimum number of strong/usable candidate players.

## Efficient Formation Flow

1. Person submits structured preferences once.
2. GM/Keeper creates a structured table request.
3. Matching engine filters impossible candidates, then ranks the remainder.
4. Admin sees a compact table proposal, not a stream of messages.
5. Admin confirms venue availability/permission and approves the proposal.
6. Each selected participant receives the same invitation with system, date/time, venue, content expectations, accessibility notes, and table rules.
7. Acceptances fill seats. Declines immediately promote the next candidate.
8. Once minimum seats are accepted, the table is confirmed. Contact information remains private unless the organizer deliberately uses an external, disclosed method after the event is formed.

This produces fewer moderation surfaces than a chat product and minimizes organizer work because the algorithm does the sorting while a human keeps final control over real-world gatherings.

## Youth Safety Boundary

At launch, Florence Tabletop Guild does **not** match minors with adults or expose youth profiles.

For under-18 visitors:
- Learning content remains available.
- The site may list verified supervised youth programs at libraries, schools, game stores, or other established organizations.
- Youth events must be published from verified public sources or directly by a verified venue/organization.
- No adult participant can privately contact a minor through the Guild.
- A future youth matching feature would require a separate design with guardian consent, verified organizations, staff/volunteer controls, and appropriate legal/safeguarding review.

## Real-Data Contract

The UI must distinguish these states:

- **Verified Guild venue** — venue permission confirmed by a human and still current.
- **Community venue candidate** — real place that appears suitable from public information but has not agreed to host Guild tables.
- **Public event** — event copied/linked from an identifiable current source with source and last-checked date.
- **Guild event** — event created from a confirmed Guild table and verified venue.

Never convert `candidate` to `verified` automatically.

Initial public-data venue candidates discovered for Florence:
- Heroes Hideout — local game store/community play space.
- Florence County Library System — public library with community programming/meeting space.
- Seminar Brewing — large social venue with documented community events.

These are candidates only until contacted/confirmed. Their presence in the data model does not imply sponsorship, endorsement, reservation availability, or partnership.

## Tool Hub

The Florence site can safely promote useful first-party tools without turning them into required accounts:

- Nothing But A TTRPG Dice Roller — https://nothingbutattrpgdiceroller.netlify.app/
- D&D 5e Character Forge — https://cbw29512.github.io/dnd-character-forge/

Tool links should open directly, disclose that they are separate tools, and never share Florence matching data unless a future integration is deliberately designed and consented to.
