---
id: 2026-06-16-imedtac-teams-question-option-adjustment
title: "imedtac Teams Question-Type And Tachycardia Follow-Up"
date: 2026-06-17
topic: ai-triage
type: source
status: active
channel: Microsoft Teams
confidentiality: engineering-coordination-local-only
source_note: user-provided Microsoft Teams screenshots on 2026-06-17
related:
  - ../2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ../../decisions/2026-05-18-choice-only-v0-boundary.md
  - ../../docs/2026-06-08-dynamic-engine-completion-audit.md
  - ../../handoff/2026-06-08-dynamic-engine-external-release-gate-closeout.md
  - ../../data/question_manifest.tachycardia.v0.3.json
  - ../../data/summary_templates.tachycardia.v0.3.json
---

# imedtac Teams Question-Type And Tachycardia Follow-Up

## Source Boundary

This note preserves the visible Microsoft Teams conversation screenshots
provided by Jason on `2026-06-17`. It is a screenshot-based working record, not
a native Teams export.

Date interpretation: because the screenshots were provided in this repo session
on `2026-06-17`, the visible Teams label `Yesterday` is interpreted as
`2026-06-16`, and the visible label `Thursday 11:48 AM` is interpreted as the
most recent prior Thursday, `2026-06-11`. If a later native export gives a
different capture date, update the date labels while preserving the recorded
message content and relative order.

Treat this as engineering coordination and task-routing evidence. It confirms
UI question-type constraints, tachycardia demo expectations, summary-content
expectations, and a pending updated question version. It is not clinical
validation, production approval, a real patient-data approval, or a change to
the externally frozen API endpoints.

## Source Assets

- `assets/2026-06-17-teams-question-option-adjustment-1.png`
- `assets/2026-06-17-teams-question-option-adjustment-2.png`

## Visible Conversation Transcript

The following transcript is reconstructed from the user-provided screenshots.
Line breaks preserve visible meaning rather than Teams UI wrapping.

```text
[2026-06-11 Thursday 11:48 AM, inferred from screenshot context]

多寶 許:
[posted screenshot of a duration-style question UI. Visible example:
"How long have you had this?", "3 days", tabs for Hours / Days / Weeks /
Months, numeric buttons, "Submit answer", and "Pick list".]

不好意思我們設計問題需要問到時間多久

有沒有辦法做出類似這樣的選項頁面？

Johnny Fang 方偉翰, imedtac Corp.:
先前的討論是說現階段不會有量尺類型的問題，
所以後來只限縮在單選和多選中，
目前工程師的開發資源也移到其他專案了，以修bug為主

建議可以把題目內容調整成單選的形式，讓Demo可以順利進行就好
你這邊有辦法調整嗎?

多寶 許:
好吧，那我就先調整成選項

[2026-06-16 Tuesday 3:18 PM, inferred from screenshot context]

Johnny Fang 方偉翰, imedtac Corp.:
想請問後來題目的設計調整有後續嗎?

- 以高心跳的狀況下去demo，預期是在高心跳的情境下，問診的流程還是會針對不同數據有不同題目
- 最後的報告結果希望是套用量測過的數據來呈現

另外，上次有提到的北市聯醫的專案由於範圍有一些調整，在昨天才比較確定，我會再整理需求跟你們溝通

[2026-06-16 Tuesday 4:42 PM, inferred from screenshot context]

多寶 許:
[replying to Johnny Fang's 2026-06-16 3:18 PM question]
我們有一個更新的版本，還尚未push上去，可能這兩天push上去

Johnny Fang 方偉翰, imedtac Corp.:
好的 感謝
```

## Working Extraction

### Confirmed / Actionable

- imedtac's current engineering position is that the demo UI should stay within
  `single_choice` and `multi_choice` question types.
- A duration / time-amount widget like Hours / Days / Weeks / Months plus
  numeric keypad is not available for the current demo scope.
- imedtac engineering resources have moved to other projects; current support
  is mainly bug-fix oriented. The practical integration path is to adjust
  question content into selectable options.
- 多寶 accepted this direction and said the duration-style question will be
  adjusted into options.
- Johnny asked for follow-up on the adjusted question design on `2026-06-16`.
- Johnny's expected tachycardia demo story is:
  - use the high-heart-rate scenario for the demo;
  - under a high-heart-rate context, the intake flow should still show that
    different measured data can lead to different questions;
  - the final report should present and use the measured vital data.
- 多寶 replied that an updated version exists, has not yet been pushed, and may
  be pushed within two days of `2026-06-16`.
- Johnny separately noted that the Taipei City Hospital / 北市聯醫 project scope
  had changed and became clearer on `2026-06-15`; he will organize those
  requirements and communicate them separately.

### Compatibility With Current Repo State

- The repo already has an active choice-only v0 boundary in
  `decisions/2026-05-18-choice-only-v0-boundary.md`.
- The current dynamic tachycardia manifest
  `data/question_manifest.tachycardia.v0.3.json` already uses only
  `single_choice` and `multi_choice` questions, with no-scroll option limits.
- The current tachycardia duration / onset content is already represented as a
  `single_choice` question: `tachy-onset`, `When did this start?`.
- The current backend summary assembler includes measured vital values in the
  objective section of `staff_review_summary`, including HR, SpO2, BP,
  respiratory rate, and temperature when provided.
- The current routing policy includes dynamic branching after associated
  symptoms: selected warning symptoms route through
  `tachy-warning-symptom-review`, while selecting no listed associated symptoms
  routes through the measured heart-rate cue question
  `tachy-post-vital-heart-rate-cue`.

## Next-Step Interpretation

The near-term product direction is to keep the imedtac-facing contract stable:
question screens remain single-choice / multi-choice, and duration-like
clinical content becomes discrete options rather than a new widget.

Recommended next action sequence:

1. Obtain or locate the updated question version that 多寶 said had not yet
   been pushed.
2. Diff the updated version against `data/question_manifest.tachycardia.v0.3.json`
   and `Question_DB/symptom_questions.csv`, focusing on:
   - whether every patient-facing question is `single_choice` or `multi_choice`;
   - whether every option label stays short enough for imedtac's no-scroll UI;
   - whether duration / onset wording is represented as option buckets;
   - whether `I'm not sure` / `not sure` semantics remain explicit;
   - whether there are no fixed `None of these` controls except explicit
     returned options where clinically useful.
3. Rebuild derived question artifacts and vector index after accepting wording
   edits:

```bash
npm run dynamic:build
```

4. Verify the tachycardia lane still meets the current demo contract:

```bash
npm run demo:ready
python3 JS/scripts/check_governance_registries.py
```

5. Confirm the final summary path with imedtac: Endpoint 2 returns
   `status=summary` and `staff_review_summary`, and the objective section uses
   measured vital values from the session payload.
6. Record the Taipei City Hospital / 北市聯醫 requirements as a separate source
   bundle when Johnny sends the updated scope. Keep that discussion separate
   from the current June tachycardia demo contract unless a recorded change
   request explicitly links them.

## External Commitment Control

This Teams exchange reinforces existing constraints instead of changing the
external API contract:

- Do not add a new duration / scale / numeric widget requirement to the June
  imedtac UI path without a recorded change request.
- Do not change endpoint paths, bearer-token behavior, CORS origins,
  `progress.expected_total`, `single_choice` / `multi_choice` rendering, or
  summary payload semantics silently.
- Treat the pending updated question version as a wording/question-bank update
  until it is reviewed, rebuilt, verified, and explicitly communicated.
