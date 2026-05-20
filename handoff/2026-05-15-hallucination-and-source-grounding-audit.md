# Hallucination And Source-Grounding Audit

Date: 2026-05-15
Scope: current repo materials for the 慧誠智醫 AI triage kiosk demo lane,
including `data/`, `docs/`, `workstreams/`, `handoff/`, demo fixtures, and the
new Prof. Wu GPT DOCX source packet.

## Bottom Line

The current package is directionally safe for a Friday feasibility discussion if
it stays in the stated boundary:

```text
demo-only vital-aware intake
-> source-governed question routing examples
-> clinician/staff review summary
-> no diagnosis, no autonomous triage, no FDA-cleared claim
```

I did not find a current file that explicitly claims the demo is FDA-cleared,
clinically validated, production-ready, diagnostic, or autonomous.

I did find source-grounding weaknesses that needed tightening:

1. Some appendix source IDs drifted away from `data/source_registry.csv`.
2. Several clinical examples are still source-family hypotheses, not approved
   clinical rules.
3. Prof. Wu's GPT DOCX contains useful design hypotheses and draft thresholds,
   but those thresholds are not validated source rows.
4. The `510(k)` comparator is still missing; any predicate-style comparison
   would be invented until 慧誠 / 苗先生 names a product or `510(k)` number.

## What Was Checked

Local files checked:

- `data/source_registry.csv`
- `data/question_registry.csv`
- `data/flow_registry.csv`
- `demo/fixtures/*.json`
- `docs/*.md`
- `workstreams/*.md`
- `handoff/*.md`
- `source/2026-05-14-wu-line-gpt-vital-sign-questionnaire-triage/source.md`

Live official-source spot checks:

- FDA Releasable `510(k)` Database page.
- FDA Digital Health Policy Navigator Step 6.
- American Heart Association high-blood-pressure emergency page.
- CDC flu signs/symptoms and emergency-warning-signs page.
- American Diabetes Association hypoglycemia and hyperglycemia pages.
- American Urological Association recurrent uncomplicated UTI guideline page.

## Findings

| Area | Status | Finding | Action taken |
| --- | --- | --- | --- |
| Product claim boundary | Pass | Files repeatedly say demo / triage support / clinician review, not diagnosis or production triage. | No change needed. |
| FDA / `510(k)` use | Pass with open gap | FDA is correctly framed as intended-use / product-scope / CDS-boundary support, not a symptom-question source. Comparator product is still absent. | Keep `product-reference-needed`; do not make predicate-style claims. |
| Prof. Wu GPT DOCX | Pass with warning | The source packet labels the DOCX as GPT-generated context, not clinical authority. | Keep thresholds as draft candidates only. |
| Source IDs | Fixed | Appendix used unregistered source labels such as AHA heart-attack 2024, CDC flu warning 2024, ADA hypoglycemia SX, and AUA rUTI 2025. | Normalized to registry IDs: `AHA-HEART-ATTACK`, `CDC-FLU-WARN`, `ADA-HYPO`, `ADA-HYPER`, `AUA-RUTI`. |
| Registry validation | Improved | Existing script checked CSV and fixture references, but did not catch Markdown source-ID drift. | Extended `scripts/check_governance_registries.py` to detect missing source IDs in Markdown. |
| Clinical thresholds | Needs review | Numeric thresholds from GPT DOCX / NEWS2-like draft are not represented as approved registry rules. | Keep out of Friday mainline unless explicitly marked `clinician-signoff-needed`. |
| ESI use | Needs exact extraction | ESI is appropriate as an emergency-triage source family, but exact passages for HR/RR/SpO2 still need extraction before customer-facing claim language. | Leave as `source-family` / review-required unless exact text is extracted. |
| AUA use | Needs use-rights care | AUA page supports fever/flank-pain as outside uncomplicated rUTI scope, but AUA also states promotional/commercial use requires a licensed copy. | Updated source registry limit to note license/commercial-use caution. |
| Patient data | Pass | Demo fixtures are synthetic and validation checks `not_real_patient_data=true`. | No change needed. |

## Official-Source Grounding Summary

These are the claims that survived spot-checking:

