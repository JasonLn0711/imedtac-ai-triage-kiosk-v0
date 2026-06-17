---
id: 2026-06-09-to-2026-06-17-duobao-line-architecture-mvp-sync
title: "Jason And Duobao LINE Architecture / MVP Sync"
date: 2026-06-17
topic: ai-triage
type: source
status: active
channel: LINE
confidentiality: internal-collaboration-local-only
source_note: user-provided LINE transcript pasted on 2026-06-17
related:
  - ../2026-06-16-imedtac-teams-question-option-adjustment/source.md
  - ../2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md
  - ../../API.md
  - ../../python_api/README.md
  - ../../python_api/triage_contract.py
  - ../../handoff/2026-05-21-imedtac-two-endpoint-api-reply.md
  - ../../handoff/2026-06-08-dynamic-engine-external-release-gate-closeout.md
---

# Jason And Duobao LINE Architecture / MVP Sync

## Source Boundary

This note preserves the LINE discussion between Jason and
許桓瑜（多寶 / doebow）from `2026-06-09` through `2026-06-17`, as pasted by
Jason on `2026-06-17`. It is a user-provided transcript, not a native LINE
export. Message order and wording are preserved. Times are preserved as
provided; ambiguous AM/PM display should be resolved only if a native export or
screenshot is later provided.

Treat this as internal architecture, branch, and MVP planning evidence. It is
not a company-facing commitment to 慧誠智醫（imedtac Co., Ltd.）unless a separate
Teams / Gmail / meeting record shows the same content was sent externally.

## LINE Transcript

