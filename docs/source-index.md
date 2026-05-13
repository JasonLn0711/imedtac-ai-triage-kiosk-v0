# Source Index

This repo is now the complete local archive for the 慧誠智醫 AI triage kiosk
demo lane and its direct upstream Prof. Wu context.

## Core Triage Sources

| Date | Source | Why it matters |
| --- | --- | --- |
| `2026-05-11` | `source/2026-05-11-wu-huicheng-er-triage-ekg-asr/` | Prof. Wu introduced the 慧誠 / imedtac emergency-triage collaboration, role split, EKG / SpO2 / ASR / LLM questions, case-accrual dependency, and triage-not-diagnosis boundary. |
| `2026-05-12` | `source/2026-05-12-huicheng-company-ai-triage-sync/` | Company-side sync clarified the kiosk / web service / middleware / RESTful API / FHIR / HIS / EMR context, June US customer demo pressure, English-first voice-input long-term target, and vital-aware triage differentiator. |
| `2026-05-12 22:20` | `source/2026-05-12-wu-google-meet-ai-triage-510k/` | Prof. Wu reframed the next step after the company sync: first find comparable FDA `510(k)` summaries and `indication for use` boundaries before promising vital-sign-integrated AI triage. |

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
