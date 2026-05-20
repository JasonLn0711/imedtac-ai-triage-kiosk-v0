# Project Brief

## One-Line Goal

Create an English AI triage market demo that fits 慧誠智醫's existing kiosk /
web service story before the June US customer visit.

## Current Priority

The current priority is not UI polish, prompt tuning, or model expansion.

The current priority is defining the product insertion point and preparing the
Friday `2026-05-15` feasibility discussion artifact requested in the company
follow-up email:

```text
vital-sign measurement complete
-> vital-aware AI triage starts
-> dynamic questioning
-> structured triage-support summary
-> nurse / physician review
```

Detailed architecture note:

```text
docs/architecture-insertion-and-clinical-grounding.md
```

After the `2026-05-12 22:20` Google Meet with Prof. Wu, the first section of
the Friday artifact must be a FDA `510(k)` / comparable-product scope scan:

```text
comparable product
-> 510(k) summary
-> indication for use
-> comparator / function list
-> safe demo wording
```

The short-term demo should be framed as an English reference demo on the target
device. Live vital-sign integration remains future scope until the intended
use, device output format, sample data, and clinical workflow are clear.

Supporting context:

```text
docs/source-index.md
docs/wu-instruction-register.md
workstreams/
docs/2026-05-12-imedtac-materials-analysis.md
```

## What Exists

慧誠智醫 appears to have:

- medical measurement devices for blood pressure, SpO2, temperature, height, and
  weight;
- a Windows-based fanless all-in-one kiosk with no onboard GPU;
- a web service UI for measurement flow and summary report;
- middleware / gateway integration;
- RESTful API, FHIR, HIS, and EMR integration context.
- a product workflow of identity/login, measurement selection, guided
  measurement, normal/abnormal reference display, re-measure / next actions,
  final report, QR-code style output, and exit reminder;
- an API definition for optional patient authentication and post-measurement
  vital-sign upload.

## What They Want

Short term:

- English triage-facing demo;
- visible integration with kiosk / web service flow;
- symptom collection, structured summary, workflow acceleration, and
  vital-sign-aware story;
- customer-facing capability proof before a June US customer visit.

Long term:

- English voice input;
- broad / all-specialty symptom triage;
- vital signs integrated into triage logic;
- a triage AI database / system that can improve across US, Middle East,
  Singapore, Thailand, Malaysia, and other markets.

## Demo Architecture Hypothesis

```mermaid
flowchart TD
  A[Kiosk measurement flow] --> B[Vital signs payload]
  C[English symptom input<br/>ASR or typed] --> D[Symptom intake engine]
  B --> D
  D --> E[Dynamic follow-up questions]
  E --> F[Structured triage-support summary]
  F --> G[Kiosk web service demo screen]
  F --> H[Future clinician / HIS / EMR handoff]
```

## Required Decisions Before Implementation

- Is v0 integration a link, iframe, same web app, API handoff, or mocked flow?
- What exact vital-sign payload can the kiosk expose?
- Can the demo use simulated vital signs?
- What is the nearest comparable product, competitor, or FDA `510(k)` reference
  for product-scope comparison?
- What minimum symptom flow should be shown?
- Is ASR required for v0, or can typed input stand in for voice?
- Which vital signs affect question routing, and how is each effect justified?
- What clinical source supports each question and escalation path?
- What wording is safe for the output: triage support, recommended care level,
  clinician review prompt, or another phrase?
- Which architecture diagram is safe to share externally?
- Which target device / OS represents the June demo, given the current
  Windows-vs-Android ambiguity in meeting notes and product spec?
- Should the AI triage layer run before the vital-sign upload, after it, or as a
  separate report-only demo screen?

## Boundary

This repo can prepare a demo, architecture notes, and implementation scaffold.
It must not turn into clinical product claims before clinical criteria,
validation, privacy, cybersecurity, and company approvals exist.

## Immediate Friday Artifact

By Friday `2026-05-15`, keep the main artifact focused on 慧誠's action-item
questions:

- modular all-specialty triage method map;
- product insertion diagram;
- vital-to-question impact matrix;
- clinical-source governance plan;
- demo scope and no-diagnosis boundary.

Keep the `510(k)` comparator / product-scope table, detailed intended-use
options, go/no-go packet, data lifecycle, and prototype details as supplemental
notes unless 慧誠 asks about them.
