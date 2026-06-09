# Dynamic Engine Clinical Wording Review Checklist

Date: 2026-06-08
Status: clinical wording review checklist
Scope: `tachycardia.v0.3` backend dynamic manifest and summary templates

## Review Target

Review these runtime artifacts:

- `data/question_manifest.tachycardia.v0.3.json`
- `data/answer_effects.tachycardia.v0.3.json`
- `data/routing_policy.tachycardia.v0.3.json`
- `data/summary_templates.tachycardia.v0.3.json`

## Contribution Under Review

The contribution is a vital-aware, synthetic-data tachycardia intake loop that
uses measured heart-rate context and selected answers to produce a
staff-review summary. The backend can adapt the next question based on the
associated-symptom answer path while preserving the human-review boundary.

## Checklist

| Item | Review question | Status |
| --- | --- | --- |
| Patient wording | Are all patient-facing questions clear enough for kiosk use? | reviewer_tbd |
| Option wording | Are option labels understandable without clinical jargon? | reviewer_tbd |
| Associated symptoms | Are shortness of breath, dizziness/fainting, sweating/nausea/fatigue, and none-selected labels appropriate for demo staff review? | reviewer_tbd |
| Warning branch | Is `Please tell staff how those symptoms feel right now.` appropriate as a staff-confirmation question? | reviewer_tbd |
| Summary subjective | Do summary phrases accurately reflect selected option ids without adding unstated facts? | reviewer_tbd |
| Summary objective | Does objective wording use only current-session measured vitals? | reviewer_tbd |
| Review basis | Does review-basis wording stay inside staff-review intake support? | reviewer_tbd |
| Review action | Does review-action wording avoid diagnosis, treatment, orders, formal triage level, or department recommendation? | reviewer_tbd |
| Source fit | Do source families support the question purpose at demo-scope level? | reviewer_tbd |
| Next validation | What wording requires local protocol or named clinical-owner approval before company-facing use? | reviewer_tbd |

## Approved Scope Language

Use:

```text
This demo shows synthetic-data vital-aware intake support and staff-review
summary generation.
```

Avoid:

```text
diagnosis
treatment advice
formal triage level
ECG order
department recommendation
safe to wait
safe to go home
```

## Review Outcome

Reviewer:

```text
Name:
Date:
Approved as demo wording:
Required edits:
Next validation layer:
```
