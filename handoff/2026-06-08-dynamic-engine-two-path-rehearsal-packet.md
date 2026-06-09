# Dynamic Engine Two-Path Rehearsal Packet

Date: 2026-06-08
Audience: NYCU engineering / clinical reviewer / imedtac engineering alignment
Status: internal rehearsal packet

## Capability Statement

The backend dynamic engine shows a synthetic-data, vital-aware tachycardia
intake loop for staff-review summary generation. The imedtac frontend keeps the
stable session API and renders typed questions; the NYCU backend owns answer
effects, derived flags, routing policy, routing trace, optional answer
candidates, and summary assembly.

## Rehearsal API Surface

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
GET  /api/triage-demo/sessions/{session_key}/summary
POST /api/triage-demo/sessions/{session_key}/answer-candidates
```

Official answer submission remains `/answers`. The `answer-candidates` helper
only highlights candidates inside the current question's allowed option ids and
requires confirmation.

## Path A: Palpitations + No Listed Associated Symptoms

Synthetic vitals:

```text
HR 130 bpm, SpO2 97%, BP 128/82 mmHg
```

Answer path:

```text
tachy-chief-concern: heart_racing
tachy-onset: half_day
tachy-current-feeling: heart_racing
tachy-associated-symptoms: none_of_these
tachy-post-vital-heart-rate-cue: still_racing
tachy-heart-history-meds: staff_confirm
tachy-medication-allergy-confirm: none_known
```

Expected evidence:

- next question after `none_of_these` is `tachy-post-vital-heart-rate-cue`;
- `handoff_reason_codes` includes `no_listed_associated_symptoms_selected`;
- objective summary uses current-session HR, SpO2, and BP values;
- no diagnosis, treatment, formal triage level, department recommendation, ECG
  order, or production writeback language appears.

## Path B: Chest Tightness + Shortness Of Breath + Dizziness

Synthetic vitals:

```text
HR 130 bpm, SpO2 97%, BP 128/82 mmHg
```

Answer path:

```text
tachy-chief-concern: chest_tightness
tachy-onset: half_day
tachy-current-feeling: chest_heavy
tachy-associated-symptoms: short_breath + dizzy_faint
tachy-warning-symptom-review: symptoms_still_present
tachy-heart-history-meds: staff_confirm
tachy-medication-allergy-confirm: not_sure
```

Expected evidence:

- next question after associated symptoms is `tachy-warning-symptom-review`;
- `routing_trace.reason_codes` includes `associated_warning_symptom_selected`;
- subjective summary includes shortness-of-breath and dizziness/fainting
  context for staff review;
- objective summary remains identical to Path A for the same vital payload.

## Candidate-Answer Rehearsal

Current question:

```text
tachy-associated-symptoms
```

Transcript:

```text
我喘不過氣，也有點頭暈
```

Expected result:

- candidates include `short_breath` and `dizzy_faint`;
- all candidates have `needs_confirmation=true`;
- session state is unchanged until `/answers` receives selected option ids.

## Scope Controls

This rehearsal supports staff-review intake only. It does not diagnose, assign
formal acuity, recommend treatment, order ECG/lab/medication, recommend a
department, or write to HIS/EMR/FHIR.
