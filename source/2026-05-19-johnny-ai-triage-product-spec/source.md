---
id: 2026-05-19-johnny-ai-triage-product-spec
title: "Johnny Fang AI Triage Product Spec Email And Google Doc"
date: 2026-05-19
topic: ai-triage
type: source
status: archived
confidentiality: company-confidential-email-local-only
---

# Johnny Fang AI Triage Product Spec Email And Google Doc

## Source Boundary

This source bundle preserves Johnny Fang's `2026-05-19` email and the linked
Google Doc product specification for the 慧誠智醫 / imedtac AI triage kiosk demo
lane.

The email footer marks the communication and attachments as confidential. Keep
this bundle local-only unless the project owner explicitly approves sharing.

## Source Metadata

- Email subject: `AI Triage Product Spec`
- Sender: Johnny Fang / 方偉翰, imedtac Corp.
- Date: `2026-05-19 08:52:13 +0000` (`2026-05-19 16:52` Asia/Taipei)
- Recipients: Jason Lin, Jason Miao
- Cc: Ken Yu
- Linked spec:
  `https://docs.google.com/document/d/1neOLWj7X-Po4N7CHaUKTRYk5NxnI4o7b7eyMy2eku4o/edit?usp=sharing`
- Google Doc title from PDF export:
  `iMVS AI Triage 智慧檢傷分流系統_20260515`
- Product spec version: `V 1.0`, dated `20260515`
- Standalone Downloads PDF later provided by the user:
  `/home/jnclaw/Downloads/iMVS AI Triage 智慧檢傷分流系統_20260515.pdf`.
  It was verified as byte-identical to the archived product-spec PDF
  (`SHA-256 a716f667a29eecd1c1aa2409a7be343f82189e26357d23452c88d482cc53c6b3`).
- Standalone Downloads DOCX later provided by the user:
  `/home/jnclaw/Downloads/iMVS AI Triage 智慧檢傷分流系統_20260515.docx`.
  It was archived as the editable-format copy of the same `V 1.0` product spec;
  its extracted paragraphs were verified as covered by the existing source text
  exports.
- Standalone Downloads Gmail PDF later provided by the user:
  `/home/jnclaw/Downloads/Gmail - AI Triage Product Spec.pdf`.
  It was archived as a separate `2026-05-20` Gmail thread export because it
  preserves the same Johnny email plus browser-thread evidence of a later
  forwarded / second-message view.

## Archived Files

| File | Purpose | SHA-256 |
| --- | --- | --- |
| `assets/2026-05-19-johnny-ai-triage-product-spec-email.eml` | Original downloaded email source. | `aaa249383961dc8d0c13923a32a956d333e1995aa2baec2f2f842d4269ce90c2` |
| `assets/2026-05-19-johnny-ai-triage-product-spec-gmail-export.pdf` | Browser/Gmail PDF export of the email. | `4a6ff34ef0ca0bb7fc6a860761e949daf6a07ddc1462f3c5f2adfa0a9ab6f95f` |
| `assets/2026-05-20-johnny-ai-triage-product-spec-gmail-thread-export.pdf` | Later browser/Gmail PDF export of the same email thread; preserves the second-message / forwarded-thread view from Downloads. | `656b7a6c6c9e9ba05320a7f66b33a3c0cca751ec7ae732dbc4bbac26d73d178e` |
| `assets/2026-05-15-imvs-ai-triage-product-spec-v1.0.pdf` | Google Doc product spec exported as PDF; byte-identical to the later standalone Downloads PDF named `iMVS AI Triage 智慧檢傷分流系統_20260515.pdf`. | `a716f667a29eecd1c1aa2409a7be343f82189e26357d23452c88d482cc53c6b3` |
| `assets/2026-05-15-imvs-ai-triage-product-spec-v1.0.docx` | Editable-format DOCX copy of the same `V 1.0` product spec later provided from Downloads. | `97c9f1b6c30d24c50d774144184545cb2cfae5a173e7acb23481a39fb7679da5` |
| `extracted/2026-05-19-johnny-ai-triage-product-spec-email.txt` | Parsed email headers and body. | `2390283887362e025949890c8a98f378df343107674ca755c6acacc4cbcb8c40` |
| `extracted/2026-05-19-johnny-ai-triage-product-spec-gmail-export.txt` | Searchable text extracted from the Gmail PDF export. | `07b945e483c6b09f16dbcebfedcf7e00632a134feaf679105476c104dbadbd4a` |
| `extracted/2026-05-15-imvs-ai-triage-product-spec-v1.0.txt` | Google Doc plain-text export. | `d375b357f254ed4f8084d0762a924aa54a49d10bb3622a93d2789fc2ddce7206` |
| `extracted/2026-05-15-imvs-ai-triage-product-spec-v1.0-pdf.txt` | Searchable text extracted from the exported spec PDF. | `eb2aaaa3b066a38fa1396e5123ec34e6b74c9d4e1b58d4822eee6cce98271903` |

