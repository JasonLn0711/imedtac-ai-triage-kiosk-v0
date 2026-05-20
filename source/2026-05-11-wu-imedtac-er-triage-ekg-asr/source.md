---
id: 2026-05-11-wu-imedtac-er-triage-ekg-asr-source
title: "2026-05-11 Prof. Wu imedtac ER Triage EKG ASR Discussion"
date: 2026-05-11
time: "afternoon after seminar Asia/Taipei"
topic: personal
subtopic: sources
type: source-bundle
source: user-provided-transcript
course: ""
keywords: [wu-yute, yu-zong, imedtac, er-triage, ekg, asr, llm, edge-computing, eeg, loreta]
status: active
participants:
  - Wu, YuTe
  - Lin, Jun-Yi
  - Jason
topics:
  - imedtac emergency triage device collaboration
  - EKG normal/abnormal classification
  - ASR or touch-based questionnaire
  - LLM necessity and human-workflow question
  - collection protocol and case accrual dependency
  - Southeast Asia and Taiwan first deployment hypothesis
  - EEG LORETA inverse-problem note
transcript_file: transcript.txt
meeting_record_file: meeting-record.md
---

# Source

This folder stores the user-provided transcript for the `2026-05-11` afternoon discussion after seminar among Prof. Wu, 林駿亦, and Jason.

Correction on `2026-05-11`: the company name is `慧誠`, not `匯誠`. User also clarified that this is a follow-up to the 吳老師 / 余總 project thread, and that the earlier 余總 `triage` remark refers to this lane.

## Why this source is kept

The discussion clarified the next visible step in the 吳老師 / 余總 / 慧誠 project thread. It is adjacent to the existing medical-device cybersecurity, TFDA/FDA, and clinical-workflow projects, but it is not the same as the `泌尿預診導航` previsit lane.

The planning significance is:

- Prof. Wu wants 林駿亦 and Jason to act as the technical/contact window and learn industry collaboration.
- The earlier 余總 `triage` mention should now be routed here, not treated as an unresolved separate remark.
- The product direction is emergency triage support, not diagnosis: collect questionnaire answers plus EKG / SpO2 / vital-sign signals and output whether ED referral or triage escalation is needed.
- Hardware and data collection are the company / clinical-side responsibility; the academic engineering side should focus on data processing, classification, ASR/interaction feasibility, and software decision logic after criteria are defined.
- The main blocker is case accrual and collection protocol definition. Prof. Wu estimated model training is at least about half a year after case opening, because enough cases must be collected first.
- The actual user workflow is unresolved: direct patient self-service via tablet/device, nurse-led questionnaire, touch UI, ASR, and whether an LLM is needed all require confirmation with the company and clinical site.
- Official company context from `https://www.imedtac.com/`: 慧誠智醫 / imedtac is a smart-healthcare / medical-AIoT company, with official service areas including smart hospitals, telemedicine / vital-sign measurement, smart wards, smart operating rooms, medication safety, smart care, and HIS / EMR / IoMT integration. This supports treating the lane as workflow / integration / device-data collaboration, not a pure AI-model project.
- A separate EEG / LORETA commercialization thread was briefly mentioned; keep it as a separate follow-up note, not part of the 慧誠 ED triage product.

## Files

- `transcript.txt`: cleaned transcript provided by the user.
- `meeting-record.md`: structured meeting record with decisions, open questions, risks, and planning links.

No audio file is stored in this repo.