```text
Jun 9, 2026 Tuesday
10:34 許桓瑜（多寶） Hi~我剛剛發現 -ai-triage-kiosk-v0 是public 的?
10:35 阿聖 Jason 改回 private 了～
10:35 阿聖 Jason 忘了關
10:35 阿聖 Jason 我昨天有修
10:35 阿聖 Jason 哈
10:36 許桓瑜（多寶） 對了我現在已經有更新python 的api 了
10:37 許桓瑜（多寶） 你可以看看
10:37 阿聖 Jason 好
10:37 許桓瑜（多寶） 現在應該是有一些基礎功能
10:37 許桓瑜（多寶） 細節應該還要調
10:37 許桓瑜（多寶） 但是現在是可以有function 的(不是只有tachycardia)
10:43 阿聖 Jason 好
10:43 阿聖 Jason 我看一下
10:43 阿聖 Jason v0 嗎
10:43 許桓瑜（多寶） 是啊
10:44 阿聖 Jason 好，我現在有點時間
10:44 阿聖 Jason 我先問一下
10:44 阿聖 Jason 你加上去的是什麼
10:44 阿聖 Jason  ai ?
10:44 許桓瑜（多寶） 沒有
10:44 阿聖 Jason 還是 QA
10:44 許桓瑜（多寶） 只是把題目寫多一點
10:44 許桓瑜（多寶） 而已
10:45 許桓瑜（多寶） 我還沒加上AI
10:45 阿聖 Jason 了解
10:45 許桓瑜（多寶） 我覺得先把可能遇到的狀況先定義好
10:45 許桓瑜（多寶） 下一步再往AI走
10:45 許桓瑜（多寶） 這樣比較可控
10:45 阿聖 Jason 我剛剛有push ai module 上去
10:45 阿聖 Jason 用模組化的方式來做
10:45 許桓瑜（多寶） v0 嗎? 還是原本的?
10:45 阿聖 Jason 題目跟 ai module 是分開的
10:45 阿聖 Jason 這樣就能同步執行
10:46 許桓瑜（多寶） 你AI 主要用在哪裡?
10:46 阿聖 Jason ai module 不想用，也可以拔掉
10:46 阿聖 Jason 很自由
10:46 阿聖 Jason 選擇下一題
10:46 許桓瑜（多寶） 我目前覺得第一個需要AI的地方是最後產生SOAP 的地方
10:46 阿聖 Jason 1. 選擇最優的下一題，
10:46 阿聖 Jason 2. 語音輸入的時候，不用說得很精準，我可以抓的到選項的答案
10:47 阿聖 Jason 3. LLM extraction
10:47 許桓瑜（多寶） 現在有語音輸入了嗎?
10:47 阿聖 Jason 這三個部份
10:47 阿聖 Jason 我有開發出來，但還沒放在這裡，還要測試一下
10:47 許桓瑜（多寶） Okay 你目前是push 到哪裡?
10:48 阿聖 Jason v0 ，但語音還沒 push
10:48 阿聖 Jason 一步一步試試看
10:48 許桓瑜（多寶） 我好像還沒有看到push 上來
10:48 阿聖 Jason 我覺得如果要釋放給慧誠智醫的話，不要一次全部放出去，要維護會很耗時
10:49 許桓瑜（多寶） 你是push 到main 嗎?
10:49 阿聖 Jason 等我一下～上傳中～
10:49 阿聖 Jason 我正在 commit
10:49 許桓瑜（多寶） 喔喔喔了解
10:49 許桓瑜（多寶） 我用AI 產了很多題目
10:50 許桓瑜（多寶） 但是我還沒有仔細review 所有題目
10:50 阿聖 Jason 我覺得要考量我們維護需要的時間，再評估我們要丟多少出去
10:50 阿聖 Jason 嗯嗯，我們先用你給出來的題目
10:51 許桓瑜（多寶） 我是覺得
V1 先fix question, fix choice
V1.5 最後的summary 加上LLM 來做summary

V2 用AI 挑選項
V2.5 用AI 挑問題

V3 語音輸入
10:51 許桓瑜（多寶） 語音輸入前應該要有 pre-V3 文字輸入
10:52 許桓瑜（多寶） 6/15 號demo 可能先做到V 1.5
10:58 許桓瑜（多寶） 我可以稍微問一下AI 的功能主要在哪幾個file 嗎XD
11:00 阿聖 Jason AI 主要在 api/lib/dynamic-engine/ 裡；ai-retrieval-client.js 是候選題 AI 排序核心，routing-policy-engine.js 是安全決策核心，answer-candidate-matcher.js 是語音-文字 pair選項，summary-template-retriever.js + summary-assembler.js 是 AI-supported summary。
11:01 阿聖 Jason 我可以先分成幾個 module 一個一個慢慢釋放
11:01 阿聖 Jason codex 幫我整理了：
11:01 阿聖 Jason AI 功能主要集中在這幾個檔案：

  1. api/lib/dynamic-engine/ai-retrieval-client.js
      - 這是「AI-supported next-question retrieval / rerank」主檔。
      - 目前 demo 版是 local embedding/reranker 模擬：用 context query、vector index、similarity score、reranker score 排候選題。
      - 真正接 Qwen3 Embedding / Reranker 時，主要會從這裡替換或外接 AI service。

  2. api/lib/dynamic-engine/routing-policy-engine.js
      - 這是 safety gate / deterministic policy。
      - AI 只推薦 candidate；這個檔案決定哪些 candidate 是 reviewed、safe、UI 支援、可被正式選為下一題。
      - 醫療 demo 的邊界主要靠這裡守住。

  3. api/lib/dynamic-engine/answer-candidate-matcher.js
      - 這是 ASR / free-text transcript 對應目前題目選項的功能。
      - 重點是它只在 current question 的 allowed options 裡比對，不會跳去別題選項。
      - 回傳 candidate，但都 needs_confirmation: true，不自動送答案。

  4. api/lib/dynamic-engine/summary-template-retriever.js
      - 這是 summary phrase retrieval。
      - 它從 approved summary templates 裡找符合 session effects / reason codes 的句子。
      - 不是生成診斷，而是 retrieval + template assembly。

  5. api/lib/dynamic-engine/sum…
11:02 許桓瑜（多寶） 你習慣寫javascript 嗎?
11:04 阿聖 Jason 應該是說，現階段是把前後端串起來，所以會先以 JS 為主。
11:04 阿聖 Jason 你的意思應該是想寫 Python 那塊 AI 服務？如果之後把 embedding、reranker、LLM 拆成獨立 service，Python 會比較順手。
11:05 許桓瑜（多寶） 我的想法是後端這裡我們應該要統一一個框架
11:05 許桓瑜（多寶） 所以你的想法是各個AI拆成不同的service
11:05 許桓瑜（多寶） 但是主要跟前端接的後端用JS
11:07 阿聖 Jason 我思考一下
11:13 許桓瑜（多寶） 好
11:28 阿聖 Jason 你習慣用 python 嗎
11:28 阿聖 Jason 那我們就統一框架，用你順手的語言
11:29 阿聖 Jason 我把後端改成 FastAPI
11:29 阿聖 Jason 需要一次大改，等我一下
11:30 許桓瑜（多寶） sorry 我比較習慣python
11:31 阿聖 Jason 好，
11:31 阿聖 Jason 我修一下
11:31 許桓瑜（多寶） 我現在push 上面的python_api其實應該已經有實作後段的fastapi了
11:31 許桓瑜（多寶） 你看一下
11:32 阿聖 Jason 我會再接上 Cloudflare tunnel 到我實驗室的 GPU
11:32 阿聖 Jason 到時候用我電腦的 GPU
11:32 阿聖 Jason 就沒問題了
11:34 許桓瑜（多寶） 喔喔喔

Jun 10, 2026 Wednesday
10:05 許桓瑜（多寶） Hi~你這兩天會有空嗎?我覺得我們可以討論一下整個的架構
10:37 阿聖 Jason 明天可以
10:37 阿聖 Jason 上午還是下午呢
10:37 許桓瑜（多寶） 都可以
10:37 許桓瑜（多寶） 你會來實驗室嗎? 還是我們線上討論?
10:42 阿聖 Jason 線上討論
10:42 許桓瑜（多寶） Okay
10:42 許桓瑜（多寶） 那看你要上午還是下午
10:43 阿聖 Jason 我這幾天還在處理喪禮，但你可以先將想討論的東西先列出來～我有空會先看先處理
10:43 阿聖 Jason 上午十一點左右好了
10:43 許桓瑜（多寶） 好~辛苦你了
10:43 許桓瑜（多寶） okay
10:43 阿聖 Jason 我們再開 google meet
10:44 許桓瑜（多寶） Okay
06:25 阿聖 Jason `慧誠智醫案子技術討論`
2026年6月11日（四）11:00-12:00
地點：Google Meet
Meet 連結：
[private Google Meet link redacted]
06:28 許桓瑜（多寶） [private Notion AI_triage link redacted]
06:28 許桓瑜（多寶） 我大致列一下

Jun 11, 2026 Thursday
12:56 阿聖 Jason ai-triage-demo-api-contract-2026-06-11.md
12:57 阿聖 Jason 這份是 0522 跟慧誠智醫 確認過得 api contract
12:58 阿聖 Jason 如果要改 contract 的話，我們之後還需要跟他們討論
12:58 阿聖 Jason 不然他們那邊會接不上
03:18 許桓瑜（多寶） 了解
03:19 許桓瑜（多寶） 那先照這份contract 做

Jun 15, 2026 Monday
12:56 許桓瑜（多寶） 對了我目前這個弄好我先給他們測試一下?
01:17 阿聖 Jason 後段是開你的電腦～？還是連我原本的雲端後端？
01:42 許桓瑜（多寶） 連你原本的雲端好了
01:42 許桓瑜（多寶） 然後讓他們試用一下
01:42 許桓瑜（多寶） 你這周有沒有比較有空?
01:43 阿聖 Jason 我明天試試看
01:43 許桓瑜（多寶） Okay~~
01:43 阿聖 Jason 你先 push 到你的 branch
01:43 阿聖 Jason 我試試看～
01:43 阿聖 Jason 我今天在忙法會，明天試試看
01:43 許桓瑜（多寶） 啊辛苦了
01:44 許桓瑜（多寶） 我想如果你這周如果比較有空的話我們去慧誠看一下
01:44 許桓瑜（多寶） 如果還在忙得話可能下周之類的

Jun 17, 2026 Wednesday
10:51 許桓瑜（多寶） Hi~你有試了嗎？
02:43 阿聖 Jason 我下午處理，處理完我再跟他們回報～
02:43 許桓瑜（多寶） 感謝不好意思，你最近比較忙
03:31 阿聖 Jason 多寶
03:31 阿聖 Jason 我確認一下
03:31 許桓瑜（多寶） 嗯嗯？
03:31 阿聖 Jason 你是 push 到 demo repo 嗎
03:32 許桓瑜（多寶） v0
03:32 阿聖 Jason 好
03:32 許桓瑜（多寶） v0 有一個doebow 的branch
03:32 阿聖 Jason 我看一下
03:32 許桓瑜（多寶） 恩嗯嗯
03:51 阿聖 Jason 我有看到你有新增 api contract 的內容～
03:51 阿聖 Jason 你有跟慧誠智醫說過嗎～
03:51 阿聖 Jason 不然他們呼叫不到
03:51 許桓瑜（多寶） 還沒有
03:52 許桓瑜（多寶） 你有看到python code  了嗎？
03:52 阿聖 Jason 有，我還有一點想問一下
03:52 阿聖 Jason 後來你們討論的進度大致到哪～
03:52 許桓瑜（多寶） 沒有討論
03:52 許桓瑜（多寶） 沒有特別的進度
03:53 許桓瑜（多寶） XD
03:53 許桓瑜（多寶） 就是目前做的東西
03:54 阿聖 Jason 那他們 demo 給美國人看過了嗎
03:54 許桓瑜（多寶） 沒有吧
03:54 許桓瑜（多寶） 他們也都沒有說
03:54 阿聖 Jason 如果還沒，那 api contract 如果要改，感覺會突襲到他們
03:54 阿聖 Jason 我想一下
03:54 許桓瑜（多寶） 我也裝死XD
03:54 阿聖 Jason 哈哈
03:54 許桓瑜（多寶） 有差別很大嗎？
03:54 許桓瑜（多寶） 我應該實際上是照著那個做的
03:55 許桓瑜（多寶） 主要查別應該是數字那裡
03:55 許桓瑜（多寶） 但是我現在已經全部改成單選提了
03:55 阿聖 Jason 是沒有，但工程師要調整，不知道他們怎麼寫的，這取決於他們本來怎麼寫
03:55 阿聖 Jason 了解
03:56 許桓瑜（多寶） 所以理論上應該沒有太大問題
03:56 許桓瑜（多寶） 我覺得先開一個傳給他們看看
03:57 許桓瑜（多寶） 看看他們有啥問題
03:57 阿聖 Jason 他們要補一些你新增設計的 api 呼叫，然後是他們前端的設計可能要調整，試跑一下
03:57 阿聖 Jason 不然他們找不到名字，會叫不到我們
03:58 許桓瑜（多寶） 你大概會忙到什麼時候呢？
03:58 阿聖 Jason 我這兩天到端午節之前都可以
03:58 許桓瑜（多寶） 其實我覺得如果有外國人來的demo我們應該也要到現場看
03:58 許桓瑜（多寶） 才知道到底要改什麼
03:59 許桓瑜（多寶） 那我們明天要不要去他們公司看看
03:59 許桓瑜（多寶） 還是下星期？
03:59 阿聖 Jason 下星期一或二好了
03:59 阿聖 Jason 下週二下午我可以
04:00 許桓瑜（多寶） 那我在群組問下星期二？
04:00 阿聖 Jason 好
04:00 阿聖 Jason 可以問他們一點多～
```