| Claim in repo | Grounding status | Support |
| --- | --- | --- |
| FDA `510(k)` database can support product-scope scans by device name, product code, or `510(k)` number. | Supported. | FDA database page lists search fields and output fields such as device name, applicant, product code, decision date, and summary/statement availability. |
| FDA Digital Health Policy Navigator supports using FDA for CDS / device-boundary thinking, not symptom-question content. | Supported. | FDA Step 6 discusses CDS functions, signals, medical information, recommendations, and HCP independent review. |
| Very high BP plus chest pain, shortness of breath, weakness/numbness, vision change, or speech difficulty is an emergency-warning family. | Supported. | AHA high-BP emergency page lists these symptom families around BP above `180/120`. |
| Flu/respiratory public-health sources support warning-sign questions such as difficulty breathing, chest/abdominal pressure, confusion/dizziness, not urinating, and severe weakness. | Supported for flu/respiratory-warning family, not all-cause fever triage. | CDC flu page lists adult emergency warning signs. |
| ADA supports hypoglycemia symptom questions including shakiness, sweating/chills, confusion, fast heartbeat, dizziness, nausea, sleepiness, weakness/low energy. | Supported. | ADA hypoglycemia page lists these symptoms. |
| ADA supports hyperglycemia/ketoacidosis warning prompts including shortness of breath, fruity breath, nausea/vomiting, and very dry mouth. | Supported. | ADA hyperglycemia page lists these as ketoacidosis symptoms. |
| AUA recurrent uncomplicated UTI guideline supports treating fever/flank pain as outside uncomplicated localized rUTI scope. | Supported as a source-family boundary, not a general ED triage rule. | AUA guideline page excludes patients with signs/symptoms of upper UTI or systemic bacteremia such as fever and flank pain. |

## Current Hallucination Risks To Control

### 1. Missing `510(k)` Comparator

Current safe statement:

> We have a comparator-scan template and know what to extract, but we still need
> the US partner/customer product name, competitor, or `510(k)` number before
> making any comparator or predicate-style statement.

Unsafe statement:

```text
This demo is similar enough to an FDA-cleared triage product.
```

### 2. GPT Thresholds

Current safe statement:

> Prof. Wu's GPT DOCX gives candidate threshold ideas, but every threshold must
> be mapped to a source row and marked `clinician-signoff-needed` before it can
> appear in patient-facing or customer-facing behavior.

Unsafe statement:

```text
Use the GPT thresholds directly in the rule engine.
```

### 3. All-Specialty Coverage

Current safe statement:

> The architecture is all-specialty-capable because modules can be added under
> one shared intake/router/source-registry core. The current demo should only
> claim one or two example modules.

Unsafe statement:

```text
We already have full all-specialty clinical triage.
```

### 4. ESI / ED Framing

Current safe statement:

> ESI is an emergency-triage framework family that supports the idea that vital
> signs matter for acuity/review concern. We should not assign ESI levels in the
> kiosk demo.

Unsafe statement:

```text
The kiosk can calculate ESI level.
```

### 5. AUA / Urology Branch

Current safe statement:

> AUA supports urinary-symptom source-family context and shows fever/flank pain
> are not simple uncomplicated-rUTI territory. Urology is not the strongest
> vital-sign-driven first demo; it remains a structured-intake reference.

Unsafe statement:

```text
The urology branch can diagnose UTI or pyelonephritis.
```

## Friday Use Guidance

Use the current materials in this order:

1. `handoff/2026-05-15-imedtac-need-fit-meeting-execution-plan.md`
2. `handoff/2026-05-15-friday-discussion-brief.md`
3. `handoff/2026-05-15-vital-aware-triage-feasibility-source-governance.md`
4. `handoff/2026-05-15-source-registry-and-example-flows.md`

Use `510(k)` scan material only if 慧誠 asks about US customer positioning,
comparator products, or FDA pathway.

Use Prof. Wu's GPT DOCX only as a design hypothesis, not as medical evidence.

## Next Required Hardening

Before anything becomes customer-facing:

1. Name a real comparator product or `510(k)` number, or explicitly mark
   comparator unavailable.
2. Extract exact source passages for ESI / respiratory-vital / HR-RR-SpO2
   claims.
3. Convert any numeric threshold into registry rows with:
   - source ID,
   - source text,
   - threshold condition,
   - clinical purpose,
   - output effect,
   - review owner,
   - `clinician-signoff-needed`.
4. Decide whether AUA material is usable in any external commercial-facing
   artifact or should be paraphrased internally only until licensing is clear.
5. Ask 慧誠 to name the clinical/product owner who approves output wording.
