# Data Registries

This directory contains governance registries for the AI triage kiosk demo.

These files are not clinical rules and are not validation evidence. They are
review scaffolds that keep any future demo source-governed and deterministic.

## Files

| File | Purpose |
| --- | --- |
| `source_registry.csv` | Source IDs, URLs, intended project use, allowed-use status, limits, and review owners. |
| `question_registry.csv` | Patient-facing question rows mapped to triggers, source IDs, clinical purpose, output effect, evidence status, and review owner. |
| `flow_registry.csv` | Demo flow versions mapped to fixture files, question IDs, allowed outputs, forbidden outputs, and review owner. |

## Validation

Run:

```bash
python3 scripts/check_governance_registries.py
```

The check verifies source/question/flow references and confirms fixture files
are synthetic-demo-only.

## Rules

- Use synthetic data only unless a separate data-use decision is made.
- Do not treat these rows as approved clinical logic until a named reviewer
  signs off.
- Do not add diagnosis, treatment advice, final ESI level, autonomous emergency
  orders, or HIS/EMR writeback behavior to these registries.
- Version any change to question text, source IDs, thresholds, or output wording.