## Working Extraction

### Collaboration And Repo Safety

- On `2026-06-09`, 多寶 noticed that `ai-triage-kiosk-v0` appeared public.
  Jason replied that it had been changed back to private and that the public
  state had been accidental.
- This remains a repo-safety signal: do not put bearer tokens, hospital
  details, private links, or production integration material in tracked files.
- Internal code branches and MVP planning can proceed in this repo, but
  company-facing changes must still route through the external commitment
  control process.

### doebow / Python API Direction

- 多寶 said the Python API had been updated on `2026-06-09`.
- The stated scope was broader than tachycardia: it had basic functionality and
  was not only a tachycardia-only path.
- 多寶 clarified that he had not added AI yet; he had mainly expanded question
  definitions and wanted to define likely clinical/user situations before
  moving toward AI because that path is more controllable.
- Jason later confirmed seeing Python code and API contract additions in the
  `v0` repo / `doebow` branch.
- Jason noted that any added API contract content had not yet been communicated
  to 慧誠智醫, so imedtac would not know to call new names, paths, or fields
  unless the change is explicitly sent and discussed.

### AI Module Discussion

- Jason described the AI work as modular and separable from question content.
- Candidate AI surfaces discussed:
  - next-question selection / retrieval / reranking;
  - ASR or free-text matching to the current question's allowed options;
  - LLM extraction;
  - final SOAP or summary generation.
