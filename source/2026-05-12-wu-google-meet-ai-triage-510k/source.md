---
id: 2026-05-12-wu-google-meet-ai-triage-510k
title: "2026-05-12 Prof. Wu Google Meet - AI Triage 510K Direction"
date: 2026-05-12
time: "22:20"
topic: personal
subtopic: sources
type: source-bundle
source: user-provided-google-meet-transcript
participants:
  - 林家聖
  - 吳育德老師
keywords:
  - imedtac
  - imedtac
  - ai-triage
  - google-meet
  - fda-510k
  - indication-for-use
  - vital-sign-kiosk
  - all-in-one
  - no-gpu
  - embedding
  - asr
  - deep-cultivation-plan
  - lianyi
status: active
related:
  - data/projects/2026-05-imedtac-er-triage-ekg-asr.md
  - data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/source.md
  - data/knowledge/personal/sources/2026-05-12-wu-line-lianyi-asr-llm-demo/source.md
  - ../ai-triage-kiosk-demo/source/2026-05-12-wu-google-meet-ai-triage-510k/
---

# 2026-05-12 Prof. Wu Google Meet - AI Triage 510K Direction

## Context

At around `22:20` on `2026-05-12`, Jason met Prof. Wu through Google Meet after
the 慧誠智醫 AI triage company demo/sync. The discussion focused on how to
respond to 慧誠's follow-up request before the Friday `2026-05-15` discussion
and how to avoid overbuilding or inventing clinical logic without a reliable
reference.

## Canonical Files

- Full transcript: `transcript-full.md`
- Structured meeting record and analysis: `meeting-record.md`
- User-provided post-transcript summary: `user-provided-summary.md`
- User-provided extended analysis: `user-provided-extended-analysis.md`
- Execution-repo copy:
  `../ai-triage-kiosk-demo/source/2026-05-12-wu-google-meet-ai-triage-510k/`

## Source Handling

The user provided two highly overlapping transcript renderings in the same
message: a detailed raw-style transcript and a cleaned/readability-oriented
version. The preserved transcript file keeps the meeting content as a source
record and records that the second rendering is a duplicate cleaned reference,
not a separate meeting.

The user also provided a concise interpretation after the transcript. That
interpretation is preserved separately in `user-provided-summary.md` so future
work can distinguish source transcript, structured analysis, and user-supplied
framing.

The user later provided a longer product / regulatory / technical analysis.
That expanded interpretation is preserved in
`user-provided-extended-analysis.md`.

## Core Meeting Result

Prof. Wu's main direction was:

1. Do not start from scratch.
2. Find FDA `510(k)` summaries for comparable US products.
3. Use the `indication for use`, predicate device, function list, and any
   related publications to infer the safest initial product frame.
4. Keep the June customer demo simple: English demo on their device first,
   without integrating live vital-sign signals into the AI logic unless the
   use case and data interface become clear.
5. Ask 多寶 / 冠廷 for medical interpretation help, and possibly invite 多寶 to
   the Friday discussion if needed.

## Planning Interpretation

This changes the Friday artifact from a broad "vital-aware triage design" into
a narrower regulatory/product-reference scan:

- primary artifact: FDA `510(k)` / comparable-product scan;
- primary question: what `indication for use` and function scope do comparable
  triage/vital-sign products claim?
- demo boundary: English market demo on the kiosk / all-in-one device first;
  signal integration is future scope unless a medically defensible and
  technically feasible path appears;
- staffing path: 多寶 for medical reading / LLM-adjacent clinical judgment,
  冠廷 for medical/signal discussion, 俊逸 for signal side if the project later
  needs signal processing.
