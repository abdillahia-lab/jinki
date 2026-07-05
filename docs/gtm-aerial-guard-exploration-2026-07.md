# Jinki Aerial Guard — GTM Strategy Engagement
**Drone Security-as-a-Service · Northern Virginia · Commercial segments only**
**Prepared July 2026 | Working document — thinking partnership, not a plan of record**

> Companion to `competitive-analysis-march-2026.md`. All regulatory and market claims below were verified by web research July 5, 2026 unless explicitly flagged **[UNVERIFIED]** or **[OPEN QUESTION]**. Sources noted inline; confidence flags carried over from research.

---

## 0. The one-paragraph thesis

The NoVA docked-drone security market is **empty** — no provider (Asylon, Flock, Percepto, Sunflower, Nightingale) has a visible deployment here — while the region holds ~35M sq ft of operating data center space, 30M+ sq ft under construction, and a documented organized-crime copper-theft wave (Dec 2025 Loudoun bust, $3M+). The winning play is not "drone security services." It is a **construction-site wedge product with a named enemy (copper theft), priced against a night guard post, that physically converts into a data-center operations annuity when the building commissions** — because the dock never leaves the site, only the customer changes. Waivers are the margin unlock, not the launch gate: revenue starts day one under standard Part 107 night rules; the new §927 fast lane (live April 1, 2026) is the first-mover arbitrage almost no small operator has touched.

---

## 1. Where I push back on the brief (read this first)

A rigor test cuts both ways, so before the frameworks — six places the brief's framing is wrong or hiding an assumption:

