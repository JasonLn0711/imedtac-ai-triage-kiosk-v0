# Source Index

This repo is now the complete local archive for the 慧誠智醫 AI triage kiosk
demo lane and its direct upstream Prof. Wu context.

## Core Triage Sources

| Date | Source | Why it matters |
| --- | --- | --- |
| `2026-05-11` | `source/2026-05-11-wu-huicheng-er-triage-ekg-asr/` | Prof. Wu introduced the 慧誠 / imedtac emergency-triage collaboration, role split, EKG / SpO2 / ASR / LLM questions, case-accrual dependency, and triage-not-diagnosis boundary. |
| `2026-05-12` | `source/2026-05-12-huicheng-company-ai-triage-sync/` | Company-side sync clarified the kiosk / web service / middleware / RESTful API / FHIR / HIS / EMR context, June US customer demo pressure, English-first voice-input long-term target, and vital-aware triage differentiator. |
| `2026-05-12 22:20` | `source/2026-05-12-wu-google-meet-ai-triage-510k/` | Prof. Wu reframed the next step after the company sync: first find comparable FDA `510(k)` summaries and `indication for use` boundaries before promising vital-sign-integrated AI triage. |
| `2026-05-13` | `source/2026-05-13-johnny-line-friday-huicheng-sync/` | Johnny Fang scheduled `AI triage 可行性討論` for Friday `2026-05-15 13:00-14:00` on Google Meet `cjk-iwzq-cmz` for physiological-data integration and all-specialty technical evaluation; invite 多寶 through a confirmed contact route. |
| `2026-05-13` | `source/2026-05-13-duobao-line-huicheng-vital-sign-triage/` | 多寶 provided clinical calibration: vital signs are strongest for emergency triage / internal-medicine-style review, unstable vitals can raise urgency, urology has more limited vital-sign impact, and a Thursday afternoon follow-up discussion is tentatively useful. |
| `2026-05-14` | `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/` | Prof. Wu forwarded a GPT-generated DOCX proposing a vital-sign + questionnaire product design centered on family medicine / general internal medicine, a 10-question intake, rule-engine red flags, and draft adult numeric thresholds; treat as context-only until source-backed and clinically reviewed. |
| `2026-05-15` | `source/2026-05-15-huicheng-second-sync-and-duobao-followup/` | Second 慧誠智醫 sync plus 多寶 follow-up. This converted the Friday feasibility discussion into a June demo plan: US-style urgent care, `3-5` synthetic vital-sign-aligned cases, guided intake plus optional ASR, networked/external compute acceptable for demo, and clinician-review summary only. |
| `2026-05-15 15:25` | `source/2026-05-15-huicheng-second-sync-and-duobao-followup/company-provided-meeting-minutes.md` | Johnny Fang's company-side meeting minutes. Confirms urgent-care / June-demo / `3-5` cases / `8-10` questions / touch plus partial voice input, and creates confirmation needs around `AI 資料訓練 study`, output wording, case categories, external compute, and adding 許醫師 to the email loop. |
| `2026-05-15 16:42` | `source/2026-05-15-huicheng-second-sync-and-duobao-followup/duobao-demo-case-draft.md` | 多寶's first clinical case draft and LINE handoff. Provides four diagnosis-shaped design anchors: acute cholecystitis, AfRVR, pneumonia, and URI, to be converted into demo-safe clinician-review summaries rather than diagnosis outputs. |
| `2026-05-19 16:52` | `source/2026-05-19-johnny-ai-triage-product-spec/` | Johnny Fang's email plus the linked `iMVS AI Triage 智慧檢傷分流系統_20260515` product spec. A later standalone Downloads PDF with the same title was verified as byte-identical to the archived product-spec PDF. Confirms mid-June customer-demo priority, HIS summary writeback as out-of-scope for this demo, voice input as conditional, and the immediate API contract need: iMVS vital payload -> NYCU typed question/session response -> iMVS answer/session loop -> next question or demo staff-summary output. |
| `2026-05-19 16:56-18:06` | `source/2026-05-19-johnny-line-thursday-engineering-sync/` | Johnny's LINE group follow-up after sending the product spec. User clarified the LINE times are afternoon / PM. Johnny says engineers need an API design document, asks when it can be provided, and asks to discuss progress on Thursday with the engineering design team. Jason added 許桓瑜（多寶） to the group. Johnny later confirmed Thursday `2026-05-21 10:00` on Microsoft Teams and provided meeting access details, preserved local-only in the source. |
| `2026-05-19 17:19-17:50` | `source/2026-05-19-duobao-line-thursday-engineering-sync/` | Jason coordinated with 多寶 for the Thursday engineering sync. 多寶 was available, provided email, received the forwarded materials, and the meeting was confirmed for Thursday `2026-05-21 10:00` pending the 慧誠 meeting link. |
| `2026-05-19 17:24-17:49` | `source/2026-05-19-johnny-direct-line-thursday-engineering-sync/` | Johnny clarified the spec's triage standards and presentation logic are AI-discussed drafts and adjustable in practice. Jason coordinated 許醫師 / 多寶 inclusion, forwarded the email, shared the email address, and finalized Thursday `10:00` as the sync time. |
| `2026-05-19` | `source/2026-05-19-expert-review-scope-api-boundary/` | Expert reply after reviewing the project packet. Confirms the scope cut is appropriate if framed as `synthetic-data vital-aware intake + staff-review summary`, not clinical triage product. Adds required v0.2 deltas: runtime enforcement, clinical stop rule, field dictionary, failure fallback, UI wording lock, `review_action` replacing `plan_support`, staff-only summary, handoff flags, and privacy/security owner/date closeout. |
| `2026-05-19` | `source/2026-05-19-expert-review-v02-freeze-gate/` | Second expert reply on the v0.2 freeze gate. Confirms the demo can proceed but API v0.2 is not frozen; adds timestamp correction, API question-to-registry mapping, respiratory flow registry alignment, per-vital quality preference, expanded error examples, `assessment_support` -> `review_basis`, case/fixture/question/wording versions, and owner/date/fallback closeout for Thursday. |
| `2026-05-19` | `source/2026-05-19-duobao-two-phase-vital-questioning/` | User-provided clarification of 多寶's two-phase question-flow insight: ask non-vital-dependent questions while vital signs are being measured, then use measured vital values to choose the second-stage follow-up. This becomes the preferred API/UI design if 慧誠 can support it without disrupting measurement quality. |

