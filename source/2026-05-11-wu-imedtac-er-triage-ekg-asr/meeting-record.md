---
id: 2026-05-11-wu-imedtac-er-triage-ekg-asr-meeting-record
title: "2026-05-11 Meeting Record - Prof. Wu imedtac ER Triage EKG ASR"
date: 2026-05-11
time: "afternoon after seminar Asia/Taipei"
topic: personal
subtopic: sources
type: meeting-record
source: user-provided-transcript
course: ""
keywords: [wu-yute, yu-zong, imedtac, er-triage, ekg, asr, llm, edge-computing, eeg, loreta, meeting-record]
status: active
---

# Meeting Record

## Context

Prof. Wu told 林駿亦 and Jason about a possible collaboration with 慧誠智醫 / imedtac after seminar on `2026-05-11`.

Correction / routing update from Jason on `2026-05-11`: the company name is `慧誠`, not `匯誠`. This is a follow-up to the 吳老師 / 余總 project thread, and the earlier 余總 `triage` discussion refers to this 慧誠 emergency-triage lane.

The proposed product is an emergency-triage support device / workflow. The company or clinical side would collect data through its own device and process, while the academic engineering side would help with signal / questionnaire processing and decision-support software after collection criteria are defined.

## FIRST PRINCIPLE Routing

- Scarce resource: execution bandwidth and evidence, not enthusiasm for a new device idea.
- Canonical home for now: this planning repo owns source capture, status, capacity, and open questions only.
- Future canonical execution home: create or use a standalone project repo only after the company / clinical side confirms the protocol, data access, role split, and first deliverable.
- Relationship to existing work: adjacent to TFDA/FDA, medical cybersecurity, and clinical workflow; separate from `泌尿預診導航`.
- Resolved referent: prior notes/questions about 余總 mentioning `triage` should point here unless a later source names a different triage project.

## Key Points

- 慧誠智醫 / imedtac is seeking collaboration on a product involving questionnaire answers, EKG, SpO2, and possibly other vital signs.
- Company context from official pages: 慧誠智醫 is a Taiwan smart-healthcare / medical-AIoT system company whose service areas include smart hospitals, telemedicine / vital-sign measurement, smart wards, smart operating rooms, medication safety, smart care, and HIS / EMR / IoMT integration.
- The possible output is an emergency-referral / triage report such as whether the patient should go to the ED. Prof. Wu framed it as triage, not diagnosis.
- EKG normal/abnormal classification was identified as a feasible engineering task for 林駿亦.
- Jason's likely area is the questionnaire / ASR / LLM / interaction side: about 10 questions, ASR if needed, and connection with EKG or SpO2 data.
- Hardware is not the academic team's responsibility. Prof. Wu said the company has its own device.
- The hardest part is case collection. Prof. Wu estimated this is at least a half-year-after-opening matter because enough cases must be collected before training.
- The collection protocol must be defined before useful modeling: EKG duration, question set, SpO2 handling, and other vital signs.
- The clinical triage SOP / criteria should come from the company / clinical side, not be invented by the engineering team.
- Whether an LLM is needed remains unsettled. 林駿亦 questioned whether a direct touch UI or nurse-led questioning would avoid unnecessary LLM complexity. Prof. Wu noted the company may want to save nursing labor and support older patients who may not use a touch UI easily.
- Edge computing may be needed if EKG classification runs near the device.
- First deployment is expected to be Taiwan and Southeast Asia before the US because US cybersecurity requirements may be high.
- Prof. Wu suggested rough triage accuracy may not need to be diagnostic-grade; the example threshold discussed was around 0.8 if the task is only triage. This is a discussion note, not an accepted product requirement.
- Discussion language with the company can be Chinese because 慧誠智醫 is a Taiwanese company.
- A separate EEG LORETA thread was mentioned: LORETA is low-resolution tomography and an inverse problem; the original Matlab implementation cannot be commercialized directly.

## Decisions / Working Assumptions

