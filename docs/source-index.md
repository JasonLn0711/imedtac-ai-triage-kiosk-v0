# Source Index

This repo is now the complete local archive for the 慧誠智醫 AI triage kiosk
demo lane and its direct upstream Prof. Wu context.

## Core Triage Sources

| Date | Source | Why it matters |
| --- | --- | --- |
| `2026-05-11` | `source/2026-05-11-wu-imedtac-er-triage-ekg-asr/` | Prof. Wu introduced the 慧誠 / imedtac emergency-triage collaboration, role split, EKG / SpO2 / ASR / LLM questions, case-accrual dependency, and triage-not-diagnosis boundary. |
| `2026-05-12` | `source/2026-05-12-imedtac-company-ai-triage-sync/` | Company-side sync clarified the kiosk / web service / middleware / RESTful API / FHIR / HIS / EMR context, June US customer demo pressure, English-first voice-input long-term target, and vital-aware triage differentiator. The follow-up package also provides the iMVS Product Spec `V2.0.4` and iMVS API `V1.4` baseline for hardware modules, Vital Upload fields, and units. |
| `2026-05-12 22:20` | `source/2026-05-12-wu-google-meet-ai-triage-510k/` | Prof. Wu reframed the next step after the company sync: first find comparable FDA `510(k)` summaries and `indication for use` boundaries before promising vital-sign-integrated AI triage. |
| `2026-05-13` | `source/2026-05-13-johnny-line-friday-imedtac-sync/` | Johnny Fang scheduled `AI triage 可行性討論` for Friday `2026-05-15 13:00-14:00` on Google Meet `cjk-iwzq-cmz` for physiological-data integration and all-specialty technical evaluation; invite 多寶 through a confirmed contact route. |
| `2026-05-13` | `source/2026-05-13-duobao-line-imedtac-vital-sign-triage/` | 多寶 provided clinical calibration: vital signs are strongest for emergency triage / internal-medicine-style review, unstable vitals can raise urgency, urology has more limited vital-sign impact, and a Thursday afternoon follow-up discussion is tentatively useful. |
| `2026-05-14` | `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/` | Prof. Wu forwarded a GPT-generated DOCX proposing a vital-sign + questionnaire product design centered on family medicine / general internal medicine, a 10-question intake, rule-engine red flags, and draft adult numeric thresholds; treat as context-only until source-backed and clinically reviewed. |
| `2026-05-15` | `source/2026-05-15-imedtac-second-sync-and-duobao-followup/` | Second 慧誠智醫 sync plus 多寶 follow-up. This converted the Friday feasibility discussion into a June demo plan: US-style urgent care, `3-5` synthetic vital-sign-aligned cases, guided intake plus optional ASR, networked/external compute acceptable for demo, and clinician-review summary only. |
| `2026-05-15 15:25` | `source/2026-05-15-imedtac-second-sync-and-duobao-followup/company-provided-meeting-minutes.md` | Johnny Fang's company-side meeting minutes. Confirms urgent-care / June-demo / `3-5` cases / `8-10` questions / touch plus partial voice input, and creates confirmation needs around `AI 資料訓練 study`, output wording, case categories, external compute, and adding 許醫師 to the email loop. |
| `2026-05-21 09:50` | `source/2026-05-15-imedtac-second-sync-and-duobao-followup/pre-sync-thread-snapshot-2026-05-21.md` | Gmail thread snapshot exported before the 5/21 engineering sync. Extends the original 5/15 Johnny minutes with the 5/20 NYCU API v0.2 pre-read reply and Johnny's 5/21 reply adding Ben Siu from imedtac engineering, confirming the meeting should close API field dictionary, UI insertion point, `session_key`, Phase 1 feasibility, first respiratory case wording, and delivery timing. |
| `2026-05-21 09:59` | `source/2026-05-21-imedtac-engineering-sync/` | 慧誠智醫 / NYCU engineering sync source bundle. Preserves the corrected GPT transcript and user-provided meeting record, and records the post-sync decision that June should use a conservative post-measurement iMVS vital payload -> NYCU question loop -> staff-review summary flow, with Endpoint 1/3 merged for June, voice out of scope, local scripted fallback required, and case design split between respiratory synthetic and tachycardia live-performance lanes. |
| `2026-05-21 10:57` | `source/2026-05-21-duobao-post-imedtac-internal-sync/` | Jason / 多寶 internal post-imedtac sync. Preserves the GPT corrected transcript, Gemini reference, and a cleaned full transcript. Clarifies that formal triage-level output is the risky boundary, AI should be placed in vital-aware question selection and staff-summary generation, iMVS needs reusable question templates rather than hand-coded screens, and next week should include an actual iMVS machine review instead of more imagined workflow design. |
| `2026-05-21 13:35` | `source/2026-05-21-imedtac-post-meeting-progress-record/` | Johnny Fang's post-meeting Gmail record for the `2026-06-10`-around US customer demo. Confirms imedtac's reading of measure-first-then-question flow, Endpoint 1/3 merge, single/multi-choice UI limit, no voice for June, demo preview page after measurement report, tachycardia/chest-tightness live-demo preference, and NYCU action items to adjust API logic and provide demo script / parameters / expected output. |
| `2026-05-21 13:38` to `2026-05-22 12:24` | `source/2026-05-21-imedtac-teams-api-followup/` | Microsoft Teams follow-up channel after the engineering sync. Johnny opened `AI Triage 討論 w/ 陽交大`; Ben identified himself and Lauren as primary imedtac technical contacts; imedtac asked NYCU for the two-endpoint API document, preset questions/options by tomorrow or Monday, and a response on whether users may skip questions. Jason's `2026-05-22 12:24` reply confirmed the API packet had been sent by email, committed NYCU to provide the first preset questions/options by Monday, and set the June answer-behavior direction as explicit `Not sure` option ids rather than a generic skip button. |
| `2026-05-22 12:17` | `source/2026-05-22-nycu-sent-api-reply-email/` | Jason's sent Gmail reply preserving the externally communicated API packet. Confirms NYCU sent the two-endpoint API reply and examples, framed the June demo contract as the minimum runnable flow, recommended explicit `not_sure` option ids rather than generic skip, and stated that the attached API reply should be treated as the June demo implementation baseline unless a later recorded change request updates it. |
| `2026-05-21 11:53` | `source/2026-05-21-wu-line-ai-triage-patent-protection/` | Prof. Wu LINE exchange after Jason sent the 5/21 meeting note. Prof. Wu asked to find time with Tomi to discuss patents and warned that NYCU should protect its own patent / IP position before teaching imedtac the full method; cooperation can last only if boundaries are clarified first. |
| `2026-05-21 12:05` | `source/2026-05-21-wu-ai-triage-ip-and-career-call/` | Prof. Wu network phone call after the LINE patent-protection exchange. Confirms lab API as both demo path and know-how protection boundary, meeting-note idea attribution requirement, MOU insufficiency for product co-development, need for contract / license / revenue discussion, imedtac engineering-capability assessment, postdoc/personnel-cost runway thinking, and June deep-cultivation proposal structure. |
| `2026-05-21` | `source/2026-05-21-zhidewan-public-profile/` | Public-source dossier on 智德萬 / AItewan for the imedtac protection lane. Records official company framing, public registration snapshot, DeepBT TFDA / FDA K252190 footprint, public patent / trademark signals, and the operational implication that deeper imedtac method transfer should route through Prof. Wu / 智德萬 legal or patent review, with NYCU checked only for university-owned or university-resource-derived material. |
| `2026-05-25` | `source/2026-05-25-duobao-afrvr-tachycardia-case/` | 多寶's Case 2 AfRVR-style tachycardia question-answer demo input. Confirms the measured-first tachycardia / palpitation / middle chest-tightness lane with HR `130`, SpO2 `98%`, BP `102/68`, RR `16`, T `36.5 C`, selected `none` associated symptoms, arrhythmia / hypertension history, medication context, and no allergy; closes the Monday first-lane case input for the imedtac API response package while preserving the demo-only staff-review boundary. |
| `2026-05-23 to 2026-05-25` | `source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/` | Teams follow-up after the API email and case handoff. Records Jason's Friday API / skip reply, Johnny's skip acknowledgement, 多寶's Case Tachy link, Ben's `request_id` / `idempotency_key` and `capabilities.max_questions` questions, imedtac's browser-direct demo environment and CORS origins, Johnny / UI-team signals on `I'm not sure`, no static `None of these`, and up to `9` short options without user scroll, plus Johnny's request to confirm whether the returned summary can be shown through an existing preview page. It now also records Jason's `2026-05-25 20:09` group reply freezing the first-rehearsal CORS/auth/progress/idempotency/summary positions, Jason's follow-up that NYCU-provided UI may affect visual consistency / device-operation completeness and therefore needs discussion, and Jason's `2026-05-25 20:13` private bearer-token handoff to Ben with the credential redacted from tracked files. |
| `2026-05-15 16:42` | `source/2026-05-15-imedtac-second-sync-and-duobao-followup/duobao-demo-case-draft.md` | 多寶's first clinical case draft and LINE handoff. Provides four diagnosis-shaped design anchors: acute cholecystitis, AfRVR, pneumonia, and URI, to be converted into demo-safe clinician-review summaries rather than diagnosis outputs. |
| `2026-05-19 16:52` | `source/2026-05-19-johnny-ai-triage-product-spec/` | Johnny Fang's email plus the linked `iMVS AI Triage 智慧檢傷分流系統_20260515` product spec. Later Downloads copies are archived here too: the standalone PDF was verified as byte-identical to the archived product-spec PDF, the DOCX is preserved as the editable-format copy, and the `2026-05-20` Gmail PDF preserves the later thread / forwarded-message view. Confirms mid-June customer-demo priority, HIS summary writeback as out-of-scope for this demo, voice input as conditional, and the immediate API contract need: iMVS vital payload -> NYCU typed question/session response -> iMVS answer/session loop -> next question or demo staff-summary output. |
| `2026-05-19 16:56-18:06` | `source/2026-05-19-johnny-line-thursday-engineering-sync/` | Johnny's LINE group follow-up after sending the product spec. User clarified the LINE times are afternoon / PM. Johnny says engineers need an API design document, asks when it can be provided, and asks to discuss progress on Thursday with the engineering design team. Jason added 許桓瑜（多寶） to the group. Johnny later confirmed Thursday `2026-05-21 10:00` on Microsoft Teams and provided meeting access details, preserved local-only in the source. |
| `2026-05-19 17:19-17:50` | `source/2026-05-19-duobao-line-thursday-engineering-sync/` | Jason coordinated with 多寶 for the Thursday engineering sync. 多寶 was available, provided email, received the forwarded materials, and the meeting was confirmed for Thursday `2026-05-21 10:00` pending the 慧誠 meeting link. |
| `2026-05-19 17:24-17:49` | `source/2026-05-19-johnny-direct-line-thursday-engineering-sync/` | Johnny clarified the spec's triage standards and presentation logic are AI-discussed drafts and adjustable in practice. Jason coordinated 許醫師 / 多寶 inclusion, forwarded the email, shared the email address, and finalized Thursday `10:00` as the sync time. |
| `2026-05-19` | `source/2026-05-19-expert-review-scope-api-boundary/` | Expert reply after reviewing the project packet. Confirms the scope cut is appropriate if framed as `synthetic-data vital-aware intake + staff-review summary`, not clinical triage product. Adds required v0.2 deltas: runtime enforcement, clinical stop rule, field dictionary, failure fallback, UI wording lock, `review_action` replacing `plan_support`, staff-only summary, handoff flags, privacy/security owner/date closeout, and expert-cited FDA / TW Core / CDC / PDPC / cybersecurity references. The complete user-provided record is archived in `full-record.md`; use `source.md` as the working extraction. |
| `2026-05-19` | `source/2026-05-19-expert-review-v02-freeze-gate/` | Second expert reply on the v0.2 freeze gate. Confirms the demo can proceed but API v0.2 is not frozen; adds timestamp correction, API question-to-registry mapping, respiratory flow registry alignment, per-vital quality preference, expanded error examples, `assessment_support` -> `review_basis`, case/fixture/question/wording versions, and owner/date/fallback closeout for Thursday. |
| `2026-05-19` | `source/2026-05-19-duobao-two-phase-vital-questioning/` | User-provided clarification of 多寶's two-phase question-flow insight: ask non-vital-dependent questions while vital signs are being measured, then use measured vital values to choose the second-stage follow-up. This becomes the preferred API/UI design if 慧誠 can support it without disrupting measurement quality. |
| `2026-05-20` | `source/2026-05-20-imedtac-personal-pre-meeting-note/` | User's personal pre-meeting note for the `2026-05-21` imedtac sync. Includes added sections `13-17` for meeting-control questions, API contract explanation, fallback / degraded mode, likely imedtac questions, and high-confidence response language. Treat as personal meeting-control material, not the official external response unless explicitly requested. |
| `2026-05-20` | `source/2026-05-20-nycu-response-to-imedtac-user-edited/` | User-edited NYCU response document for the `2026-05-21` imedtac sync. Preserves the exact manually modified Markdown file, checksum, and the active handoff copy used for the external pre-meeting response. |
| `2026-05-20` | `source/2026-05-20-duobao-demo-cases-question-design/` | 多寶's structured demo case and question-design drafts. Preserves a broad symptom/question inventory, four structured demo cases, post-vital trigger questions, and a SOAP-shaped output sketch. Treat as clinical/product design input only: derived review flags required normalization around real-name collection, triage/acuity/disposition language, diagnosis-shaped case labels, vital-threshold signoff, question budget, and two-phase timing. |

The `2026-05-12` source folder now also contains Johnny Fang's company-side
follow-up package:

- `assets/2026-05-12-imedtac-ai-triage-followup-email.pdf`
- `assets/2026-05-12-imvs-product-spec-v2.0.4.docx`
- `assets/2026-05-12-imvs-api-v1.4-eng.pdf`
- `extracted/` searchable text outputs

Derived analysis:

- `docs/2026-05-12-imedtac-materials-analysis.md`
- `docs/2026-05-12-imvs-hardware-and-vital-units-baseline.md`
- `source/2026-05-12-imedtac-company-ai-triage-sync/meeting-record.md` is the complete structured afternoon meeting record for the 慧誠智醫 x NYCU AI-Triage cooperation discussion. It now uses the user-specified structure and captures system background, company expectations, Jason's urology demo, all-specialty modularity, symptom wording provenance, vital-sign decision mapping, June demo pressure, follow-up action items, and the workflow-integration interpretation.
- `workstreams/05-thursday-vital-sign-research-gate.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/meeting-record.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-summary.md`
- `source/2026-05-12-wu-google-meet-ai-triage-510k/user-provided-extended-analysis.md`
- `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/extracted/2026-05-14-wu-gpt-vital-sign-questionnaire-triage-product-design.txt`
- `source/2026-05-15-imedtac-second-sync-and-duobao-followup/meeting-record.md`
- `source/2026-05-15-imedtac-second-sync-and-duobao-followup/company-provided-meeting-minutes.md`
- `source/2026-05-15-imedtac-second-sync-and-duobao-followup/pre-sync-thread-snapshot-2026-05-21.md`
- `source/2026-05-21-imedtac-engineering-sync/source.md`
- `source/2026-05-21-imedtac-engineering-sync/meeting-record.md`
- `source/2026-05-21-imedtac-engineering-sync/transcript-corrected-gpt.txt`
- `source/2026-05-21-imedtac-engineering-sync/user-provided-meeting-record.md`
- `source/2026-05-21-imedtac-post-meeting-progress-record/source.md`
- `source/2026-05-21-imedtac-teams-api-followup/source.md`
- `source/2026-05-21-imedtac-teams-api-followup/teams-thread-record-2026-05-22.md`
- `source/2026-05-22-nycu-sent-api-reply-email/source.md`
- `source/2026-05-22-nycu-sent-api-reply-email/sent-reply-record.md`
- `source/2026-05-21-duobao-post-imedtac-internal-sync/source.md`
- `source/2026-05-21-duobao-post-imedtac-internal-sync/meeting-record.md`
- `source/2026-05-21-duobao-post-imedtac-internal-sync/transcript-corrected.md`
- `source/2026-05-21-duobao-post-imedtac-internal-sync/transcript-corrected-gpt-source.txt`
- `source/2026-05-21-duobao-post-imedtac-internal-sync/transcript-gemini-reference.txt`
- `source/2026-05-21-wu-line-ai-triage-patent-protection/source.md`
- `source/2026-05-21-wu-line-ai-triage-patent-protection/line-thread.md`
- `source/2026-05-21-wu-line-ai-triage-patent-protection/thinking-and-schedule.md`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/source.md`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/meeting-record.md`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/thinking-and-schedule.md`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/transcript-corrected.md`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/transcript-corrected-gpt-source.txt`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/transcript-gemini-reference.txt`
- `source/2026-05-21-wu-ai-triage-ip-and-career-call/transcript-aura-final-reference.txt`
- `source/2026-05-21-zhidewan-public-profile/source.md`
- `source/2026-05-25-duobao-afrvr-tachycardia-case/source.md`
- `source/2026-05-23-to-2026-05-25-imedtac-teams-ui-api-followup/source.md`
- `source/2026-05-15-imedtac-second-sync-and-duobao-followup/duobao-demo-case-draft.md`
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
- `source/2026-05-19-expert-review-scope-api-boundary/full-record.md`
- `source/2026-05-19-duobao-two-phase-vital-questioning/source.md`
- `source/2026-05-20-duobao-demo-cases-question-design/source.md`
- `docs/2026-05-20-duobao-demo-design-consistency-review.md`
- `decisions/2026-05-20-june-demo-question-budget.md`
- `handoff/2026-05-20-duobao-normalized-june-case-pack-v1.md`
- `handoff/2026-05-21-duobao-style-tachycardia-live-demo-question-set.md`
- `docs/2026-05-19-expert-review-action-plan.md`
- `docs/2026-05-19-two-phase-question-flow-design.md`
- `docs/2026-05-19-api-session-design-plain-explanation.md`
- `docs/version-control-policy.md`
- `data/version_manifest.json`
- `handoff/2026-05-21-imedtac-engineering-sync-prep.md`
- `handoff/2026-05-21-imedtac-engineering-sync-closeout.md`
- `handoff/2026-05-21-imvs-nycu-api-design-v0.2-draft.md`
- `handoff/2026-05-21-imedtac-two-endpoint-api-reply.md`
- `handoff/2026-05-21-to-2026-05-25-imedtac-response-plan.md`
- `handoff/2026-05-25-imedtac-integration-next-steps.md`
- `handoff/2026-05-25-first-rehearsal-packet.md`
- `handoff/2026-05-21-decision-defaults-and-owner-matrix.md`
- `handoff/2026-05-22-api-v0.2-requirements-from-expert-review.md`
- `handoff/api-examples/`
- `docs/2026-05-25-demo-fallback-script.md`
- `docs/ai-triage-dynamic-engine-sdd-implementation-test-spec.md`
- `docs/2026-06-08-dynamic-engine-completion-audit.md`
- `docs/2026-06-08-dynamic-engine-spec-coverage-audit.md`
- `decisions/2026-06-08-dynamic-engine-cloud-backend-boundary.md`
- `handoff/2026-06-08-dynamic-engine-two-path-rehearsal-packet.md`
- `handoff/2026-06-08-dynamic-engine-clinical-wording-review-checklist.md`
- `handoff/2026-06-08-dynamic-engine-test-report.md`
- `handoff/2026-06-08-dynamic-engine-deployment-notice-draft.md`
- `handoff/2026-06-08-dynamic-engine-external-release-gate-closeout.md`
- `api/lib/triage-demo-contract.js`
- `api/lib/dynamic-engine/`
- `data/question_manifest.tachycardia.v0.3.json`
- `data/answer_effects.tachycardia.v0.3.json`
- `data/routing_policy.tachycardia.v0.3.json`
- `data/summary_templates.tachycardia.v0.3.json`
- `data/vector_index/tachycardia.v0.3.json`
- `scripts/build_tachy_manifest.py`
- `scripts/validate_dynamic_manifest.py`
- `scripts/build_vector_index.js`
- `tests/contract/triage-demo-api.test.js`
- `tests/contract/tachycardia-dynamic-path.test.js`
- `tests/contract/answer-candidates-api.test.js`
- `tests/contract/cloud-security-reliability.test.js`
- `tests/contract/dynamic-performance.test.js`
- `tests/unit/manifest-schema.test.js`
- `tests/unit/answer-effect-mapper.test.js`
- `tests/unit/routing-policy-engine.test.js`
- `tests/unit/summary-assembler.test.js`
- `tests/unit/ai-retrieval-guardrails.test.js`
- `tests/e2e/`

## Upstream Prof. Wu Context

| Date | Source | Relationship to this repo |
| --- | --- | --- |
| `2026-04-16` | `source/upstream-wu-context/2026-04-16-wu-yute-tomi-meeting/` | Upstream meeting that created the urology smart-previsit, medical cybersecurity, and patent/UI work threads. It is not the 慧誠 triage project itself, but it explains why urology previsit and medical-device integration became reusable context. |
| `2026-04-20` | `source/upstream-wu-context/2026-04-20-cde-prof-wu-clinical-medical-device-it-cybersecurity-speech/` | Prof. Wu / CDE medical-device cybersecurity speech context. It is adjacent because hospital-side cybersecurity, FDA/TFDA framing, HIS/EMR constraints, and vendor/hospital handoff are relevant to any future product claim. |

## Planning-Bridge Snapshots

| File | Purpose |
| --- | --- |
| `planning-bridge/2026-05-imedtac-er-triage-ekg-asr.md` | Full planning locator snapshot for this execution repo. |
| `planning-bridge/project-locators/2026-05-imedtac-er-triage-ekg-asr.md` | Same project locator kept with other related project snapshots. |
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