1. **"Nighttime ops" is not a waiver.** Settled law since April 2021: anti-collision lighting visible 3 SM + current training. Night patrol — the core of the product — is available on day one. The brief's gate list overstates the gate.
2. **"Incoming parachute system (AP3)" doesn't exist under that name.** No DJI-branded "AP3" for the M400 is verifiable anywhere. What exists: third-party ASTM F3322-24a systems — **AVSS PRS-M400** (M400) and **AVSS PRS-M4S** (Dock 3 / M4D/4TD), plus Flyfire OWL-M400. Ask the dealer what "AP3" refers to. And compliance only attaches when a specific aircraft+parachute combo has an FAA-accepted Means of Compliance and a listed Declaration of Compliance — **[OPEN QUESTION: check the FAA DOC database before advertising any over-people capability.]**
3. **"Persistent" ≠ continuous.** One M4TD flies ~54 min ideal, then recharges. A dock is scheduled patrols plus a <10-second-launch response asset — not a hovering camera. Wind, precipitation, and maintenance windows take a real bite. Every SLA and sales claim must survive this math or the business dies on its first missed incident. (Dock 3 recharge time between sorties: **[UNVERIFIED — get duty-cycle numbers from the dealer before quoting patrol frequency]**.)
4. **Waivers are the gate, but they are not the moat.** Part 108 (final rule late 2026 at the earliest, compliance 6–12+ months later) will eventually commoditize BVLOS. What Part 108 *as drafted* actually does to you is worse: **airworthiness acceptance excludes DJI aircraft entirely**, and "security patrol" isn't an enumerated permit category. The durable moats are integration into the client's security stack, longitudinal site data, contracts, and track record — build those while the waiver window is open.
5. **"Security-as-a-service" may be a regulated phrase in Virginia.** Monitoring premises and dispatching on intrusions plausibly falls under DCJS private security services licensure (Va. Code § 9.1-138 categories include central-station/electronic security and alarm response; at least one VA drone-security vendor holds DCJS #11-6085). **[OPEN QUESTION — counsel, before the website says "security."]** Note the framing arbitrage: "condition monitoring" and "inspection" are not DCJS-regulated. The words choose your regulator.
6. **Northern Virginia is not one market.** The DC FRZ (~13–15 nm of DCA) makes Tysons, Arlington, and Alexandria effectively unserviceable (FAA/TSA waiver per ≤30-day window, compelling-need showing). The outer SFRA ring — **Ashburn, Sterling, Leesburg, Manassas, Chantilly, Herndon, most of Reston** — is flyable today under standard Part 107 + outer-ring conditions (<400 ft, VLOS, registered), with LAANC where IAD Class B or HEF Class D applies. The serviceable map and the data-center map overlap almost perfectly. That's luck; use it.

---

## 2. Hardware-to-service translation (Deliverable 1)

### What the stack actually is, in service terms

| Capability (verified spec) | Service it unlocks | Who else can do it |
|---|---|---|
| M4TD: 640×512 thermal (UHR to 1280×1024), 48MP tele stack, laser RF to 1,800 m, NIR light, IP55, −30/50°C | Night intrusion **detection and verification** at standoff distance — see a human heat signature before any camera line-of-sight | Fixed thermal cameras (no mobility), guards (no thermal, slow) |
| Dock 3: launch <10 s from command, IP56, vehicle-mountable | **Alarm-to-overhead response** measured in tens of seconds vs 5–15 min vehicle patrol; also a *mobile* dock for construction phases | Flock DAS, Asylon — but not present in NoVA |
| FlightHub 2: event-triggered missions, Sync Event webhooks + OpenAPI | **Integration with the client's existing alarm/VMS stack** — the drone becomes an output of their fence sensors, not a parallel system | This is where commodity operators fall off |
| FlightHub 2 On-Premises (released Oct 2025) | Full data sovereignty on the client's servers — the counter to the "Chinese cloud" objection | Nobody selling DJI docks bothers to lead with this |
| M400/H30T: 59 min, 34× zoom/40MP, 1280×1024 thermal, LRF to 3,000 m, 6 kg payload | Piloted layer: initial site survey, incident response, **engineering-grade thermal inspection**, demos, FRZ-tier special ops | Inspection firms have the sensor, none run docks; security firms run docks, none produce inspection-grade deliverables |
| ASTM F3322 parachute (AVSS) | Over-people compliance path (Cat 2/3) for populated sites; risk-mitigation evidence in every waiver filing | Table stakes for waivers; differentiating in sales to risk officers |

### Defensible vs commoditizing — the honest split

**Commoditizing fast:** the aircraft, the dock, "we fly drones at night," raw video feeds, per-flight pricing. Flock's entire pitch is turnkey drone-as-security "at roughly the cost of a single guard" — if you compete at the hardware layer you are competing with their balance sheet.

**Defensible:** (a) regulatory assets — site-specific BVLOS approvals, SFRA/LAANC fluency, a DCJS posture competitors haven't thought about; (b) **integration depth** — webhook-level hookup to the client's alarm panel is a switching cost no trailer-camera vendor imposes; (c) **the dual-use deliverable** — a security vendor that also produces NFPA 70B-aligned thermal condition-of-record reports is a different procurement category; (d) local ops density — a maintenance visit in Ashburn costs you a 20-minute drive and costs Asylon a Philadelphia truck roll; (e) longitudinal site data — every month of patrol thermal baselines makes the incumbent harder to displace.

**The uncomfortable one:** DJI itself. On the FCC Covered List since Dec 22, 2025 (all foreign-made UAS). Pre-listing models (Dock 3, M4TD, M400) remain legal to buy and fly; new models are frozen out; CBP detains shipments under UFLPA; DJI's suit against the FCC (filed Feb 24, 2026) is unresolved; Part 108 as drafted excludes DJI. **Verdict: DJI is a strategic bet with superior current economics and a datable expiry risk — see the barbell in §8.**

---

## 3. Segments and decision-makers (Deliverable 2)

Ranked. The ranking logic: *speed to first dollar × pain acuity × airspace feasibility × conversion into recurring revenue.*

### Tier 1 — Data-center construction sites (the wedge)
- **Market:** 30M+ sq ft under development across Loudoun (~5M) and Prince William (~26.8M incl. PW Digital Gateway). GCs: **HITT, DPR, Holder, Turner, Whiting-Turner, Hensel Phelps, Clune, Mortenson.**
- **Problem:** copper/cable/equipment theft at night — organized, local, documented ($3M+ Loudoun ring, Dec 2025; CargoNet: thieves now targeting data-center supply chains, avg theft value $274K, +36%). Current answer: night guards ($130–175K/yr per 12-h post) + camera trailers ($1.5–3K/mo) that record theft but don't verify or respond.
- **Buyer:** GC project executive / site superintendent, with corporate security or risk director as approver. Budget lives in **General Conditions** — a line the PX controls, re-bid per project. Success for them: no schedule-slip from theft, insurable evidence when it happens, lower GC cost than guard posts.
- **Why this stack specifically:** sites are large, dark, fenced, uninhabited at night (Cat 3 parachute logic fits), temporary (vehicle-mountable Dock 3 fits), and in the flyable outer ring.
- **Why first:** sales cycle is weeks; a 30-day pilot is a PO, not a procurement committee; every project ends → forced renewal conversations and portable references across the GC's other sites.

### Tier 2 — Data-center operations (the annuity)
- **Problem:** perimeter scale (100+ acre campuses), guard turnover (100–300% industry annual), NFPA 70B thermal-inspection mandate, camera blind spots. Buyer: director of physical security / facilities; budget: security opex + facilities maintenance.
- **The trap to respect:** hyperscalers and operators with federal tenants will run hardware-provenance reviews — DJI is a live objection even in "commercial" deals. **Target sequence: start with regional colo/wholesale operators and GC-referred new commissions, not AWS.** FlightHub 2 On-Premises + your CISSP/AIGP governance story is the objection-handling package; it will win some and lose some. Losing an NDAA-sensitive account is information, not failure — route it to the future NDAA fleet (§8).
- **Why they're second, not first:** 6–12 month cycles, security reviews, and they'll want references — which Tier 1 manufactures.

### Tier 3 — Logistics and distribution yards (Dulles/I-66/Route 28 corridor)
- Cargo theft losses ~$725M nationally, +60% YoY. Buyer: regional loss-prevention/security manager; budget: LP (shrink) line. Service: nightly trailer-yard sweeps, seal/door checks, gate-event verification. Good white-label territory (see §7 channel note) — mid-market, high site count, less brand-sensitive.

### Tier 4 — Private utilities and co-ops (NOVEC, Rappahannock EC, Dominion — investor-owned, commercial)
- Substation copper theft (~$920M/yr industry losses; E-ISAC: 3,500+ physical incidents/yr, ~10× a decade ago). CIP-014-scoped transmission assets have compliance budget. Sticky, credible, slow procurement; also politically valuable references. Pursue opportunistically via the copper narrative; don't build the launch plan on them.

### Skip (and why)
- **Tysons/Arlington/Alexandria enterprise campuses:** FRZ. Revisit as a premium tier only if a client will co-sponsor FAA/TSA waivers (§6, Phase 3).
- **Residential/HOA:** Va. Code §18.2-121.3 (50-ft dwelling rule) and §18.2-130.1 (UAS peeping, Class 1 misdemeanor) make patrol geometry a liability minefield for low ticket sizes. Sunflower's dealer channel owns this anyway.
- **Anything government-adjacent:** off-table by definition here, and DJI forecloses it regardless.

---

## 4. Service design and pricing (Deliverable 3)

### What you are selling
An **aerial post**: coverage + verification + evidence, delivered as a subscription. Never flight hours (commodity unit), never hardware (Flock/Asylon own that game and it caps you at a reseller margin), never "drone services" (a category buyers price-shop).

### Client journey
1. **Aerial Site Assessment** (M400/H30T, 1–2 weeks, $3.5–7.5K one-time): survey, thermal baseline, patrol-route design, airspace package (UASFM grid check, LAANC/SFRA posture), integration audit of their alarm/VMS. *This is also the inspection-business Trojan horse and a standalone profitable product.*
2. **Deployment** (2–4 weeks): dock install (client provides pad, power, network — keep this their scope; it accelerates timelines and signals partnership), mission library, webhook integration, geofence with 50-ft dwelling buffers, comms test.
3. **Live operations:** scheduled night patrols + (post-waiver) alarm-triggered response; every event produces an **evidence pack** (timestamped thermal + visual, flight log, chain-of-custody note — the insurable artifact).
4. **Monthly intelligence report:** patrol stats, incidents, false-alarm analysis, *and* a thermal condition summary — the page that quietly sells the inspection upgrade.

### Tiers

| Tier | Monthly (target) | What's in it | Ops model |
|---|---|---|---|
| **Watch** (launch product = "Copper Watch") | $3.5–5.5K/site | N scheduled night thermal patrols, morning anomaly report, evidence packs, monthly report | Pre-waiver: on-site RPIC "milk-run" (below) |
| **Response** | $7–10K/site | Watch + alarm-integrated launch, live feed to client/monitoring center, response-time *target* | Requires BVLOS/remote-ops waiver; the margin inflection |
| **Guard** | $12–15K/site | Response + quarterly engineering thermal inspection (NFPA 70B-aligned), security-posture review, annual term | The dual-P&L dock; competes with Asylon's $95–130K/yr list from below |

**Pre-waiver economics that actually work (the milk-run):** VLOS requires the pilot near the aircraft — so cluster sites. One night operator covering 4 Ashburn/PW sites (25-min patrol + drive) generates $14–22K/mo revenue against ~$6–7K/mo loaded labor. Ashburn's density is what makes the pre-waiver phase profitable rather than a loss-leader; this is a real advantage over any operator without geographic concentration.

**Unit economics sketch [assumption-flagged]:** dock + M4TD bundle ≈ $25.7K list (verified; currently sold out at one major dealer — order early, buy spares), + parachute + install + comms ≈ $35–40K per site. At Watch pricing, hardware payback <12 months; at Guard, <4. True COGS is monitoring labor, maintenance, insurance, connectivity — pre-waiver labor-heavy, post-waiver approaching 1 remote operator : N docks (precedents: Sunflower 1:6, Skydio 1:4).

### Pricing anchors and SLA honesty
- Anchor high: 24/7 NoVA guard post ≈ **$260–350K/yr**; night post ≈ $130–175K/yr. Price the aerial post at **30–50% of the displaced labor**, never cost-plus.
- Defend the floor: camera trailers ($1.5–3K/mo) *record* theft; you *verify and respond with thermal and produce evidence packs*. Different sentence, different budget conversation.
- Per standing doctrine, **targets not absolutes**: "launch-to-overhead target under 2 minutes within the patrol envelope, weather permitting." Publish the weather-hold policy, duty cycle, and maintenance windows in the proposal. In a market full of drone hype, an operator who hands the buyer the limitations table is the one the risk-averse buyer trusts — honesty is the premium positioning, and it's already Jinki's doctrine.
- **Exclusions in writing:** no pursuit beyond property line, no interdiction (observe/verify/dispatch humans), no imaging of adjacent dwellings (geofenced), retention limits. These protect you legally *and* read as professionalism.

---

## 5. Waivers as competitive advantage (Deliverable 4)

| Phase | Regulatory posture | Business unlock | Timing |
|---|---|---|---|
| **0 — Launch (day 1)** | Standard Part 107: night ops (lighting + training), VLOS, SFRA outer-ring conditions, LAANC where IAD Class B / HEF Class D applies. **Check UASFM grids site-by-site — some IAD approach-corridor grids are 0 ft; airspace screens the target list before sales does.** | Copper Watch revenue with zero waivers. | Now |
| **1 — Shielded BVLOS (file days 30–60)** | Percepto (2023, nationwide shielded, 200 ft envelope) and **Asylon (2024, docked security patrol, no on-site personnel, remote SOC as PIC)** are the citable templates. File via **§927 fast lane (live Apr 1, 2026: email application, no public comment, no public-interest showing)** and/or 107.31 waiver, citing precedent waiver numbers. Expect 60–120+ days; plan for 6 months. Your existing BVLOS skill assets (M400/H30T CONOPS, SORA risk assessment, DAA plan, emergency procedures) are most of the package already drafted. | Removes on-site RPIC → the margin inflection; unlocks the Response tier; **co-file around the anchor client's named site so the approval is an asset they can't take to a competitor.** | Months 2–8 |
| **2 — Scale ops** | Expand waiver to multi-site/area; push operator:dock ratio toward precedent (1:4–1:6). | Remote ops center economics; each new dock is mostly gross margin. | Months 9–18 |
| **3 — FRZ tier (optional, premium)** | FAA/TSA FRZ waivers: ≥15 working days review, ≤30-day windows, compelling-need + sponsor letters. Recurring patrol in the FRZ is likely impractical today — frame as client-co-sponsored special operations (post-incident surveys, executive events), priced accordingly. | Tysons-corridor optionality; mostly a talking point until rules change. | Opportunistic |
| **Part 108 horizon** | Final rule late 2026 earliest; security patrol not an enumerated permit category (closest: "aerial surveying" — unresolved); **DJI excluded as drafted**; ADSPs (Part 146) mandatory at higher population densities. | Don't build the moat out of waivers. When 108 lands, everyone gets BVLOS eventually — your integration depth, contracts, site data, and safety record are what remain scarce. Also: 108 is the forcing function on the fleet decision (§8). | Watch; comment; hedge |

**The move competitors will miss:** publish the safety case. Put the CONOPS summary, limitation tables, and waiver methodology on the site the way the insurance collateral publishes methodology. To a data-center risk officer, a vendor with a public safety case reads like an engineering firm; every competitor reads like a gadget company. It costs nothing — the honesty doctrine is already the brand.

---

## 6. 90-day operational roadmap (Deliverable 5)

**Weeks 1–2 — Legal/financial spine.** Entity + aviation liability ($1–5M UAS-specialty; GCs will demand COIs, often $5M umbrella via layers). **DCJS counsel question resolved** (or bypassed via guard-firm partnership — §7). Order Dock 3 + M4TD bundle **now with lead-time confirmation and critical spares** (verified supply constraint: flagship dealer bundle sold out; CBP detentions ongoing). Verify the parachute DOC listing with AVSS. Clarify what "AP3" actually is with the dealer.

**Weeks 2–4 — Ops spine.** Airspace playbook per target site (UASFM grids, LAANC accounts, SFRA outer-ring ops doc). SOPs/ops manual — written once, used three times: waiver evidence, insurance underwriting, sales collateral. Mission libraries + evidence-pack template. Night-flight shakedown at a partner/leased site. Integration proof-of-concept: FlightHub Sync Event webhook → a commodity alarm panel, recorded as a demo video.

**Weeks 4–8 — Copper Watch launch.** Named-20 list of active construction sites (Loudoun + PW, screened by airspace grid first). Outreach: GC project execs + corporate security directors (templates in §9). Offer: **30-day paid pilot, $3–4K, defined success metrics (patrols completed %, anomalies documented, one live alarm drill), pre-agreed conversion pricing.** Parallel tracks: two white-label conversations with regional guard/monitoring firms; two insurance-broker conversations (existing lane) about patrol logs as underwriting evidence.

**Weeks 8–12 — First revenue + waiver filing.** 1–2 pilots live; §927 shielded-BVLOS package filed around the anchor site; safety-case page published; first evidence packs delivered; pilot→term conversion negotiated (6–12 months, priced per §4).

**Cash to launch [assumption]:** ~$60–100K (hardware + spares, insurance, legal/DCJS, consultant hours, comms). If that number is uncomfortable, the Aerial Site Assessment product (§4, step 1) is a self-funding on-ramp — sell three of those in weeks 4–8 using the M400 you already have, no dock capex, and let assessment revenue pull dock deployments.

---

## 7. 180-day scaling logic (Deliverable 6)

**Scale signals (any three → press):**
- ≥3 paying sites / ≥$25–30K MRR with ≥60% pilot→term conversion
- FAA substantive engagement on the §927/BVLOS filing (not silence)
- First **construction→operations novation conversation** happening at a commissioning site — the single most important signal, because it proves the escalator (§8, Move 1) and the LTV story
- A signed white-label with a regional guard firm, or an insurance-broker-sourced lead
- Clients granting alarm/VMS integration access (switching cost = they consider you infrastructure)

**Pivot signals and the pre-decided responses:**
- *Pilots stall in GC procurement* → shift weight to the guard-firm channel (they already hold the vendor relationships and DCJS coverage; you become their air layer)
- *Waiver stuck >9 months* → stay in milk-run mode; Ashburn density keeps it profitable; revisit ratios when 108 lands
- *DJI supply breaks or FCC litigation goes badly* → trigger the fleet hedge (§8, Move 7) — this is a pre-funded decision, not a scramble
- *Buyers keep converting the security pitch into inspection contracts* → that's not failure, that's the market voting for the existing Jinki positioning; fold security back in as the add-on and keep the dock utilization thesis
- **Defensible-vs-commodity test:** renewal intent at unchanged price, inbound referrals, and integration depth. If growth only comes from underpricing camera trailers, you've built a commodity — stop and re-segment.

**Hiring order:** night ops technician/RPIC (first hire, unlocks founder time), then remote operations lead (post-waiver), then sales only after the founder has personally closed 5+ deals and can write the playbook. Partnerships before headcount: guard-firm central stations replace a 24/7 SOC build entirely in year one.

---

## 8. The seven strategic moves (the innovation layer, consolidated)

1. **Land on dirt, stay on concrete.** Wedge at construction (fast sale, acute pain, temporary commitment); when the building commissions, the dock stays and the contract novates GC→operator. The physical asset is the land-and-expand motion. Write the novation option into the GC contract from day one ("transferable service agreement") — that clause is the whole growth model in one sentence, and nobody in this market runs the play.
2. **One dock, two P&Ls.** Security patrols by night, engineering-grade thermal inspection by day. Asylon/Flock can't produce condition-of-record thermal intelligence; Zeitview/Cyberhawk don't do security. Dual utilization ≈ doubles revenue per dock and is the structural anti-commoditization answer — plus it's the bridge to everything Jinki has already built (instrument methodology, insurance collateral, NFPA 70B narrative).
3. **Sell to guard companies, not only around them.** Titan Protection (KC) proved a regional guard firm can run docked drones at claimed 60% cost savings. Regional firms are bleeding at 100–300% turnover. White-label the "aerial post" to 2–3 of them: they keep the client and the DCJS license; you run the air layer. One move solves distribution, night-monitoring labor, and possibly licensure. **Manage the channel conflict deliberately:** Jinki-direct owns data-center construction/ops; partners get logistics and mid-market commercial.
4. **Waivers as product, §927 as arbitrage.** File early through the three-month-old fast lane on Percepto/Asylon precedent, co-filed around the anchor client's site; publish the safety case as marketing. Waiver portfolio = 12–24 months of margin advantage, consciously spent building the durable moats (integration, data, contracts) before Part 108 equalizes BVLOS.
5. **Copper Watch.** A named product against a named, datable, local crime wave — not "drone security services." $4–6K/mo against $13–15K/mo night-guard posts and $3K/mo trailers that don't verify or respond. PR-able (local news covered the bust), cold-email-able, and category-proof.
6. **Insurance-anchored economics.** Patrol logs + thermal baselines as underwriting evidence; brokers (the existing Jinki P&C lane) as referral channel; aspiration: the service partially offsets the client's premium, moving the budget conversation out of the security line entirely. **[OPEN QUESTION: carrier appetite for premium credit — test with the two broker conversations in weeks 4–8.]**
7. **The DJI barbell.** Run DJI's superior price-performance now; the client never owns hardware, so a future fleet swap is invisible to them. Stockpile spares at today's prices. Pre-fund the NDAA-compliant option (Skydio X10/dock class) and pre-define the triggers: Part 108 final text confirming DJI exclusion, DJI-v-FCC ruling, or the first lost deal on provenance. A strategic bet with a hedging schedule beats both blind confidence and premature (2–3× more expensive) NDAA purity.

---

## 9. GTM specifics — top two segments (Deliverable 7)

### Segment A: Data-center construction GCs

**Core message:** *"Organized crews took $3M in copper out of Loudoun sites last year. Your camera trailer records it; your night guard covers one gate. We put a thermal aircraft over the whole site, every night, for a third of the cost of the guard post — and when something moves, you get evidence your insurer accepts."*

**Channel:** direct to project executives + corporate security/risk directors, and **site-gate walk-ins with a one-pager and a hard hat** — construction buys from people who show up. Reinforce via ASIS National Capital Chapter, ABC/AGC Virginia events, and the GC's insurance broker (builder's risk carriers care about theft).

