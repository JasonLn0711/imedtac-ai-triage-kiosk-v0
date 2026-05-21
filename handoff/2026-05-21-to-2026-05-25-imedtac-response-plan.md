---
id: 2026-05-21-to-2026-05-25-imedtac-response-plan
title: "imedtac Response Plan Through 2026-05-25"
date: 2026-05-21
topic: ai-triage
type: handoff
status: active
audience: internal NYCU / Jason / 多寶 coordination
source:
  - ../source/2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../source/2026-05-21-imedtac-post-meeting-progress-record/source.md
  - ../source/2026-05-21-imedtac-teams-api-followup/source.md
  - ../source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md
  - ./2026-05-21-imedtac-two-endpoint-api-reply.md
---

# imedtac Response Plan Through 2026-05-25

## Answer

Yes. By Monday `2026-05-25`, NYCU can respond to imedtac's current engineering
needs if the scope is:

```text
two-endpoint API document
-> JSON examples
-> preset question / option template for the first demo lane
-> skip-behavior recommendation after 多寶 / 許醫師 discussion
-> clear list of remaining inputs needed from imedtac
```

Do not frame Monday as a frozen clinical triage product, final clinical
threshold package, production integration specification, or formal HIS / EMR
writeback design.

## Incoming Requests To Cover

### From Johnny's post-meeting Gmail record

imedtac recorded:

- US customer demo around `2026-06-10`.
- Demo flow: measure first, then ask questions.
- API: merge Endpoint 1 and Endpoint 3; after imedtac uploads measurement data,
  NYCU returns `Session Key` plus first question; later calls use Endpoint 2 for
  one-question / one-answer loop.
- UI: generated questions should be `single_choice` or `multi_choice`.
- UI: imedtac will add a demo preview button / page after the measurement report
  for the AI-organized summary / result.
- Voice is out of the current demo.
- Proposed live demo lane: tachycardia / arrhythmia / chest tightness because
  on-site staff can raise heart rate through exercise.
- NYCU action items: adjust API logic and provide the demo script, parameters,
  and expected AI output.

### From Johnny / Ben / Lauren's Microsoft Teams follow-up

imedtac asked:

- provide the two-endpoint API document;
- provide template contents by tomorrow or Monday, including preset questions
  and options;
- confirm whether a user may skip a question if they cannot answer.

## Delivery Plan

| Date | Deliverable | Owner | Status | Notes |
| --- | --- | --- | --- | --- |
| Thu `2026-05-21` night | Discuss Johnny's two Teams questions with 多寶. | Jason + 多寶 | pending | Focus on question template timing and skip behavior. |
| Thu `2026-05-21` night or Fri `2026-05-22` morning | Send holding reply in Teams. | Jason | ready | Acknowledge two-endpoint API document; say question template and skip behavior will be confirmed after internal clinical review. |
| Fri `2026-05-22` | Send two-endpoint API document draft. | Jason / NYCU | ready as draft | Use `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`. |
| Fri `2026-05-22` | Draft preset question / option template. | Jason | pending | Use single-choice / multi-choice only; include `Not sure` / `Unable to answer` where clinically safer than silent skip. |
| Fri `2026-05-22` | Ask imedtac for missing field dictionary and UI limits. | Jason | pending | Required to freeze exact payload names and rendering constraints. |
| Sat-Sun `2026-05-23` to `2026-05-24` | Refine tachycardia live-performance lane and respiratory synthetic fallback lane. | Jason + 多寶 / 許醫師 if available | pending | Avoid diagnosis, final triage level, treatment, disposition, or department recommendation. |
| Mon `2026-05-25` | Send confirmed question / option template and skip-behavior answer. | Jason / NYCU | target | Include what is final for demo and what remains pending clinical / UI confirmation. |

## Teams Reply Strategy For Tonight Or Tomorrow Morning

Do not answer the skip question as final before discussing with 多寶.

Safe holding reply:

```text
Ben、Lauren、Johnny 大家好，收到，謝謝。

我們會先依照今天會議確認的 post-measurement-only flow 整理兩個 endpoint 的 API 文件：

1. Start session with measured vitals：iMVS 完成量測後送 measured vital payload，NYCU 回 session_key 與第一題 question object。
2. Submit answer：iMVS 帶 session_key 回傳答案，NYCU 回下一題 question object 或 staff_review_summary。

題目與選項範本、以及「使用者答不出來是否可略過」這兩點，我們今晚或明早先跟多寶 / 臨床端確認後回覆。初步方向會以單選 / 複選、demo-safe wording、以及 staff-review summary boundary 為主。
```

## Recommended Position Before 多寶 Review

### Question / option template

Recommended structure:

- one row per question;
- `question_id`;
- `question.type`: `single_choice` or `multi_choice`;
- `question.text`;
- option ids and labels;
- required / optional status;
- whether `Not sure` or `Unable to answer` is included;
- clinical review owner;
- output effect in `staff_review_summary`;
- forbidden output language.

### Skip behavior

Working recommendation:

- Do not use a generic silent skip for required safety questions.
- For user uncertainty, prefer explicit answer options:
  - `Not sure`
  - `Unable to answer`
  - `None of these`
- If a question is non-critical and imedtac needs a skip button, represent it
  explicitly in the API:

```json
{
  "answer": {
    "selected_option_ids": [],
    "scale_value": null,
    "skipped": true,
    "skip_reason": "user_unable_to_answer"
  }
}
```

- If required information is missing, `staff_review_summary` should say
  information is incomplete and staff should confirm, rather than inventing a
  clinical conclusion.

Confirm with 多寶:

- Which first-lane questions are required?
- Which can include `Not sure`?
- Which can be optional?
- Whether a generic "skip" button is acceptable in the first customer demo.

## Monday Deliverable Boundary

Can deliver by Monday:

- two-endpoint API contract;
- JSON examples;
- question template for first demo lane;
- skip-behavior policy;
- imedtac input checklist;
- demo-safe staff-review output wording draft.

Should not claim by Monday:

- final triage level;
- diagnosis;
- treatment recommendation;
- formal SOAP Assessment / Plan;
- production HIS / EMR writeback;
- clinical threshold validation;
- validated tachycardia/arrhythmia diagnostic logic.

## Open Inputs From imedtac

Need from imedtac to freeze engineering details:

- actual Vital Upload API field dictionary;
- example payload;
- UI insertion point after measurement report;
- question template limits: max options, max label length, no-scroll behavior;
- whether `Not sure` / `Unable to answer` options are acceptable in UI;
- where `staff_review_summary` appears and whether patient-facing UI hides it;
- demo environment, API base URL constraints, CORS / firewall constraints;
- whether a local scripted fallback is acceptable and how it should be labeled.
