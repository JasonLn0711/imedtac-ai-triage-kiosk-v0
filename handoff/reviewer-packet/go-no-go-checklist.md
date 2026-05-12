# Go / No-Go Checklist

Status: decision checklist for Friday discussion  
Default: no-go until the required items are answered

## Decision Question

Should the project proceed from source-governance artifacts to a small
browser-only synthetic clickable demo?

## Go Criteria

Proceed only if all required items are answered `yes`.

| Item | Required answer | Current status | Owner |
| --- | --- | --- | --- |
| Intended use | v0 is synthetic-data triage support and clinician/staff review summary only. | draft, not approved | Prof. Wu / 慧誠 |
| Target SKU | June demo target iMVS device or product mode is named. | unknown | 慧誠 product |
| Guaranteed fields | Required measured fields are confirmed. | unknown | 慧誠 engineering |
| Synthetic payload | Synthetic iMVS-shaped payload is acceptable for v0. | recommended, not approved | 慧誠 / project team |
| Human reviewer | Review owner for thresholds and output wording is named. | unknown | Prof. Wu / 慧誠 |
| Output wording | Patient/staff wording is approved or softened. | draft only | clinical/company reviewer |
| Integration mode | Browser-only, link-out, embedded page, or API mode is selected. | unknown | 慧誠 engineering |
| Data boundary | No real patient data, identifiers, raw ASR, credentials, or live HIS/EMR endpoints in v0. | recommended, not approved | privacy/security owner |
| Flow scope | Two governed flows are enough for June capability demo. | proposed | Prof. Wu / 慧誠 |
| Claim language | Forbidden claims are accepted as forbidden. | draft | business/product owner |

## No-Go Triggers

Stay in memo/source-registry mode if any of these occur:

- real patient data is requested for v0;
- live HIS/EMR writeback is required for June;
- no clinical/company reviewer is named;
- customer-facing language requires "diagnosis," "clinical-grade triage,"
  "FDA-approved," or "AI decides acuity";
- all-specialty clinical coverage is expected by June;
- target SKU and guaranteed vital fields remain unknown;
- output wording cannot be approved before demo.

## If Go

Allowed implementation scope:

- browser-only;
- synthetic fixtures only;
- two deterministic flows;
- touch input first;
- source IDs visible in reviewer/debug view;
- clinician/staff-review summary only;
- demo boundary visible in output.

Forbidden implementation scope:

- diagnosis;
- treatment advice;
- final ESI level;
- autonomous emergency order;
- real patient identifiers;
- raw real-patient ASR audio;
- live hospital authentication;
- production endpoint URLs;
- HIS/EMR writeback.