**Cold email (PX / security director):**
> Subject: The Loudoun copper ring hit sites like [project name]
>
> [Name] — the ring LCSO broke up in December pulled $3M+ in copper out of Loudoun facilities, and CargoNet says data-center materials are now a preferred target. Camera trailers record the theft; night guards cover a gate.
>
> We run automated thermal aerial patrols over the entire site, every night, from a dock that lives on your laydown yard — with evidence packs your builder's-risk carrier will actually accept. Typically a third of the cost of a night guard post.
>
> We're Ashburn-based and FAA Part 107 night-certified. Worth a 20-minute look at [project]? I'll bring the thermal footage from a comparable site.

**Phone intro (15 s):** "We put a thermal aircraft over your whole site every night for about a third of a night guard post — I'm local, and I'd like to show you what your site looks like at 2 a.m. in thermal. Twenty minutes on-site this week?"

**Warm paths:** Deloitte alumni in GC risk/audit orgs; ISC2/ISACA NoVA chapters into corporate security directors; the broker channel from the insurance collateral work.

### Segment B: Data-center operations (regional colo/wholesale first)

**Core message:** *"Your guard force turns over 100–300% a year and your perimeter has grown faster than your camera plan. We add an aerial post that verifies every alarm in under two minutes (target) — and the same aircraft delivers your NFPA 70B thermal inspections. One subscription, two line items solved."*