- 多寶 suggested the first AI value should be in final SOAP generation.
- Jason emphasized staged release: if released to imedtac, do not expose every
  AI module at once because maintenance cost would rise quickly.
- The AI modules Jason described were originally in the JS dynamic-engine layer:
  `ai-retrieval-client.js`, `routing-policy-engine.js`,
  `answer-candidate-matcher.js`, `summary-template-retriever.js`, and
  `summary-assembler.js`.
- The LINE transcript shows a later framework decision: unify the backend
  around Python / FastAPI because 多寶 is more comfortable in Python and had
  already pushed a `python_api` implementation.

### Versioned MVP Ladder Proposed By 多寶

多寶 proposed the following staged product ladder:

```text
V1: fixed questions + fixed choices
V1.5: add LLM support for the final summary / SOAP
V2: use AI to choose options
V2.5: use AI to choose questions
V3: voice input
pre-V3: text input before voice input
```

For the near-term `2026-06-15` demo target, 多寶 suggested reaching around
`V1.5`.

### Contract And External Communication

- On `2026-06-11`, Jason pointed 多寶 to
  `ai-triage-demo-api-contract-2026-06-11.md` and explained that it was the API
  contract already confirmed with 慧誠智醫 on `2026-05-22`.
- Jason emphasized that changing the contract requires later discussion with
  imedtac; otherwise their frontend may fail to connect.
