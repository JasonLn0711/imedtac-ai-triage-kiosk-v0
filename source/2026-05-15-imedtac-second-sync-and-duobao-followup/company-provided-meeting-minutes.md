---
id: 2026-05-15-imedtac-company-provided-meeting-minutes
title: "2026-05-15 imedtac-Provided Meeting Minutes And Comparison"
date: 2026-05-15
time: "15:25 Asia/Taipei"
topic: personal
subtopic: sources
type: company-provided-minutes
source: company-provided-email-pdf
keywords: [imedtac, imedtac, ai-triage, meeting-minutes, urgent-care, june-demo, action-items, comparison]
status: active
source_id: IMEDTAC-MINUTES-20260515
pdf_file: assets/2026-05-15-imedtac-company-meeting-minutes-email.pdf
extracted_text_file: extracted/2026-05-15-imedtac-company-meeting-minutes-email.txt
related_internal_record: meeting-record.md
---

# 慧誠版本會議記錄與差異分析

This note records 慧誠智醫's own post-meeting minutes from Johnny Fang's
`2026-05-15 15:25` email and compares them against our internal meeting record.

The complete original email is preserved as:

- PDF: `assets/2026-05-15-imedtac-company-meeting-minutes-email.pdf`
- Searchable text: `extracted/2026-05-15-imedtac-company-meeting-minutes-email.txt`

## Email Context

- Sender: Johnny Fang / 方偉翰, imedtac Corp.
- Sent: `2026-05-15 15:25`
- Direct recipients: Jason Lin and Jason Miao
- CC: Ken Yu and Prof. Wu
- Johnny noted that Jason can add 許醫師 to the email loop if needed.
- The email includes a confidentiality notice; keep this source local unless the
  project owner explicitly clears sharing.

## 慧誠智醫的觀點

慧誠把本次會議整理成三個核心層次。

### 1. AI Triage Scope

慧誠的記錄把設計目標明確放在：

- 國外 urgent-care 場景；
- AI triage 系統；
- 短期先服務六月美國客戶來訪 demo。

Their working priority is therefore market/demo readiness, not a full clinical
deployment.

### 2. AI Design Direction

慧誠列出的設計方向是：

- prepare `3-5` demo patient / injury cases;
- example case families include trauma, chronic disease, and allergy;
- plan how those cases produce a more complete interpretation result;
- user interaction can be touch-option selection plus partial voice input;
- keep the question count within `8-10`;
- combine data and answers into a patient chief-complaint summary for doctors.

Important wording:

- `比較完整的解讀結果` may be broader than our safer phrase
  `clinician-review intake summary`.
- `主訴摘要內容給醫生` aligns well with our safer output boundary.

### 3. Action Items

慧誠 assigns itself:

- workflow / spec planning;
- technical discussion / design modification;
- after internal discussion, arrange a NYCU-to-imedtac technical-side sync next
  week as soon as possible.

慧誠 assigns NYCU:

- research `3-5` demo cases;
- perform an `AI 資料訓練 study`;
- design the technical architecture.

## 與我們內部會議記錄一致的地方

| Topic | 慧誠 version | Our internal record |
| --- | --- | --- |
| Market frame | Foreign urgent-care AI triage. | US-style urgent-care intake, not Taiwan ED replacement. |
| Near-term goal | June US-customer demo. | June demo first, not full all-specialty product. |
| Case count | `3-5` demo cases. | Start with `2-3`, then expand to `3-5`. |
| Interaction style | Touch options plus partial voice input. | Guided touch flow plus optional ASR/free-text supplement. |
| Question budget | `8-10` questions. | Roughly `6-10`; case-pack drafts used `5-8` as a working floor. |
| Output | Chief-complaint summary for doctors. | Clinician-review intake summary. |
| Next technical step | Imedtac internal spec/design, then technical sync with NYCU. | Need kiosk UI insertion point, vital payload, output format, and software-team contact. |

## 需要確認的差異

| Confirmation item | Why it matters | Suggested confirmation wording |
| --- | --- | --- |
| `AI 資料訓練 study` | This could mean real model training, synthetic case preparation, or research on training data requirements. We should avoid promising real patient-data training before data governance exists. | "這裡的 AI 資料訓練 study，我們先理解成 demo case / synthetic data / model-feasibility study，不是使用真實病患資料訓練，這樣對嗎？" |
| `比較完整的解讀結果` | This phrase could drift into diagnosis or triage-level assignment. Our boundary is summary for clinician review. | "六月 demo 的輸出先以主訴摘要、vital sign、重要問答、staff/doctor review signal 為主，不做診斷、治療建議或最終 triage level，這樣是否符合你們期待？" |
| Case examples: trauma / chronic disease / allergy | Their examples differ from our first case set: fever/respiratory, abdominal pain + fever, tachycardia/chest tightness, low SpO2. Some examples have weaker vital-sign linkage unless carefully designed. | "3-5 個 case 是否希望優先貼近外傷、慢性病、過敏？還是先選最能展示 vital sign 影響問題流程的 fever/respiratory、abdominal pain、tachycardia/low SpO2？" |
| Question count | 慧誠 says `8-10`; our internal design should align to this as an upper bound. | "我們先把問答控制在 8-10 題內，並讓部分固定問題可在量測時並行，是否 OK？" |
| Compute architecture | Company minutes omit the networked/external-compute allowance discussed in the meeting. | "六月 demo 是否可先用網路呼叫外部主機/API，等 demo 後再評估地端低成本部署？" |
| Imedtac spec/design inputs | Their action item says Imedtac will discuss internally first, but NYCU still needs concrete fields to start. | "下次技術對接前，是否可以先提供 UI flow、vital payload 欄位、demo 顯示位置、以及 output 格式期待？" |
| 許醫師 email loop | Johnny explicitly invited adding 許醫師 if needed. | "若後續 case / clinical wording 要多寶協助，是否可以把許醫師加入 email loop？" |

## Recommended Reply Direction

Reply with alignment first, then confirm the ambiguous items:

1. Agree that the short-term scope is June demo for foreign urgent care.
2. Confirm that NYCU will prepare `3-5` synthetic demo cases plus technical
   architecture.
3. State the safety boundary:
   - clinician-review summary only;
   - no diagnosis;
   - no treatment / medication / test-order recommendation;
   - no final triage-level claim in v0.
4. Ask whether `AI 資料訓練 study` means synthetic demo-data / model-feasibility
   study rather than real patient-data training.
5. Ask 慧誠 to provide the technical inputs before next week's sync:
   - kiosk UI flow;
   - vital payload fields;
   - where the AI interaction appears;
   - output display format;
   - whether external compute/API is acceptable for June.
6. Ask whether to add 許醫師 to the loop.

## Effect On Our Next Step

This email does not overturn our internal interpretation. It tightens it:

- Use `8-10` questions as the hard upper bound.
- Include at least one case that matches 慧誠's examples if clinically useful,
  likely allergy or chronic disease, but only if the vital-sign story is clear.
- Keep the first implementation focused on synthetic demo cases and architecture,
  not broad model training.
- Prepare the technical sync question list now, because 慧誠 expects technical
  alignment next week.
