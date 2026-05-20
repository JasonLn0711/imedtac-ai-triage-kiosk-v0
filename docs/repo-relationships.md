# Repo Relationships

## This Repo

Path:

```text
../ai-triage-kiosk-demo
```

Role:

- execution home for the AI triage kiosk demo lane;
- stores copied source bundles, briefing notes, demo requirements, architecture
  notes, and future implementation artifacts;
- owns demo-specific decisions once implementation starts.

## Planning Repo

Path:

```text
../planning-everything-track
```

Key locator:

```text
../planning-everything-track/data/projects/2026-05-imedtac-er-triage-ekg-asr.md
```

Role:

- priority, capacity, status, weekly/day scheduling, and cross-repo routing;
- does not own implementation artifacts;
- should link here when this lane affects the week.

## Urology Reference Repo

Path:

```text
../urology-ai-previsit-demo
```

Role:

- reference implementation for structured previsit intake and dynamic question
  workflow;
- not the canonical home for urgent-care / all-specialty triage;
- any reuse should be deliberate and copied/adapted, not silently merged.

## Source Bundles

Initial source copies came from:

```text
../planning-everything-track/data/knowledge/personal/sources/2026-05-11-wu-imedtac-er-triage-ekg-asr/
../planning-everything-track/data/knowledge/personal/sources/2026-05-12-imedtac-company-ai-triage-sync/
../planning-everything-track/data/knowledge/personal/sources/2026-04-16-wu-yute-tomi-meeting/
../planning-everything-track/data/knowledge/personal/sources/2026-04-20-cde-prof-wu-clinical-medical-device-it-cybersecurity-speech/
```

After this repo exists, new execution detail should be added here first, with
planning updated only as locator/status.

## Related Planning Locator Snapshots

The folder `planning-bridge/project-locators/` contains snapshots for:

- 慧誠 AI triage kiosk demo;
- urology AI previsit interview;
- TFDA/FDA regulatory advisor;
- medical cybersecurity TFDA/FDA industry deck.

These are snapshots. Check the planning repo for current scheduling and capacity
truth.