## Email Summary

Johnny says 慧誠 has internally discussed the AI Triage plan. UI is still being
planned and will be provided later. The linked product specification is shared
for comments.

Two delivery reminders matter for the June demo:

- The short-term mid-June goal is a customer demo.
- Grey-text items such as returning the AI summary content back into the HIS
  workflow are not planned for this demo.
- Voice input depends on NYCU / Jason-side progress and still needs discussion
  before it is included in the demo.

Johnny also asks for API discussion around:

- whether the iMVS upload format for vital-sign data to NYCU needs discussion;
- the question payload returned by NYCU, including question type, options,
  expected question count / AC07 progress, and session key;
- the subsequent answer loop, where iMVS uploads the user answer plus the
  session key and NYCU returns the next question or the final output.

## Product Spec Summary

The `20260515` product spec frames the system as an automated triage-support
solution for hospitals and health centers. It combines vital-sign measurement
with AI-driven structured symptom checking, then transforms the collected data
into a SOAP-style summary for medical staff.

The standalone PDF in Downloads did not introduce a second version. It confirms
that the archived Google Doc export is the same official product-spec document
referenced in Johnny's email.

The standalone DOCX in Downloads also did not introduce a second product-spec
version. It is preserved as the editable-format copy so future audits can verify
format-level details without depending only on PDF / text extraction.

Important user-story groups:

- IT/admin configuration: measurement module toggles, identity-mode switching,
  and future clinical-standard selection.
- Patient flow: Taiwan card / manual ID and US full-name + DOB identity
  support, guided vital measurement, and structured AI questioning.
- AI questioning: OPQRST / VINDICATE-style dynamic questioning, fewer than
  eight questions, progress visibility, single-choice, multi-choice, scale
  input, and optional voice input with transcription confirmation and fallback.
- Demo doctor view: after measurement and questioning, the demo should open an
  AI result page for what the doctor would see.
- Future HIS side: SOAP summary, evidence mapping, red flags, and HL7/FHIR/HIS
  connection. The email explicitly says the HIS return path is not part of the
  mid-June demo.

## Local Interpretation

This source confirms that the current choice-only v0 runtime is on the right
demo path, but it also creates a concrete API-contract gate:

```text
iMVS vital payload
  -> NYCU session key + typed question object
  -> iMVS answer + session key
  -> next typed question or demo staff-summary result
```

For the mid-June demo, treat `diagnosis` / `診斷` language in the API question
as company shorthand. The repo boundary remains clinician-review / triage
support summary only: no diagnosis, no treatment, no final acuity assignment,
and no production HIS writeback.

## Derived Analysis

- `../../docs/2026-05-19-ai-triage-product-spec-api-analysis.md`
- `../../workstreams/08-june-demo-case-and-integration-plan.md`

## Planning Mirror

Planning repo should keep only status, locator, blocker, and next-action notes:

- `../planning-everything-track/data/projects/2026-05-imedtac-er-triage-ekg-asr.md`
- `../planning-everything-track/data/knowledge/personal/sources/2026-05-19-johnny-ai-triage-product-spec/source.md`
- `../planning-everything-track/weeks/2026-W21/days/2026-05-19.md`
