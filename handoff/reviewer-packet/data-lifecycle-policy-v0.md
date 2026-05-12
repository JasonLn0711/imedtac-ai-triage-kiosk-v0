# Data Lifecycle Policy V0

Status: synthetic-demo policy; must be replaced before any real data work

## V0 Data Rule

The first clickable demo, if approved, must use synthetic data only.

## Allowed

- synthetic iMVS-shaped payloads;
- fake chart numbers such as `DEMO-001`;
- fake session IDs;
- demo-only patient answers;
- source IDs;
- local screenshots containing fake values;
- local logs that contain no real identifiers and no real patient health data.

## Not Allowed

- real patient identifiers;
- real hospital chart numbers;
- real phone numbers, names, birth dates, addresses, national IDs, or medical
  record numbers;
- production endpoint URLs;
- live hospital authentication;
- API keys, tokens, credentials, or secrets;
- raw ASR audio from real patients;
- real patient symptom answers;
- HIS/EMR writeback;
- screenshots containing real patient data.

## Logging Rule

For v0, logs should be either disabled or limited to:

```text
fixture_id
flow_id
question_id
source_id
demo answer code
timestamp generated locally for testing
```

Do not log free-text real patient answers.

## Future Real-Data Gate

Before any real patient or hospital data is used, require:

- written data owner;
- purpose and scope;
- consent / legal basis;
- de-identification or limited-data plan;
- retention period;
- access control;
- deletion process;
- incident contact;
- cybersecurity review;
- reviewer-approved logging policy.

