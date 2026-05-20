# Repo Organization

## Directory Map

```text
ai-triage-kiosk-demo/
  README.md
  AGENTS.md
  docs/
    project-brief.md
    architecture-insertion-and-clinical-grounding.md
    source-index.md
    repo-relationships.md
    repo-organization.md
  source/
    2026-05-11-wu-imedtac-er-triage-ekg-asr/
    2026-05-12-imedtac-company-ai-triage-sync/
    2026-05-15-imedtac-second-sync-and-duobao-followup/
    upstream-wu-context/
      2026-04-16-wu-yute-tomi-meeting/
      2026-04-20-cde-prof-wu-clinical-medical-device-it-cybersecurity-speech/
  planning-bridge/
    2026-05-imedtac-er-triage-ekg-asr.md
    project-locators/
  workstreams/
  decisions/
  handoff/
```

## Ownership By Folder

| Folder | Owns | Does not own |
| --- | --- | --- |
| `docs/` | synthesized architecture, repo organization, project brief, working principles | raw meeting transcript edits |
| `source/` | copied evidence, source bundles, upstream context | new interpretation unless added as a separate brief |
| `planning-bridge/` | snapshots and locator copies from planning | current planning truth after the snapshot date |
| `workstreams/` | active derived work products by execution lane | raw meeting evidence |
| `decisions/` | dated decisions once product direction changes | long brainstorming trails |
| `handoff/` | company / Prof. Wu / internal handoff drafts | credentials, live patient data, private deployment secrets |

## Canonical Routing

- Current execution detail goes here.
- Planning status goes to `../planning-everything-track/data/projects/2026-05-imedtac-er-triage-ekg-asr.md`.
- Urology implementation details stay in `../urology-ai-previsit-demo`.
- Regulatory-memory details stay in `../tfda-fda-regulatory-advisor`.
- Medical cybersecurity deck execution stays in its own talk / deck repo.

## Privacy Boundary

This repo may contain private meeting records and a CDE-confidential source copy.
Keep it local-only unless the user explicitly asks to publish and reviews the
materials first.
