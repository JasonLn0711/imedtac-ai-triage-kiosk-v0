# Demo Fixtures

This directory contains synthetic iMVS-shaped payloads for governed demo flows.

These fixtures are fake. They must not contain real patient identifiers, real
hospital chart numbers, live endpoint URLs, credentials, or real ASR audio.

## Current Fixtures

| Fixture | Flow |
| --- | --- |
| `chest-pain-high-bp-low-spo2.json` | Chest pain with high BP / low SpO2 context. |
| `fever-urinary.json` | Fever with urinary or respiratory symptom context. |
| `respiratory-low-spo2-early-handoff.json` | Duobao-aligned respiratory handoff case with two-phase question flow and lower SpO2 context. |
| `tachycardia-live-demo.json` | Duobao-aligned tachycardia / palpitation / chest-tightness live-performance case with measured-first HR cue. |

## Boundary

The fixtures support a demo-only clinician-review summary. They do not support
diagnosis, treatment advice, final triage level, emergency orders, or HIS/EMR
writeback.