**Channel:** 7x24 Exchange DC chapter, iMasons, AFCOM, ASIS — plus **the GC handoff** (the novation play makes the GC your channel into the operator). Lead with the Aerial Site Assessment (low-commitment, self-funding, produces the thermal report that sells both services).

**Objection you will always get:** DJI provenance. Response posture: FlightHub 2 On-Premises deployment, local data mode, documented data flows, your CISSP/AIGP credentials, and a straight answer about the covered list (existing authorizations valid; service model means the fleet can change without the client noticing). Win the winnable; route the NDAA-hard ones to the hedge timeline.

---

## 10. Strategic guardrails (Deliverable 8)

- **Metrics from day one** (these are the product): launch-to-overhead distribution, patrol completion %, detection precision / false-alert rate, uptime, weather-hold %, evidence-pack turnaround, cost per covered hour vs guard-hour. Report them to clients monthly. An operator who publishes his misses owns the trust position in a hype-saturated category.
- **Positioning discipline:** force-multiplier framing everywhere ("your guards stop chasing false alarms"), never "replace your guards" — both because it's truer and because Move 3 makes guard firms your channel.
- **Anti-commoditization rules:** never quote per flight hour; no one-off gigs (assessments are the only à-la-carte product); minimum terms; publish methodology, not price sheets.
- **Data governance as differentiation:** client owns site data; defined retention; geofenced 50-ft dwelling buffers (Va. §18.2-121.3); camera-angle policy per §18.2-130.1; desist-notice register; FlightHub On-Premises for sensitive clients; SOC 2 on the roadmap, not the critical path. This is where the CISSP/AIGP resume is a moat no drone operator can copy quickly.
- **IP that matters:** ops playbooks, waiver portfolio, integration configs, longitudinal thermal/patrol datasets. Protect via contract (data ownership clauses) more than patent.
- **The one-person reality check [assumption to confront]:** the milk-run phase means someone flies at night. If that's the founder for 90 days, fine — but the first hire is budgeted before pilot #3, or the business quietly becomes a job.

