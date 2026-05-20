---
id: 2026-05-15-duobao-demo-case-draft
title: "2026-05-15 Duobao Demo Case Draft"
date: 2026-05-15
time: "16:42-17:03 Asia/Taipei"
topic: ai-triage
subtopic: sources
type: clinical-case-draft-source
source: user-provided-line-log-and-duobao-pdf
keywords: [duobao, demo-case, urgent-care, ai-triage, cholecystitis, afrvr, pneumonia, uri]
status: active
pdf_file: assets/2026-05-15-duobao-demo-case-draft.pdf
extracted_text_file: extracted/2026-05-15-duobao-demo-case-draft.txt
---

# 多寶 Demo Case Draft

This note preserves 多寶's same-day LINE handoff and the four demo cases from
his `Demo Case.docx` / PDF export.

The PDF is preserved as:

- `assets/2026-05-15-duobao-demo-case-draft.pdf`
- `extracted/2026-05-15-duobao-demo-case-draft.txt`

## LINE Handoff

Timestamps and wording are preserved as provided by the user.

```text
04:42 許桓瑜（多寶） Demo Case.docx
04:42 許桓瑜（多寶） 我簡單寫了幾個case
04:52 許桓瑜（多寶） 我覺得可以先用這幾個case 試試看
04:55 許桓瑜（多寶） 這些是case 簡單的資料，接下來可以再寫多一點
05:02 阿聖 Jason 了解，我看一下
05:02 許桓瑜（多寶） 我可能寫的太一學了
05:02 許桓瑜（多寶） 太醫學了
05:02 許桓瑜（多寶） 我的想法是最後會產生這種東西
05:03 許桓瑜（多寶） 這個醫師基本上看一眼就懂
05:03 阿聖 Jason 沒關係，我搭配你跟我討論過的內容，問一下 gpt
05:03 許桓瑜（多寶） 嗯嗯嗯~~
05:03 阿聖 Jason 我應該可以寫成簡單系統
```

## Case Drafts

These are transcribed from the PDF extraction. They are demo source material,
not validated triage rules.

| Case | Patient | Vital signs | Chief complaint | History | Allergy | Draft level |
| --- | --- | --- | --- | --- | --- | --- |
| Acute cholecystitis | `40 y/o M` | `T/P/R: 38.5/98/16`, `SpO2: 99%`, `BP 123/81 mmHg` | Fever with RUQ abdominal pain for 1 day | nil | nil | `3` |
| AfRVR | `76 y/o F` | `T/P/R: 36.5/150/16`, `SpO2: 98%`, `BP 102/68 mmHg` | Palpitation and chest tightness for half day | arrhythmia, hyperlipidemia | peanut | `2` |
| Pneumonia | `80 y/o M` | `T/P/R: 38.5/102/23`, `SpO2: 92%`, `BP 123/81 mmHg` | Dyspnea for 2 days | DM, HTN | penicillin | `2` |
| URI | `26 y/o F` | `T/P/R: 37.5/98/21`, `SpO2: 98%`, `BP 124/76 mmHg` | Fever for 2 days, cough and runny nose | nil | nil | `5` |

## Interpretation

多寶 explicitly noted that these may be "too medical." That is useful: the
cases are best treated as clinician-readable target summaries and design
anchors, not as the exact patient-facing kiosk text.

Use the diagnoses in parentheses only as private scenario labels while building
the demo. The patient-facing and customer-facing system should output:

- chief complaint;
- measured vital signs;
- key positives / negatives from short questions;
- staff / clinician review signal;
- source and demo boundary.

Do not output:

- diagnosis names as the system's conclusion;
- treatment advice;
- test orders;
- final triage level;
- "safe to go home" style disposition.

## Immediate Design Impact

This draft confirms that the first June demo case set can be:

1. abdominal pain + fever;
2. tachycardia / chest tightness;
3. dyspnea + fever + low SpO2;
4. low-acuity URI.

The set covers both high-review cases and one low-acuity case, which is useful
for showing that the kiosk can produce different review priorities without
claiming autonomous triage.
