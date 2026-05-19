---
id: 2026-05-21-decision-defaults-and-owner-matrix
title: "Thursday Decision Defaults And Owner Matrix"
date: 2026-05-21
topic: ai-triage
type: handoff
status: draft
source:
  - ./2026-05-21-huicheng-engineering-sync-prep.md
  - ./2026-05-21-imvs-nycu-api-design-v0.1.md
  - ../source/2026-05-19-expert-review-scope-api-boundary/source.md
---

# Thursday Decision Defaults And Owner Matrix

## Purpose

Use this as the meeting control sheet for the `2026-05-21 10:00` 慧誠 / Johnny
/ engineering / 多寶 sync.

The meeting should end with explicit decisions, owners, due dates, and fallback
rules. Do not leave with only "we will think about it."

## Recommended Default Decisions

Bring these as NYCU's recommended defaults. They can be changed only if 慧誠
engineering or 多寶 gives a concrete reason.

| Decision | Recommended default | Why | If not accepted |
| --- | --- | --- | --- |
| `session_key` ownership | NYCU generates `session_key`; iMVS echoes it back. | Keeps dynamic question state in one place for June demo. | 慧誠 must provide their encounter/session id format and retry semantics. |
| Question timing | Prefer two-phase flow: Phase 1 pre-vital intake during measurement, Phase 2 vital-aware follow-up after values arrive. | Uses measurement waiting time and keeps vital-dependent questions honest. | Use post-measurement-only flow if answering questions disrupts measurement quality or UI cannot support it. |
| Output field name | Use `staff_review_summary`. Do not use `diagnosis`. | Prevents downstream UI and customer wording from implying diagnosis. | At minimum use `review_basis`; never label it final diagnosis. |
| Summary action field | Use `review_action` and `staff_handoff_note`; do not use `plan_support`. | Expert review flagged SOAP `Plan` wording as too close to medical action. | Use only generic staff-review note until 多寶 approves wording. |
| Summary visibility | Set `summary_visibility: "staff_only"`. | Prevents patient-facing interpretation as a clinical result. | If 慧誠 needs patient display, create separate patient-safe copy after clinical review. |
| Handoff flags | Include `handoff_required` and stable `handoff_reason_codes`. | Makes the respiratory case an explicit staff-review handoff rather than hidden triage advice. | If not implemented, keep respiratory case as static demo only. |
| Voice input | Out of June critical path. Optional stretch only. | Voice adds ASR latency, audio privacy, transcript error, and noisy-room failover risk. | Require transcript confirmation, retry/fallback, and no raw-audio retention. |
| HIS / EMR / FHIR writeback | Future-state only; not implemented in June demo. | Johnny's email already says grey-text HIS return flow is not implemented for this demo. | Show a doctor-view page only; no live writeback. |
| First case | `fever + dyspnea + low SpO2`, ending in early staff-review handoff after about four questions. | Best first demonstration that measured vitals affect follow-up without pretending to finish autonomous triage. | 多寶 chooses one alternative case and defines stop rule before engineering starts. |
| Case count | One full loop first, then expand to `3-5` cases. | One complete case is safer than several incomplete flows. | Extra cases stay fixtures only until one loop is integrated. |
| Evidence refs | Use `LOCAL-PROTOCOL-TBD` for unresolved source mapping. | Honest boundary; avoids claiming BMJ / NICE / UpToDate support without mapped text. | Only cite named sources when exact source text and question mapping are reviewed. |
| Patient identity | Use `demo_patient_id`; no real name, MRN, ID, phone, or raw audio. | Keeps demo local-safe and non-clinical. | If real identifiers are requested, stop and create separate governance path. |
| API versioning | Include `api_version`, `schema_version`, `flow_version`, and `case_id`. | Prevents small field changes from silently breaking integration. | If 慧誠 wants fewer fields, keep at least `api_version` and `schema_version`. |
| Clinical content versioning | Include `case_version`, `fixture_version`, `question_set_version`, and `wording_version`. | Case content, question wording, and staff-summary wording can change clinical meaning. | Keep API v0.2 as draft and do not call it frozen. |
| Failure fallback | If API fails, show fallback; do not fabricate summary. | Avoids unsafe implied clinical output. | Define 慧誠-owned fallback UI before any live demo. |
| Done definition | One synthetic case completes vital payload -> Q&A -> summary with no forbidden claim. | Makes first milestone testable. | Meeting must name a different measurable done definition. |

