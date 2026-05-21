---
id: 2026-05-20-duobao-demo-design-consistency-review
title: "Duobao Demo Design Consistency Review"
date: 2026-05-20
topic: ai-triage
type: design-review
status: active
source:
  - ../source/2026-05-20-duobao-demo-cases-question-design/source.md
  - ../handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md
  - ./2026-05-19-two-phase-question-flow-design.md
  - ../handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ./demo-acceptance-criteria.md
  - ../decisions/2026-05-20-june-demo-question-budget.md
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
---

# Duobao Demo Design Consistency Review

## Review Verdict

多寶's `2026-05-20` case and question-design drafts are useful and should be
kept as the clinical-design inventory for future case expansion. They should not
be imported directly into runtime or company-facing handoff wording without
normalization.

The current repo's safest direction remains:

```text
synthetic-data vital-aware intake
-> short choice-based question loop
-> staff_review_summary
-> human review
```

not:

```text
patient name + all-specialty questionnaire
-> potential triage level
-> suggested acuity / disposition / department / immediate action
```

Post-`2026-05-21` sync note: use `post_measurement_only` as the June integration
default. The two-phase model below remains useful as a future optimized design,
but the next imedtac rehearsal should first align runtime / API examples to
measurement complete -> vital payload -> question loop -> staff summary.

Post-Duobao internal sync note: this review should be read even more
conservatively. 多寶's key warning is that collecting facts and generating a
staff-readable summary is acceptable for the demo, while asking AI to return a
formal triage level is the risky boundary. The practical AI placement is
question selection plus summary organization, not a final five-level result.

## What Aligns Well

| 多寶 draft element | Repo alignment |
| --- | --- |
| Four demo scenarios: abdominal pain/fever, palpitation/chest tightness, dyspnea/low SpO2, URI contrast. | Matches the existing `3-5` synthetic urgent-care demo plan and the earlier 多寶 case anchors. |
| Choice-first symptom questions. | Matches the current runtime's no-free-text / no-ASR v0 boundary. |
| Numeric pain scale. | Matches the product spec's AC11 scale requirement; useful before showing abdominal pain or back pain. |
| Post-vital follow-up questions. | Matches both the post-sync June flow and the future two-phase design because vital-aware questions start only after measured values are available. |
| SOAP-shaped staff output. | Useful as a staff-summary structure, but field names and claim strength must be rewritten. |

## Inconsistencies To Fix Before Runtime Use

| Issue | Where it appears | Why it is inconsistent | Required normalization |
| --- | --- | --- | --- |
| Real-name collection. | `Question 0-1`: "What's your name?" | Repo safety rules forbid real identifiers in tracked runtime/demo flow. | Use `demo_patient_id`, age, and sex only. Do not ask for real name in v0. |
| Final triage and acuity labels. | Output template `Potential Triage Level`, `Suggested Acuity`. | Current boundary forbids final triage / acuity assignment. | Replace with `handoff_required`, `handoff_reason_codes`, and `review_basis`. |
| Disposition, department, and immediate action suggestions. | Output template `ER / Urgent Care / Clinic / Home`, `Recommended Department`, `ECG if chest pain`. | This reads as clinical decision support / orders. | Replace with `staff_handoff_note: Please review measured vitals and reported symptoms.` |
| Diagnosis-shaped case labels. | `Acute Cholecystitis`, `AfRVR`, `Pneumonia`, `URI`. | Useful as internal scenario labels, risky as system output. | Keep labels internal. Runtime summary must describe symptoms/vitals, not diagnose. |
| Vital thresholds as fixed rules. | Temperature, SpO2, HR, BP, RR trigger tables. | Repo treats thresholds as clinical validation gates, not source-verified rules. | Mark as `clinical-signoff-needed`; use only as synthetic-demo routing until owner approves. |
| Question count expansion. | Initial + symptom-specific + universal + post-vital can exceed the 慧誠 / iMVS product-spec limit. | Current June decision follows the product-spec requirement: fewer than `8` visible patient-facing questions. | Count only visible patient questions; keep the first respiratory flow around `5-7` questions and never exceed `7`. |
| Hand-coded question screens. | Any flow requiring a new UI screen for each question. | The post-meeting internal sync identified this as a scalability blocker for an AI-guided question loop. | Ask imedtac to confirm reusable `single_choice`, `multi_choice`, numeric / scale, variable-option, and no-scroll templates. |
| Universal phase asks every patient PMH/surgery/medication/allergy/pregnancy. | Section 2 universal phase. | Useful, but too heavy for June and can create sensitive-data capture. | For demo, ask only medication/allergy or pregnancy when relevant, as staff-review context. |
| Flow chart timing is ambiguous. | Symptom-specific phase can trigger abnormal vitals even though vitals timing is not explicit. | Post-sync June flow starts questions after measurement; future two-phase flow needs explicit `measurement_state` and `vitals_ready`. | For June, rewrite as measurement complete -> vital payload -> question loop. For future optimized flow, use Phase 1 pre-vital intake -> vitals-ready payload -> Phase 2 vital-aware follow-up. |
| Fever threshold mismatch. | Question design says `T > 37.5°C`; URI case treats `T 37.5°C` as fever trigger. | Strict `>` does not include exactly `37.5`; this could confuse demo behavior. | Either change to demo wording "temperature cue" or have clinical owner freeze `>=` / `>` threshold. |
| Respiratory-rate mismatch. | Question design triggers RR only at `>24 or <10`; URI case marks RR `21` as mild tachypnea, pneumonia marks RR `23` as abnormal. | The cases and trigger table disagree. | Do not present RR 21/23 as a rule-driven abnormality until threshold is approved; call it a synthetic review cue if needed. |