- 多寶 agreed to follow that contract first.
- On `2026-06-17`, Jason again raised that newly added API contract content had
  not been discussed with imedtac and could surprise their engineering team.
- 多寶 said the main difference was probably around numeric input, but by then
  he had changed everything into single-choice questions, which aligns with the
  later Teams discussion that imedtac's current UI should stay within
  single-choice / multi-choice controls.

### Coordination With imedtac

- On `2026-06-15`, 多寶 suggested opening the current work for imedtac testing.
- The preferred runtime target in the LINE discussion became Jason's existing
  cloud backend rather than 多寶's local computer.
- 多寶 suggested visiting 慧誠 in person if a foreign-customer demo is happening,
  because on-site observation would reveal what needs adjustment.
- On `2026-06-17`, Jason and 多寶 aligned to ask the Teams group about visiting
  next Tuesday afternoon, with Jason suggesting asking around `1 PM`.

## Branch And Runtime Status From Current Repo Inspection

Inspection performed from this repo on `2026-06-17`:

```text
current branch: main
main: 78f741d Merge remote-tracking branch 'origin/doebow'
origin/doebow: fe3cf2b Modify quesions
origin/main: 78f741d Merge remote-tracking branch 'origin/doebow'
```

Interpretation:

- The `doebow` branch work has already been merged into current `main`.
- The remote `origin/doebow` branch itself is still at `fe3cf2b`; it does not
  include `main`'s post-merge release-gate / JS dynamic-engine work if checked
  out directly.
- The merge introduced broad question-bank work, `python_api/`, FastAPI
  runtime files, Python tests, and CSV-backed initial/symptom/universal
  question registries.
- The current `python_api/README.md` documents the FastAPI runtime and keeps the
  two canonical endpoints:

```text
POST /api/triage-demo/sessions
POST /api/triage-demo/sessions/{session_key}/answers
```

- The current Python contract layer preserves bearer-token gate behavior,
  CORS for `http://localhost` and `http://localhost:5174`, idempotency retry /
  conflict behavior, and staff-review demo boundary language.
- The Python runtime now supports vital-rule routing beyond tachycardia in
  tests, including fever, low SpO2, bradycardia, hypertension, respiratory-rate
  branches, and terminal `staff_notify` thresholds.

Local verification on `2026-06-17`:

```text
npm test
-> JS unit tests: 33 passed
-> JS contract tests: 41 passed

uv run --project python_api python -m pytest python_api/tests
-> Python FastAPI / v1 engine tests: 27 passed, 1 Starlette/httpx deprecation warning
```

## Consolidated Progress As Of 2026-06-17

### Completed / In Repo

- External v0.2 imedtac API baseline is preserved in repo docs and handoff
  files.
- JS dynamic-engine work had implemented modular AI-support surfaces for
  reranking, routing safety, answer-candidate matching, and summary-template
  assembly.
- doebow's Python/FastAPI branch has been merged into `main`, adding a Python
  runtime, question registry, broader symptom modules, local test UI, and
  tests.
- Teams discussion with imedtac confirms the near-term UI should stay within
  `single_choice` / `multi_choice`; duration/numeric-style content should be
  converted into options for the current demo.
- Teams discussion with imedtac also confirms the tachycardia story they want
  to see: high-heart-rate context, data-dependent question flow, and final
  report using measured vital data.

### Pending / Needs Decision

- Decide whether the MVP runtime to show imedtac is the existing JS cloud
  backend, the Python FastAPI backend, or a compatibility deployment of the
  Python backend behind the exact same two endpoint paths.
- Audit doebow-added API contract content against the already communicated
  `2026-05-22` / `2026-06-11` contract before telling imedtac to test it.