## Thursday Must-Close Questions

These are the questions that must have owners by the end of the call.

### Product / Johnny

- What exact date is the customer demo?
- Is the demo expected to prove UI, API integration, or clinical workflow?
- Is an API markdown document enough, or do they need OpenAPI / mock endpoint /
  sequence diagram?
- What date does engineering need API design v0.2?
- Who is the single engineering point of contact?
- What wording should be used externally: `AI triage` or safer
  `vital-aware intake support` / `synthetic-data workflow demo`?

### Engineering / 慧誠

- What are the real iMVS vital field names and units?
- Which fields are guaranteed vs optional?
- Where is the AI step inserted in the iMVS flow?
- Can Phase 1 questions be displayed while measurement is running?
- Can iMVS send a vitals-ready event or call
  `POST /api/triage-demo/sessions/{session_key}/vitals` after measurement?
- Can the demo call an external HTTPS endpoint or laptop API?
- Is local mock fallback acceptable?
- Should iMVS or NYCU own session state?
- Can iMVS render `single_choice`, `multi_choice`, `scale`, progress, and
  mutually exclusive "none of these" behavior?
- Can 慧誠 freeze `measurement_timestamp`, `device_id`, `measurement_status`,
  `quality_flag`, and `missing_reason` semantics for v0.2?
- Can each vital carry its own `measurement_status`, `quality_flag`, and
  `missing_reason`, or is June limited to session-level quality?

### Clinical / 多寶

- Is the respiratory case the right first case?
- Which kiosk questions are safe?
- Which answers or vital patterns should stop the flow and require staff review?
- What exact wording can appear in `staff_review_summary`?
- What wording must never appear?

## Meeting Closeout Matrix

Fill this table before the call ends.

| Owner | Deliverable | Due | Acceptance check | If missing |
| --- | --- | --- | --- | --- |
| 慧誠 engineering | iMVS synthetic vital payload example and field dictionary. | `2026-05-22` proposed | Includes field names, units, required/optional, missing-value representation. | NYCU uses current synthetic field names and marks integration as mock-only. |
| 慧誠 engineering | Required/optional field rule plus missing/failure representation. | `2026-05-22` proposed | Defines `measurement_status`, `quality_flag`, and `missing_reason` for each vital or for the payload. | NYCU uses generic quality flags only; adapter remains provisional. |
| 慧誠 engineering / UI | Two-phase UI feasibility decision. | `2026-05-22` proposed | Confirms whether Phase 1 questions can appear during measurement without disrupting posture/signal quality. | Use post-measurement-only flow. |
| 慧誠 engineering | UI insertion decision. | `2026-05-22` proposed | Names same-app / iframe / external link / backend API / demo-only handoff. | Use separate NYCU demo page; no claim of iMVS integration. |
| 慧誠 engineering | Demo environment constraints. | `2026-05-22` proposed | Confirms internet, external HTTPS, CORS/firewall/VPN, local fallback. | Build local static/mock flow only. |
| Johnny | Demo date and expected audience story. | `2026-05-21` call | Names customer-demo date and whether it is UI/API/workflow proof. | Keep scope to API skeleton and one synthetic case. |
| Johnny | Engineering point of contact. | `2026-05-21` call | Names one owner and follow-up channel. | Send questions through Johnny only; slower cadence. |
| Jason / NYCU | API design v0.2. | `2026-05-22` proposed | Updated with confirmed field names, session ownership, question enum, error behavior. | Keep v0.1 as discussion draft; do not implement adapter. |
| Jason / NYCU | API question mapping and respiratory flow registry. | `2026-05-22` proposed | Runtime question IDs map to registry/source/review rows and `FLOW-RESPIRATORY-EARLY-HANDOFF` is registered. | Do not call API v0.2 frozen. |
| Jason / NYCU | Mock adapter / static integration rehearsal plan. | `2026-05-25` proposed | One respiratory case can run through request/answer/summary examples. | Do not expand to more cases. |
| 多寶 | Respiratory case approval. | `2026-05-22` proposed | Confirms `fever + dyspnea + low SpO2` is acceptable as the first early-handoff case. | Use only static API example; no live clinical-looking flow. |
| 多寶 | Stop rule, forbidden wording, and safe summary wording. | `2026-05-22` proposed | Approves safe summary wording and flags forbidden phrasing. | Use only generic staff-review wording; no vital interpretation beyond measured values. |
| 多寶 | Case expansion priority. | `2026-05-22` proposed | Chooses second case: abdominal pain + fever, tachycardia/chest tightness, or URI contrast. | Keep only respiratory case in engineering path. |
| Privacy/security owner | Demo data and endpoint boundary. | `2026-05-22` proposed | Confirms no real identifiers, no raw audio, no production endpoint, and acceptable log/screenshot handling. | Keep demo offline/static; do not connect to iMVS runtime. |

