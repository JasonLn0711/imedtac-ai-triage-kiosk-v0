# Runtime To Governance Map

Status: v0.3 runtime review map
Last updated: 2026-06-08

## Purpose

This map connects the clickable demo runtime to the governance registries in
`data/`.

The v0 runtime is intentionally narrower than the full registry. It uses
choice-only question groups to demonstrate the product workflow while keeping
the exact clinical wording and escalation behavior in reviewer-controlled
registries.

## FIRST PRINCIPLE

Scarce resource: clinical credibility.

Every visible runtime question should answer:

```text
Why are we asking this?
Which source family supports the question?
What does the answer affect?
Who still needs to review the wording?
```

## Runtime Case Map

| Runtime case | Fixture | Flow registry row | Profile shown | Boundary |
| --- | --- | --- | --- | --- |
| Chest pressure | `demo/fixtures/chest-pain-high-bp-low-spo2.json` | `FLOW-CHEST-PAIN-VITALS` | `DEMO-001`, age `58`, sex `Male` | Staff-review summary only; no condition identification, treatment, final acuity assignment, or emergency order. |
| Fever and urinary symptoms | `demo/fixtures/fever-urinary.json` | `FLOW-FEVER-URINARY` | `DEMO-002`, age `42`, sex `Female` | Staff-review summary only; no antibiotic recommendation, sepsis claim, condition identification, or final acuity assignment. |
| Respiratory handoff | `demo/fixtures/respiratory-low-spo2-early-handoff.json` | `FLOW-RESPIRATORY-EARLY-HANDOFF` | `DEMO-RESP-001`, age `80`, sex `Male` | Staff-review summary only; no diagnosis, condition identification, final acuity assignment, disposition recommendation, treatment advice, or HIS/EMR/FHIR writeback. |
| Tachycardia live demo | `demo/fixtures/tachycardia-live-demo.json` | `FLOW-TACHYCARDIA-LIVE-DEMO` | `DEMO-TACHY-001`, age `76`, sex `Female` | Staff-review summary only; no AfRVR diagnosis, arrhythmia diagnosis, ACS diagnosis, ECG order, treatment advice, final acuity assignment, formal triage score, or HIS/EMR/FHIR writeback. |

## Runtime Question Map