- Keep this as a captured opportunity and contact-window lane, not a W20 implementation sprint.
- Treat hardware, collection operation, clinical criteria, and data ownership as external dependencies until confirmed.
- Treat "LLM required" as an open hypothesis, not a requirement.
- Treat "triage only, not diagnosis" as the current safety boundary.
- Keep EEG / LORETA separate from the 慧誠 ED triage lane.

## Open Questions For The Next Company / Prof. Wu Sync

- What is the exact product name / device name / contact window inside 慧誠智醫?
- What device exists today, and what data can it export?
- Who operates the device: patient, family, nurse, EMT, or mixed workflow?
- What exact workflow bottleneck is the product meant to relieve: nurse workload, physician decision time, ED triage congestion, remote-care monitoring, or patient self-reporting?
- Is the questionnaire fixed? If yes, who owns the 10 questions and clinical logic?
- Is ASR truly required, or is touch / nurse-assisted entry sufficient for v0?
- Is an LLM required, or can a rules / questionnaire / classifier pipeline cover v0?
- What EKG lead / format / sampling rate / duration will be collected?
- What SpO2, heart rate, respiratory rate, height, weight, or other vital signs are required?
- What is the gold-standard label: ED referral, triage level, physician judgment, normal/abnormal EKG, or later outcome?
- What data-cleaning / normalization / ETL path exists before model work?
- Which integration route matters first: standalone report, HIS / EMR writeback, FHIR/HL7 API, vendor cloud, or manual review screen?
- What is the collection protocol, consent / IRB status, de-identification plan, and data-retention rule?
- What audit trail, explanation, and clinician override record are required for trust?
- What cybersecurity boundary applies to the device, edge node, cloud platform, and hospital network connection?
- Who pays for the system, and what deployment evidence would a hospital buyer need?
- Who is the real buyer, and who can veto adoption: physicians, nurses, information office, legal, procurement, hospital leadership, or quality/safety office?
- What ROI metric matters most: labor saving, triage time, throughput, error reduction, burnout reduction, readmission reduction, or risk control?
- Who owns long-term maintenance: model/rule updates, device calibration, OS/security patches, workflow drift, regulatory drift, and support?
- Who owns the data, and can it be reused for training, product improvement, publication, or regulatory evidence?
- How is liability allocated if a triage suggestion is wrong or ignored?
- Is the durable business value a single EKG/triage feature, or a reusable smart-hospital infrastructure layer?
- What is the expected first deliverable from 林駿亦 and Jason: consultation, protocol review, model prototype, feasibility memo, or meeting attendance only?
- Which market is first: Taiwan, Southeast Asia, or another region?
- What regulatory / cybersecurity assumptions are in scope before any external claim?

## Risks

- Data scarcity: no model work is meaningful before enough labeled cases exist.
- Label ambiguity: "should go to ED" must be tied to clinical criteria or physician triage labels.
- Workflow ambiguity: patient self-service, nurse-led questioning, ASR, and touch UI imply different product and safety designs.
- Overclaim risk: triage support can drift into diagnosis or emergency medical advice if wording is not controlled.
- Regulatory / cybersecurity risk: device, clinical decision support, EKG classification, ASR, and possible LLM use may trigger product evidence and security obligations.
- Integration risk: hospital systems may require HL7/FHIR/DICOM/PACS/HIS/EMR or proprietary interfaces, and this may dominate model difficulty.
- Trust risk: the buyer may need reliability, governance, support, accountability, and explainable audit trails more than raw accuracy.
- Capacity risk: W20 already has FSI:DI submission, Prof. Wu CDE handoff, Pikachu demo, Threads gate, and KBS reviewer duty.

## Planning Links

- Planning locator: `../planning-everything-track/data/projects/2026-05-imedtac-er-triage-ekg-asr.md`
- Source bundle: `source/2026-05-11-wu-imedtac-er-triage-ekg-asr/source.md`
- Transcript: `source/2026-05-11-wu-imedtac-er-triage-ekg-asr/transcript.txt`

## Next Action

Ask Prof. Wu for the next smallest commitment: whether Jason and 林駿亦 should join a company sync as contact windows, prepare a one-page technical-question list, or simply wait until 慧誠 confirms collection protocol and data availability.