---

## 11. Open questions register

1. **DCJS licensure** — does aerial monitoring/dispatch require a Private Security Services Business License? (Counsel; also decides the website's vocabulary.)
2. **"AP3"** — what product is actually meant? Verify the aircraft+parachute DOC listing on the FAA database before any over-people claim.
3. **Dock 3 duty cycle** — recharge time between sorties → real patrols-per-night math → SLA language.
4. **Ashburn UASFM grid ceilings** — site-by-site; screens the named-20 list.
5. **DJI supply** — current Dock 3/M4TD lead times and spares availability from distributors (verified constrained; get quotes in writing).
6. **Carrier appetite** — will any builder's-risk or property carrier credit documented aerial patrol? (Broker conversations, weeks 4–8.)
7. **Hyperscaler overflight policy** — do AWS/MSFT/Google construction sites contractually restrict DJI overflight? Ask the GC in the first pilot; it shapes the Tier 2 sequence.
8. **Part 108 final text** — category fit for security patrol + the DJI exclusion; comment-period positions suggest changes are possible but not assured.
9. **Brand architecture** — "Jinki Aerial Guard" as a product line vs separate brand; current site is inspection-led. (Recommendation: one brand, two products — the dual-P&L dock argument collapses if the brands are split.)

---

## Appendix: Source basis

Regulatory brief (July 5, 2026 research): Federal Register (Part 108 NPRM Aug 2025, comment reopenings, §927 implementation Apr 1 2026); FAA DC No Drone Zone / 14 CFR Part 93 Subpart V; FCC DA-25-1086 (Dec 22, 2025 covered-list action) + Wiley/Akin/Holland & Knight analyses; Percepto and Asylon waiver announcements; FAA 2021 OOP/night final rule; ASTM F3322-24a; Va. Code §§ 15.2-926.3, 18.2-121.3, 18.2-130.1, 9.1-138; DCJS licensing pages; DroneXL/DroneLife/DroneDJ/AIN trade reporting through June 2026.

Market brief (July 5, 2026 research): DJI enterprise spec pages (Dock 3, M4 series, M400, H30); DSLRPros/Vertex/Global Drone HQ pricing; AVSS/Flyfire parachute announcements; Asylon OMNIA list pricing (2022, treat as floor); Flock Safety DAS launch (Sept 2025); Sunflower Series B + nationwide BVLOS (Nov 2025); Skydio Series F (Apr 2026); DC DOES security wage determination 2025–26; ASIS/BLS guard turnover data; Loudoun County/WTOP/InsideNoVa copper-ring coverage (Dec 2025); Verisk CargoNet 2025 annual analysis (Jan 2026); Prince William Times / DCD / loudoun.gov pipeline figures; FlytBase Titan Protection case study (vendor-published — treat claims accordingly).

*Nothing in this document is a fabricated case study, client, or testimonial. Vendor-published outcome claims (Titan, Asylon) are labeled as such.*