| Runtime question id | Phase | Runtime wording | Registry coverage | Source families | Output effect |
| --- | --- | --- | --- | --- | --- |
| `chief-concern` | `pre_vital_intake` | What is the main reason you are using the kiosk today? | `RESP-001`; anchors branch selection before registry-specific follow-up. Related rows: `CP-001`, `FEV-001`, `URI-001`. | AHA, CDC, AUA, local protocol, and respiratory source families depending on selected concern. | Sets patient-reported chief concern for the staff-review summary. |
| `breathing-duration` | `pre_vital_intake` | How long have you felt short of breath? | `RESP-002`. | `CDC-FLU-WARN`, `LOCAL-PROTOCOL-TBD`. | Adds dyspnea duration context without interpreting measured vitals. |
| `onset` | `pre_vital_intake` | When did this problem start? | Related rows: `CP-005`, `FEV-001`. | AHA / CDC source families, clinician workflow review needed. | Adds timing context without assigning acuity. |
| `severity` | `pre_vital_intake` | How severe does it feel right now? | `RESP-004` for respiratory case; generic intake context for other cases. | `DUOBAO-DEMO-DESIGN-20260520`, `LOCAL-PROTOCOL-TBD`. | Adds patient-reported severity; does not assign final acuity. |
| `breathing` | `pre_vital_intake` | Are you having trouble breathing right now? | `CP-003`, `FEV-002`. | `AHA-HEART-ATTACK`, `CDC-FLU-WARN`, `ENA-ESI-V5`. | Makes respiratory concern visible for staff review. |
| `respiratory-symptoms` | `pre_vital_intake` | Which symptoms are present? | `RESP-005`. | `CDC-FLU-WARN`, `AHA-HEART-ATTACK`, `DUOBAO-DEMO-DESIGN-20260520`. | Adds cough, fever/chills, and chest-discomfort descriptors without naming a condition. |
| `chest-pain-pressure` | `post_vital_followup` | Are you having chest pain or pressure right now? | `CP-001`. | `AHA-HEART-ATTACK`, `AHA-HBP-911-2025`. | Adds active chest-pain / pressure status to the staff-review summary. |
| `chest-details` | `post_vital_followup` | For chest discomfort, which descriptions fit? | `CP-001`, `CP-002`, `CP-004`, `CP-005`. | `AHA-HEART-ATTACK`, `AHA-HBP-911-2025`, `ENA-ESI-V5`. | Adds chest-warning-sign descriptors to the staff-review summary. |
| `neurologic-symptoms` | `post_vital_followup` | Do you have any new neurologic symptoms? | `CP-004`. | `AHA-HBP-911-2025`, `AHA-HEART-ATTACK`, `ENA-ESI-V5`. | Adds neurologic descriptor positives / negatives for review. |
| `fever-details` | `post_vital_followup` | For fever or infection concern, which descriptions fit? | `FEV-001`, `FEV-002`, `FEV-003`, `URI-001`, `URI-002`. | `CDC-FLU-WARN`, `AUA-RUTI`. | Adds fever, respiratory, urinary, and systemic context for review. |
| `urinary-details` | `post_vital_followup` | For urinary symptoms, which descriptions fit? | `URI-001`, `URI-002`. | `AUA-RUTI`, `CDC-FLU-WARN`. | Adds urinary symptom context without condition identification. |
| `lung-history-context` | `post_vital_followup` | Do you have chronic lung disease, use home oxygen, or use breathing medicines? | `RESP-003`. | `LOCAL-PROTOCOL-TBD`. | Adds baseline respiratory context for staff confirmation. |
| `pregnancy-context` | `post_vital_followup` | Is pregnancy possible or currently known? | Local clinical review needed before production use. | `LOCAL-PROTOCOL-TBD`. | Keeps a key context field visible for staff confirmation. |
| `medication-allergy` | `pre_vital_intake` | Can you provide current medications or allergies? | `MED-001`; local protocol review needed. | `LOCAL-PROTOCOL-TBD`. | Routes medication/allergy context to staff confirmation. |
| `support-needed` | `pre_vital_intake` | Do you need staff help before continuing? | Human-factors / handoff row; local product review needed. | `LOCAL-PROTOCOL-TBD`. | Supports kiosk usability and staff-assist workflow. |
| `tachy-chief-concern` | `post_measurement_intake` | What is the main reason you are using the kiosk today? | `TACHY-001`. | `DUOBAO-DEMO-DESIGN-20260520`, `DUOBAO-AFRVR-TACHY-QA-20260525`, `IMEDTAC-POST-MEETING-PROGRESS-20260521`, `LOCAL-PROTOCOL-TBD`. | Adds chief concern and starts the tachycardia backend session path. |
| `tachy-onset` | `post_measurement_intake` | When did this start? | `TACHY-002`. | `DUOBAO-DEMO-DESIGN-20260520`, `DUOBAO-AFRVR-TACHY-QA-20260525`, `LOCAL-PROTOCOL-TBD`. | Adds onset and duration context for staff review. |
| `tachy-current-feeling` | `post_measurement_intake` | Which descriptions fit what you feel now? | `TACHY-003`. | `AHA-TACHYCARDIA-FAST-HR`, `AHA-HEART-ATTACK`, `DUOBAO-DEMO-DESIGN-20260520`, `DUOBAO-AFRVR-TACHY-QA-20260525`. | Adds palpitation, chest tightness, pressure/pain, or staff-confirmation descriptors. |
| `tachy-associated-symptoms` | `post_measurement_intake` | Are any of these happening with it? | `TACHY-004`. | `AHA-TACHYCARDIA-FAST-HR`, `AHA-HEART-ATTACK`, `MEDLINEPLUS-AFIB`, `DUOBAO-AFRVR-TACHY-QA-20260525`. | Dynamic branch point for associated symptom positives or none-selected context. |
| `tachy-warning-symptom-review` | `post_measurement_intake` | Please tell staff how those symptoms feel right now. | `TACHY-008`. | `AHA-TACHYCARDIA-FAST-HR`, `AHA-HEART-ATTACK`, `MEDLINEPLUS-AFIB`, `DUOBAO-AFRVR-TACHY-QA-20260525`, `LOCAL-PROTOCOL-TBD`. | Adds staff-confirmation cue after associated cardiopulmonary symptoms are selected. |
| `tachy-post-vital-heart-rate-cue` | `post_measurement_intake` | The kiosk received a high heart-rate reading for this demo. How do you feel right now? | `TACHY-005`. | `AHA-TACHYCARDIA-FAST-HR`, `MEDLINEPLUS-AFIB`, `DUOBAO-DEMO-DESIGN-20260520`, `DUOBAO-AFRVR-TACHY-QA-20260525`. | Adds post-vital heart-rate cue response when no listed associated symptoms are selected. |
| `tachy-heart-history-meds` | `post_measurement_intake` | Have you been told you have a heart rhythm problem, or do you take heart / blood-pressure medicine? | `TACHY-006`. | `MEDLINEPLUS-AFIB`, `ENA-ESI-V5`, `DUOBAO-AFRVR-TACHY-QA-20260525`, `LOCAL-PROTOCOL-TBD`. | Adds history and medication context for staff confirmation. |
| `tachy-medication-allergy-confirm` | `post_measurement_intake` | Do you have medication allergies or medicines staff should confirm? | `TACHY-007`. | `LOCAL-PROTOCOL-TBD`, `DUOBAO-DEMO-DESIGN-20260520`, `DUOBAO-AFRVR-TACHY-QA-20260525`. | Adds medication and allergy confirmation context before summary. |

## Known Gap

The backend tachycardia contract now consumes
`data/question_manifest.tachycardia.v0.3.json`. The clickable frontend engine
still keeps its own static `core/triage_engine` question bank for the local
browser demo. The next hardening step is to generate both backend and frontend
question surfaces from the same checked manifest.

## Next Hardening Step

Add a manifest schema validator and a registry-to-manifest build step. The
check should fail when a served backend or frontend question lacks registry
coverage, source refs, approved option count, unique option ids, or
demo-allowed status.