## Risks Not Yet Discussed Enough

### 1. Version Drift

Problem: 慧誠 and NYCU may update payload fields independently.

Decision to propose:

```json
{
  "api_version": "2026-05-22-demo-v0.2-draft",
  "schema_version": "imvs-nycu-triage-demo-schema-v0.2-draft",
  "flow_version": "respiratory-early-handoff-flow-v0.2-draft",
  "case_id": "demo-respiratory-low-spo2-001"
}
```

### 2. Unit Ambiguity

Problem: clinical meaning changes if units are assumed.

Meeting rule:

- temperature must say Celsius/Fahrenheit;
- glucose must say mg/dL or mmol/L;
- BP should be split systolic / diastolic;
- SpO2 is percent;
- height/weight must say cm/kg or inch/lb.

### 3. Over-strong Summary Wording

Problem: customer may read summary as diagnosis.

Safe wording:

```text
Synthetic demo case. Patient reports shortness of breath. Measured vitals include fever, increased respiratory rate, and lower oxygen saturation than expected for this demo scenario. Staff should review the respiratory complaint and measured vitals. This demo does not diagnose, assign final triage level, recommend treatment, or write to HIS/EMR.
```

Unsafe wording:

```text
Likely pneumonia.
ESI level 2.
Needs emergency treatment.
Safe to go home.
```

### 4. Voice Becomes A Trap

Problem: voice looks impressive but may dominate meeting scope.

Decision:

- main flow is touch / choice;
- voice is optional after API contract is frozen;
- if voice appears, it must require transcript confirmation and no raw-audio
  retention.

### 5. "Evidence Mapping" Overclaim

Problem: spec names BMJ, UpToDate, NICE, Merck, but source mapping is not done.

Decision:

- `evidence_refs` can exist now;
- unresolved refs use `LOCAL-PROTOCOL-TBD`;
- exact evidence mapping is a post-demo validation gate.

### 6. No Safe Fallback

Problem: API failure could produce a misleading blank or fake result.

Decision:

```text
If AI service is unavailable, continue standard staff workflow.
No AI-generated clinical summary was produced.
```

### 7. Real-Data Temptation

Problem: once engineers connect iMVS, real identifiers may slip into payloads.

Decision:

- demo sends only `demo_patient_id`;
- no real name, MRN, national ID, phone, address, raw audio, or chart content;
- any real-data request creates a separate governance path.

### 8. Cybersecurity / Demo Threat Boundary

Problem: once a kiosk browser, external API, token, and logs are involved,
demo-level security choices affect what can safely be shown.

Decision:

- use HTTPS or a local static mock only;
- do not place production tokens in the client;
- do not log identifiers, raw audio, or free-text clinical notes;
- decide whether the demo path is external API, laptop API, local network, or
  static mock before implementation.

## Suggested Closing Script

Read this at the end:

```text
Before we close, I want to confirm owners and dates.

For June, the first milestone is one synthetic vital-aware structured intake loop:
iMVS sends a synthetic vital payload, NYCU returns structured questions with a
session key, iMVS returns answers, and NYCU returns a staff_review_summary for
staff or clinician review.

慧誠 will provide payload fields, UI insertion point, environment constraints, and engineering owner.
NYCU will provide API v0.2 with sample JSON and error behavior.
多寶 will review the first respiratory case stop rule and safe summary wording.
The privacy/security owner will confirm no real identifiers, no raw audio, and no production endpoint.

Voice input and HIS/FHIR writeback are outside the critical path unless we create a separate approved decision.
The output is staff_review_summary, not diagnosis or final triage decision.
```
