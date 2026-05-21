---
id: 2026-05-21-imedtac-engineering-sync-closeout
title: "imedtac Engineering Sync Closeout And Next Steps"
date: 2026-05-21
topic: ai-triage
type: handoff
status: active
audience: internal NYCU / imedtac coordination
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-engineering-sync/transcript-corrected-gpt.txt
  - ../source/2026-05-21-imedtac-engineering-sync/user-provided-meeting-record.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
---

# imedtac Engineering Sync Closeout And Next Steps

## Recommendation

We recommend treating the June customer demo as a medical workflow integration
demo:

```text
iMVS measured vital payload
-> NYCU structured question loop
-> staff_review_summary
-> staff / clinician / customer preview
```

This demonstrates the product capability that matters for 慧誠智醫（imedtac
Co., Ltd.）: vital-sign kiosk data can drive a structured AI intake workflow
without claiming autonomous diagnosis, final triage, treatment advice, or
production HIS / EMR writeback.

## Post-Sync Defaults

| Decision | Post-sync default |
| --- | --- |
| June workflow | `post_measurement_only`: measure first, ask after vitals are ready. |
| API shape | Merge start-session and vital upload for June; keep answer loop as the second endpoint. |
| Session owner | NYCU generates `session_key`; iMVS echoes it with every answer. |
| Payload policy | NYCU adapts to imedtac's existing Vital Upload API format. |
| Question types | `single_choice` and `multi_choice`; `scale` only when needed. |
| Chief complaint | `single_choice` for demo control. |
| Voice | Out of June critical path. |
| Output | `staff_review_summary`, staff-only / doctor-preview / customer-preview. |
| Product wording | `vital-aware intake support` or `AI-assisted staff-review intake workflow`. |
| Fallback | Remote REST API Mode primary; Local Scripted Demo Mode as clearly labeled backup. |
| Case script | imedtac prefers tachycardia / chest-tightness for the live US-customer demo; keep respiratory synthetic as a fallback / comparison lane until clinical wording review. |

## Post-Duobao Internal Sync Clarification

The `2026-05-21 10:57` Jason / 多寶 internal sync sharpened the clinical and
engineering boundary after the imedtac call:

- Do not make the June demo about AI assigning a formal five-level triage
  result. That is the clinical-risk zone.
- Put the AI value in vital-aware question selection and staff-review summary
  generation.
- Keep baseline questions fixed or rule-constrained; use vital context only to
  choose the next safe question from a reviewed set.
- Confirm that iMVS can render generic question templates instead of requiring
  one hand-coded screen per question.
- Inspect an actual iMVS machine with 多寶 / 許醫師 next week before freezing the
  customer-visible flow.

## What NYCU Should Do Next

1. Update API v0.2 by `2026-05-22`.
   - Mark `post_measurement_only` as the June default.
   - Keep the two-phase / vitals-ready endpoint as future optimized mode.
   - Merge Endpoint 1 and Endpoint 3 for the first June integration pass.
   - Explain `idempotency_key`, retry behavior, and error/fallback behavior in
     plain engineering language.
   - Teams follow-up: Ben asked for the two-endpoint API document through the
     new `AI Triage 討論 w/ 陽交大` Microsoft Teams channel.
   - Current draft: `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`.

2. Prepare the preset question / option template packet for imedtac by
   `2026-05-22` if possible, or `2026-05-25` at latest.
   - Include the first tachycardia / chest-tightness live-demo lane if 多寶 /
     許醫師 can review quickly; keep respiratory early-handoff as fallback.
   - Include stable question ids, option ids, labels, question type, and whether
     each question is required or optional.
   - Keep the wording demo-safe: no diagnosis, final triage level, treatment
     advice, or safe-to-go-home language.
   - Route clinical wording / required-question judgment through 多寶 / 許醫師
     before sending externally if time allows.

3. Answer imedtac's skip-behavior question.
   - Product question from Teams: if a user cannot answer a question, can the
     user skip it in practice?
   - Working default before review: do not use a generic silent skip for
     required safety questions.
   - Prefer explicit options such as `I am not sure` or `Unable to answer` when
     the answer affects the staff-review summary.
   - If skip is allowed for non-critical questions, represent it explicitly in
     the API, for example `answer.skipped=true` plus `skip_reason`, rather than
     treating it as a missing answer.
   - Confirm with 多寶 / 許醫師 which questions must be answered for the first
     demo case.
   - Use `handoff/2026-05-21-to-2026-05-25-imedtac-response-plan.md` for the
     holding reply and Monday plan.

4. Request the imedtac field dictionary.
   - Field names, units, required/optional, missing/failed/quality flags.
   - Blood pressure structure.
   - Whether respiratory rate exists as measured, manually entered, or absent.
   - Example payload for one synthetic or demo patient.

5. Request the imedtac question-rendering template contract.
   - Supported `question.type` values: `single_choice`, `multi_choice`,
     numeric / scale, and any yes/no shortcut.
   - Maximum visible options without scrolling.
   - Maximum label length that fits the iMVS screen.
   - Whether option count can vary per question.
   - Whether the response can carry `ui_template`, `option_count`, progress,
     and answer constraints.