- Confirm whether imedtac has already shown any demo to the US-facing visitor /
  customer group. The LINE discussion suggests Jason and 多寶 do not yet have
  confirmation.
- Decide whether to schedule an on-site imedtac visit next Tuesday afternoon
  and what precise test agenda to bring.

## Recommended Next Step

The safest next step is an MVP compatibility gate, not a broad feature release.

1. Freeze the external contract for the test:
   - keep `/api/triage-demo/sessions`;
   - keep `/api/triage-demo/sessions/{session_key}/answers`;
   - keep `single_choice` / `multi_choice` question rendering;
   - keep `progress.expected_total`;
   - keep `status=question`, `status=summary`, and `staff_review_summary`;
   - do not require imedtac to integrate any new endpoint or numeric widget for
     the first MVP test.
2. Run the current Python API tests and JS contract tests separately.
3. Build a one-page compatibility diff:
   - what is identical to the sent imedtac contract;
   - what is additive but optional;
   - what is changed and therefore needs explicit imedtac confirmation.
4. Deploy only the contract-compatible FastAPI path to Jason's cloud backend or
   existing rehearsal base URL.
5. Send imedtac a short Teams note with:
   - base URL;
   - unchanged endpoint paths;
   - supported question types;
   - the fact that duration has been converted to options;
   - what payload they should test;
   - what feedback NYCU wants from their UI team.
6. Schedule on-site or live-call rehearsal for next Tuesday afternoon, focused
   on actual iMVS UI flow, no-scroll option rendering, summary preview, and
   whether the high-heart-rate demo makes the AI value visible.

## MVP Path

### MVP 0: Contract-Compatible Rehearsal

Goal: imedtac can call NYCU without changing their current integration model.

Scope:

- two endpoints only;
- Python FastAPI or JS backend is acceptable as long as the response contract is
  identical;
- one tachycardia / high-heart-rate lane;
- all patient-facing questions are `single_choice` or `multi_choice`;
- final staff-review summary uses measured vital payload;
- no voice, no free text, no new numeric/time widget.

Exit criteria:

- `POST /sessions` returns first question;
- answer loop reaches `status=summary`;
- CORS works from imedtac's dev origin;
- bearer token works through private delivery;
- imedtac UI can render every question without scroll-breaking labels;
- summary preview works in either iMVS page or a clearly labeled NYCU
  demo-only preview page.

### MVP 1: Broader Fixed-Question Coverage

Goal: demonstrate that the system is not only tachycardia.

Scope:

- vital-rule branches from the Python API: fever, low SpO2, bradycardia,
  hypertension, respiratory-rate cue, and initial-question fallback;
- still fixed question / fixed choice;
- no LLM in patient-facing question selection;
- clinical wording review before company-facing use.

Exit criteria:

- each vital branch has one scripted demo payload and expected first question;
- each branch produces staff-review summary or staff_notify;
- every returned question is UI-compatible with imedtac's current templates.

### MVP 1.5: Staff-Review Summary Assist

Goal: add the first AI-visible capability while preserving safety.

Scope:

- LLM or template-assisted SOAP/staff summary after all fixed choices are
  recorded;
- output constrained to staff-review intake support;
- measured vitals and selected answers must be visible as source facts;
- no diagnosis, formal triage level, treatment, disposition, or autonomous
  clinical decision.

Exit criteria:

- summary cites selected answers and measured vitals;
- forbidden clinical claim checks pass;
- clinical reviewer approves wording for synthetic-data demo use.

### MVP 2+

Use only after MVP 0 / MVP 1.5 are stable with imedtac:

- MVP 2: AI ranks option-level interpretation or next option candidates inside
  reviewed choices.
- MVP 2.5: AI recommends next question, with deterministic safety gate choosing
  only reviewed, UI-supported questions.
- pre-V3: typed free-text answer mapping to current allowed options with
  confirmation required.
- V3: voice input / ASR, only after data-retention, PHI, transcript error,
  patient confirmation, and trade-secret boundaries are approved.

## External Commitment Control

Before asking imedtac to test the doebow/Python work, record the compatibility
decision:

```text
Current external contract:
Proposed runtime/backend:
Endpoint paths unchanged: yes/no
Question types unchanged: yes/no
New request fields required: yes/no
New response fields required: yes/no
Summary payload unchanged: yes/no
CORS/auth unchanged: yes/no
Compatibility risk:
Owner:
Target test date:
```

If any answer is `no`, treat it as a change request and discuss it with imedtac
before their engineers are expected to integrate or test.
