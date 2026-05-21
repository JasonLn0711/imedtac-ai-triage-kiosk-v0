---
id: 2026-05-21-imedtac-teams-api-followup
title: "2026-05-21 imedtac Teams API Follow-Up"
date: 2026-05-21
topic: ai-triage
type: source
status: active
channel: Microsoft Teams
source_note: user-provided screenshot and copied chat text
related:
  - ../2026-05-21-imedtac-engineering-sync/meeting-record.md
  - ../../handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md
  - ../../handoff/2026-05-21-imedtac-engineering-sync-closeout.md
---

# 2026-05-21 imedtac Teams API Follow-Up

## Source Boundary

This note preserves the Microsoft Teams chat follow-up provided by Jason on
`2026-05-21`. It records the post-meeting engineering communication channel and
the immediate imedtac asks after the `2026-05-21` engineering sync.

Treat this as coordination evidence and task routing. It is not a clinical
source, regulatory source, production integration approval, or final API
acceptance.

## Raw Teams Conversation

```text
Johnny Fang 方偉翰, imedtac Corp. added Jason Lin and 3 others to the chat.


 
Johnny Fang 方偉翰, imedtac Corp. changed the group name to AI Triage 討論 w/ 陽交大.


 
Hi all, 與陽交大的實做討論以後可以在這邊溝通
 
Ben Siu 蕭銳輝, imedtac Corp. added Lauren Wang 王瑀蕎, imedtac Corp. to the chat and shared all chat history.


 
大家好, 我跟 Lauren 會是主要負責的技術人員
想要先麻煩陽交大團隊根據今天的討論結果提供兩個 endpoint 的 API 文件, 感謝
 
Jason Lin 多寶 許 想問看的到訊息嗎?
 
可以，沒問題，謝謝 Johnny
 
Ben Siu 蕭銳輝, imedtac Corp.
大家好, 我跟 Lauren 會是主要負責的技術人員 想要先麻煩陽交大團隊根據今天的討論結果提供兩個 endpoint 的 API 文件, 感謝

好的，謝謝
 
另外想問明天或星期一可以拿到範本的內容嗎?
包含先預設的題目跟選項
 
另外在設計上有想請教的，原先有設想到用戶如果答不出來可以略過，想問實務上可以嗎? 如果不行可以取消這個行為
 
以上兩個問題我們確認後回覆
```

## Working Extraction

Participants / roles surfaced in the chat:

- Johnny Fang 方偉翰: opened the Teams chat for implementation discussion with
  NYCU.
- Ben Siu 蕭銳輝: identified himself and Lauren as primary imedtac technical
  contacts.
- Lauren Wang 王瑀蕎: added by Ben as a primary imedtac technical contact.
- Jason Lin: acknowledged the channel and said NYCU would confirm the two
  follow-up questions.
- 多寶 / 許: tagged by Jason for visibility check.

Immediate imedtac asks:

1. Provide the API document for the two endpoints based on today's discussion.
2. Provide template contents by tomorrow or Monday, including the preset
   questions and options.
3. Confirm whether users may skip a question when they cannot answer; if this is
   not clinically or operationally appropriate, imedtac can remove the skip
   behavior.

## Task Routing

The API document ask maps to:

- `../../handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md`
- `../../handoff/api-examples/`

The preset questions and options ask maps to:

- `../../data/question_registry.csv`
- `../../data/api_question_mapping.csv`
- future company-facing question template packet.

The skip behavior question needs review before company response:

- Product / UI: whether iMVS supports a skip action and how skipped answers are
  represented.
- Clinical / safety: which questions are required for safe staff-review summary
  generation and which can be optional.
- API: whether `answer.skipped=true`, `skip_reason`, or a fixed "unable to
  answer" option is safer than a generic skip button.