6. Prepare two case lanes.
   - Tachycardia live-performance lane: imedtac's current preferred customer-demo
     lead because heart rate can be raised on site.
   - Respiratory synthetic lane: best for a controlled vital-aware medical story
     and useful as fallback / comparison.
   - Keep both under staff-review wording; do not output final triage level.

7. Build or preserve fallback.
   - Remote REST API Mode for normal demo.
   - Local Scripted Demo Mode for network/API failure.
   - Static Mock Mode only if both live and local scripted modes fail.
   - Label fallback mode clearly in internal runbooks.

8. Arrange iMVS machine review with 多寶 / 許醫師.
   - Observe screen order, measurement posture, option capacity, scrolling
     tolerance, result page, and operator script.

## Microsoft Teams Follow-Up TODOs

Sources:

- `../source/2026-05-21-imedtac-teams-api-followup/source.md`
- `../source/2026-05-21-imedtac-post-meeting-progress-record/source.md`

| Task | Owner | Due / timing | Status | Notes |
| --- | --- | --- | --- | --- |
| Provide two-endpoint API document to Ben / Lauren / Johnny. | NYCU / Jason | `2026-05-22` target | drafted | Use `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`; June contract is start-session-with-vitals plus submit-answer. |
| Provide preset question and option template contents. | NYCU / Jason with 多寶 / 許醫師 wording review | Tomorrow or Monday from the Teams ask: `2026-05-22` or `2026-05-25` | pending | Include question ids, option ids, labels, required/optional status, and demo-safe wording. |
| Decide and reply on user skip behavior. | NYCU / Jason with 多寶 / 許醫師 clinical review; imedtac UI to confirm rendering | Before sending question template if possible | pending | Default to explicit `Unable to answer` / `I am not sure` options for clinically relevant questions; avoid silent skip for required safety questions. |
| Align first customer-demo lane with imedtac's post-meeting preference. | NYCU / Jason with 多寶 / 許醫師 review | Before Monday `2026-05-25` if possible | pending | imedtac prefers tachycardia / chest-tightness because HR can be raised live; keep output as staff-review summary, not formal triage result. |
| Preserve Teams channel as engineering communication route. | NYCU / Jason | done after source capture | recorded | Johnny opened `AI Triage 討論 w/ 陽交大`; Ben and Lauren are the primary imedtac technical contacts. |

## What imedtac Should Provide

| Needed input | Why it matters |
| --- | --- |
| Vital Upload API field dictionary | NYCU cannot build the adapter safely from guessed field names. |
| Example payload | Confirms units, required fields, and null/failure semantics. |
| UI insertion point | Confirms the question loop appears after measurement and before report. |
| Generic question-template support | Confirms NYCU can return a reusable typed question object instead of imedtac hand-coding each question screen. |
| UI option limits | Controls question wording, option count, label length, and no-scroll design. |
| Network / firewall / browser constraints | Determines whether Remote REST API Mode is realistic. |
| Local fallback acceptance | Prevents customer-demo failure if the network path breaks. |
| Demo date and script owner | Lets NYCU freeze the exact case lane and result page. |
| Engineering communication channel | Keeps field-level issues out of product-only routing. |

## What 多寶 / 許醫師 Should Review

- first live case lane;
- question wording;
- stop-rule / early handoff condition;
- staff-review summary wording;
- forbidden wording;
- whether tachycardia is safer and more performable than respiratory low-SpO2
  for the first customer-facing run.

## Demo Runbook Skeleton

```text
Mode A: Remote REST API Mode
1. Operator completes iMVS login and vital measurement.
2. iMVS sends measured vital payload to NYCU.
3. NYCU returns session_key + first question.
4. Operator answers 5-7 structured questions.
5. NYCU returns staff_review_summary.
6. imedtac shows result preview to staff / doctor / customer.

Mode B: Local Scripted Demo Mode
1. Operator switches to the preloaded synthetic script.
2. The same question/result sequence is shown locally.
3. The runbook labels this as fallback, not live API.

Mode C: Static Mock Mode
1. If interactive modes fail, show the prepared flow and result page.
2. State that the live service is unavailable and no AI-generated clinical
   summary was produced in that run.
```

## Claim Boundary

Use this sentence as the stable company-facing boundary:

```text
This demo shows a synthetic-data vital-aware intake loop for staff-review
summary generation; final clinical judgment remains with staff or clinicians.
```

Do not use:

- `AI diagnosis`;
- `final triage level`;
- `safe to go home`;
- `treatment recommendation`;
- `FDA-ready` or `510(k)-ready`;
- `production HIS / EMR writeback`.

## Next Checkpoint Definition

The next checkpoint is complete when one case can run through:

```text
imedtac-shaped vital payload
-> NYCU session_key + first question
-> 5-7 answer submissions
-> staff_review_summary
-> clearly labeled fallback path
```

with no real identifiers, no raw audio, no diagnosis, no treatment advice, no
final triage level, and no production hospital writeback.