The `2026-05-12` source folder now also contains Johnny Fang's company-side
follow-up package:

- `assets/2026-05-12-huicheng-ai-triage-followup-email.pdf`
- `assets/2026-05-12-imvs-product-spec-v2.0.4.docx`
- `assets/2026-05-12-imvs-api-v1.4-eng.pdf`
- `extracted/` searchable text outputs

Derived analysis:

- `docs/2026-05-12-huicheng-materials-analysis.md`
- `source/2026-05-12-huicheng-company-ai-triage-sync/meeting-record.md` is the complete structured afternoon meeting record for the 慧誠智醫 x NYCU AI-Triage cooperation discussion. It now uses the user-specified structure and captures system background, company expectations, Jason's urology demo, all-specialty modularity, symptom wording provenance, vital-sign decision mapping, June demo pressure, follow-up action items, and the workflow-integration interpretation.
- `workstreams/05-thursday-vital-sign-research-gate.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/meeting-record.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-summary.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-extended-analysis.md`
- `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/extracted/2026-05-14-wu-gpt-vital-sign-questionnaire-triage-product-design.txt`
- `source/2026-05-15-huicheng-second-sync-and-duobao-followup/meeting-record.md`
- `source/2026-05-15-huicheng-second-sync-and-duobao-followup/company-provided-meeting-minutes.md`
- `source/2026-05-15-huicheng-second-sync-and-duobao-followup/duobao-demo-case-draft.md`
- `workstreams/08-june-demo-case-and-integration-plan.md`
- `handoff/2026-05-15-june-demo-case-pack-v0.md`
- `docs/literature-matrix-workflow.md`
- `source/2026-05-19-johnny-ai-triage-product-spec/source.md`
- `docs/2026-05-19-ai-triage-product-spec-api-analysis.md`
- `source/2026-05-19-johnny-line-thursday-engineering-sync/source.md`
- `source/2026-05-19-duobao-line-thursday-engineering-sync/source.md`
- `source/2026-05-19-johnny-direct-line-thursday-engineering-sync/source.md`
- `source/2026-05-19-expert-review-scope-api-boundary/source.md`
- `source/2026-05-19-expert-review-v02-freeze-gate/source.md`
- `source/2026-05-19-duobao-two-phase-vital-questioning/source.md`
- `docs/2026-05-19-expert-review-action-plan.md`
- `docs/2026-05-19-two-phase-question-flow-design.md`
- `docs/2026-05-19-api-session-design-plain-explanation.md`
- `docs/version-control-policy.md`
- `data/version_manifest.json`
- `handoff/2026-05-21-huicheng-engineering-sync-prep.md`
- `handoff/2026-05-21-imvs-nycu-api-design-v0.1.md`
- `handoff/2026-05-21-decision-defaults-and-owner-matrix.md`
- `handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`
- `handoff/api-examples/`

## Upstream Prof. Wu Context

| Date | Source | Relationship to this repo |
| --- | --- | --- |
| `2026-04-16` | `source/upstream-wu-context/2026-04-16-wu-yute-tomi-meeting/` | Upstream meeting that created the urology smart-previsit, medical cybersecurity, and patent/UI work threads. It is not the 慧誠 triage project itself, but it explains why urology previsit and medical-device integration became reusable context. |
| `2026-04-20` | `source/upstream-wu-context/2026-04-20-cde-prof-wu-clinical-medical-device-it-cybersecurity-speech/` | Prof. Wu / CDE medical-device cybersecurity speech context. It is adjacent because hospital-side cybersecurity, FDA/TFDA framing, HIS/EMR constraints, and vendor/hospital handoff are relevant to any future product claim. |

## Planning-Bridge Snapshots

| File | Purpose |
| --- | --- |
| `planning-bridge/2026-05-huicheng-er-triage-ekg-asr.md` | Full planning locator snapshot for this execution repo. |
| `planning-bridge/project-locators/2026-05-huicheng-er-triage-ekg-asr.md` | Same project locator kept with other related project snapshots. |
| `planning-bridge/project-locators/2026-04-urology-ai-previsit-interview.md` | Urology reference project snapshot, useful because the current triage demo may reuse structured previsit intake concepts. |
| `planning-bridge/project-locators/2026-04-tfda-fda-regulatory-advisor.md` | Regulatory memory-system snapshot. This is adjacent source-governance context, not triage logic. |
| `planning-bridge/project-locators/2026-04-medical-cybersecurity-tfda-fda-industry-deck.md` | Medical cybersecurity / CDE / TFDA-FDA deck snapshot. This preserves Prof. Wu handoff context and hospital-side cybersecurity frame. |

## Source Rules

- Treat `source/` files as copied evidence and meeting context.
- Do not rewrite transcripts.
- If a source contains confidential or private material, keep it local unless the
  project owner explicitly approves sharing.
- Use `docs/` and `workstreams/` for interpretation, planning, and derived
  architecture.
- Planning repo gets status and locator updates only.