## Recommended Design Normalization

### Phase Model

Use this as the canonical runtime shape:

```text
Phase 1: pre_vital_intake
  - chief concern
  - onset / duration
  - patient-reported severity or breathing symptom
  - medication / allergy context when needed

Vitals-ready event:
  - measured values
  - quality flags
  - missing/failure semantics

Phase 2: post_vital_followup
  - one or two targeted follow-up questions
  - early staff-review stop when scenario warrants

Summary:
  - staff_review_summary
  - summary_visibility=staff_only
  - handoff_required=true/false
  - not_claimed list
```

### Output Wording

Convert 多寶's SOAP template like this:

| Draft field | Demo-safe field |
| --- | --- |
| `Assessment (A)` | `review_basis` |
| `Plan (P)` | `review_action` / `staff_handoff_note` |
| `Potential Triage Level` | omit |
| `Suggested Acuity` | omit |
| `Suggested Disposition` | omit |
| `Recommended Department` | omit |
| `Immediate Actions` | omit unless written as human-review-only instruction and approved |

### Case Labels

Use internal case names for design work, but public/runtime case names should
stay symptom/vital based:

| Internal label | Runtime-safe label |
| --- | --- |
| Acute cholecystitis | Fever with right upper abdominal pain |
| AfRVR | Palpitation / chest tightness with very fast heart rate |
| Pneumonia | Shortness of breath with fever and lower oxygen saturation |
| URI | Fever, cough, and runny nose contrast case |

## Near-Term Implementation Recommendation

Do not import the full question bank into runtime yet. After the `2026-05-21`
meeting, the near-term implementation should be:

1. Add 多寶's `2026-05-20` source bundle to `data/source_registry.csv`.
2. Keep the respiratory / dyspnea case as
   `FLOW-RESPIRATORY-EARLY-HANDOFF` for synthetic fallback and evidence demo.
3. Use the tachycardia / palpitation / chest-tightness lane as the first
   live-performance lane through
   `handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md` and
   `FLOW-TACHYCARDIA-LIVE-DEMO`.
4. For future expansion, turn each 多寶 question into a registry row with:
   `clinical_purpose`, `vital_trigger`, `evidence_status`, and `review_owner`.
5. Design each June case under the `<8` visible-question cap, with an
   explicit per-case question budget before implementation.

## Open Owner Decisions

| Decision | Owner needed |
| --- | --- |
| Exact adult vital thresholds and `>` / `>=` semantics. | company clinical owner / 多寶 |
| Whether any triage-level language may appear in a staff-only view. | Prof. Wu / company clinical owner / regulatory owner |
| Whether department recommendation is allowed in June. | company product + clinical owner |
| Whether universal PMH/medication/allergy/pregnancy questions are required for every case. | 多寶 + company UI owner |
| Whether Phase 1 questions can run during measurement without affecting measurement quality. | 慧誠 engineering / UI owner |
| Whether iMVS can render generic typed question templates with variable options. | 慧誠 engineering / UI owner |
