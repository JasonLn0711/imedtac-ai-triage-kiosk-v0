---
id: 2026-05-21-imedtac-post-meeting-progress-record
title: "2026-05-21 imedtac Post-Meeting AI Triage Progress Record"
date: 2026-05-21
topic: ai-triage
type: source
status: active
source_note: user-provided Gmail PDF exported after the 2026-05-21 engineering sync
assets:
  - assets/Gmail - [20250521] AI Triage 進度討論.pdf
  - extracted/Gmail - [20250521] AI Triage 進度討論.txt
related:
  - ../2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../2026-05-21-imedtac-teams-api-followup/source.md
  - ../../handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ../../handoff/2026-05-21-to-2026-05-25-imedtac-response-plan.md
---

# 2026-05-21 imedtac Post-Meeting AI Triage Progress Record

## Source Boundary

This folder preserves the Gmail PDF `Gmail - [20250521] AI Triage 進度討論.pdf`
provided by Jason on `2026-05-21`. The PDF is a post-meeting progress summary
from Johnny Fang / imedtac after the `2026-05-21` engineering sync.

Treat this as company-side meeting-record and action-item evidence. It is not a
clinical source, regulatory source, production integration approval, or approval
to process real patient data.

The extracted text contains Gmail export layout artifacts and several PDF text
extraction replacement characters. The working interpretation below uses the
confirmed meeting record to resolve those artifacts, especially the endpoint
numbering.

## Preserved Files

- Original PDF:
  `assets/Gmail - [20250521] AI Triage 進度討論.pdf`
- Extracted text:
  `extracted/Gmail - [20250521] AI Triage 進度討論.txt`

## Working Extraction

Email metadata:

- Subject: `[20250521] AI Triage 進度討論`
- From: Johnny Fang 方偉翰, imedtac Corp.
- Sent: `2026-05-21 13:35`
- To: Jason Lin, 多寶, Jason Miao, Ben Siu
- Cc: Ken Yu, Prof. Wu

imedtac's stated demo context:

- AI Triage is planned for a US customer demo around `2026-06-10`.
- The email summarizes the scenario-planning outcome from the same-day meeting.

Key decisions recorded by imedtac:

1. System flow and API architecture
   - Demo flow is "measure first, then ask questions."
   - The reason is to minimize engineering effort and avoid major system
     changes on both sides.
   - The user completes vital-sign measurement on the device first.
   - After measured vital signs are uploaded, AI questions begin.
   - API adjustment: merge Endpoint 1 and Endpoint 3.
   - After imedtac uploads measurement data, NYCU returns `Session Key` and the
     first question.
   - Later calls use Endpoint 2 for the one-question / one-answer loop.

2. UI / UX design
   - For kiosk usability, AI-generated questions should be `single_choice` or
     `multi_choice`.
   - imedtac will add a demo preview button or page after the measurement report
     to show the AI-organized summary / result.
   - In real workflow, this type of result should go back to HIS rather than be
     directly displayed to the patient.
   - Voice interaction is not included in this demo and no microphone preparation
     is needed.

3. Demo script and scenario direction
   - For the US customer demo, imedtac proposes leading with a tachycardia /
     arrhythmia / chest-tightness emergency scenario.
   - Rationale: on-site staff can raise heart rate through exercise, making the
     abnormal value visible in a live demonstration.

imedtac action items:

- Establish a technical communication channel for both engineering teams, such
  as Microsoft Teams or LINE.
- Adjust the kiosk UI to support the "measure first, then ask questions" flow.
- Add a demo button / page after the measurement report for AI review result
  preview.
- Render generated questions as `single_choice` or `multi_choice`.

NYCU action items:

- Adjust API logic so NYCU issues the `Session Key` and starts the question loop
  only after receiving measured vital data.
- Provide the demo script.
- Based on live feasibility for the tachycardia scenario, refine relevant demo
  parameters and expected AI output.

## Working Implications

This source aligns with the existing `post_measurement_only` decision:

```text
iMVS completes vital-sign measurement
-> iMVS uploads measured vital payload
-> NYCU returns session_key + first question
-> iMVS submits each answer with session_key
-> NYCU returns next question or staff_review_summary
```

Important language control:

- The email uses "SOAP summary and triage result" language for the demo preview.
- NYCU external API wording should use `staff_review_summary` /
  `review_basis` / `review_action` and preserve the human-review boundary.
- Do not present the June output as diagnosis, final triage level, treatment
  advice, formal disposition, or production HIS / EMR writeback.
