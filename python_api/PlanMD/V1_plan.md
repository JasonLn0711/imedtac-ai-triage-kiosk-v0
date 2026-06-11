# V1 Rule-Based Fixed Flow Implementation Plan

This document defines the detailed implementation plan for **Model V1:
Rule-Based Fixed Flow** in `python_api/`.

V1 keeps the current two-endpoint API stable while replacing the hard-coded
single-lane question sequence with a deterministic, testable rule engine. The
runtime remains a synthetic-data staff-review intake support demo. It does not
produce diagnosis, treatment advice, final triage / acuity, autonomous medical
orders, or production HIS / EMR / FHIR writeback.

## V1 Objective

Implement a fixed `if / else` workflow that starts after iMVS vital-sign
measurement and routes the patient through:

```text
After Vital Sign Phase
-> Initial Phase, when chief concern is not already known
-> Symptom-Specific Phase
-> Universal Phase
-> Staff-Review Summary
```

The first implementation should preserve the current tachycardia demo behavior
while creating reusable modules for future fever, respiratory, abdominal pain,
and urinary symptom lanes.

## Scope

### In Scope

- Keep the current FastAPI endpoints:
  - `POST /api/triage-demo/sessions`
  - `POST /api/triage-demo/sessions/{session_key}/answers`
- Keep current session, idempotency, CORS, optional bearer-token auth, and error
  behavior compatible with V0.
- Normalize vital payloads into runtime fields.
- Evaluate vital-trigger rules with deterministic logic.
- Load symptom questions from `Case_question/symptom_questions.csv`.
- Route one session through a fixed question plan.
- Validate `question_id`, option IDs, `max_selections`, and phase order.
- Generate a structured staff-review summary.
- Add tests for rule routing and backwards compatibility.

### Out Of Scope For V1

- LLM routing or option ranking.
- Voice / ASR answer intake.
- Free-text clinical interpretation.
- Production clinical thresholds or validated triage scoring.
- Real patient data, identifiers, credentials, or live hospital integration
  details.
- New externally visible endpoint paths.

## Compatibility Principle

V1 should be a runtime refactor plus deterministic routing expansion. The API
shape stays stable so imedtac integration does not need a contract rewrite.

Do not change these without a separate change-control note:

| Contract item | V1 decision |
| --- | --- |
| Endpoint paths | Keep current two endpoints. |
| Answer payload | Keep `answer.selected_option_ids`. |
| Workflow mode | Keep `post_measurement_only`. |
| Question response | Keep `status=question`, `question_phase`, `progress`, and `question`. |
| Summary response | Keep `status=summary` and `staff_review_summary`. |
| Error style | Keep current `status=error` envelope. |
| Idempotency | Same-key same-body replay and same-key changed-body conflict. |

## Proposed File Structure

Add focused modules under `python_api/` while keeping `main.py` thin.

```text
python_api/
  main.py
  triage_contract.py
  triage_v1/
    __init__.py
    models.py
    constants.py
    vital_normalizer.py
    vital_rules.py
    question_registry.py
    flow_router.py
    session_store.py
    summary_builder.py
    response_builder.py
  tests/
    test_v1_vital_normalizer.py
    test_v1_vital_rules.py
    test_v1_question_registry.py
    test_v1_flow_router.py
    test_v1_api_contract.py
```

Migration rule:

- `main.py` should continue to call high-level contract functions.
- `triage_contract.py` can initially delegate to `triage_v1` while preserving
  public function names such as `create_session()` and `submit_answer()`.
- Avoid a large one-shot rewrite. Extract one behavior at a time and keep tests
  green.

## Data Model

Use Python dataclasses or Pydantic models internally. Since FastAPI currently
reads raw JSON and returns dictionaries, V1 can keep dictionary responses and use
models inside the engine.

### NormalizedVital

```python
@dataclass
class NormalizedVital:
    name: str
    value: float | int | None
    unit: str
    measurement_status: str
    quality_flag: str
    missing_reason: str | None = None
```

Supported normalized fields:

| Field | Unit | Source |
| --- | --- | --- |
| `temperature_c` | `C` | `Temp.Value` or normalized caller payload |
| `spo2_percent` | `%` | `SPO2.Value` or normalized caller payload |
| `heart_rate_bpm` | `bpm` | `HR.BP_Value` or normalized caller payload |
| `blood_pressure_systolic_mm_hg` | `mmHg` | `NBP.SYS_Value` or normalized caller payload |
| `blood_pressure_diastolic_mm_hg` | `mmHg` | `NBP.DIA_Value` or normalized caller payload |
| `glucose_mg_dl` | `mg/dL` | `Glucose.Value` or normalized caller payload |
| `weight_kg` | `kg` | `Weight.Value` or normalized caller payload |
| `height_cm` | `cm` | `Height.Value` or normalized caller payload |
| `respiratory_rate_per_min` | `/min` | demo/manual/synthetic only until confirmed |

### Question

```python
@dataclass
class Question:
    id: str
    phase: str
    type: str
    text: str
    options: list[QuestionOption]
    max_selections: int
    required: bool
    trigger_reason_codes: list[str]
    source_refs: list[str]
    evidence_status: str
    summary_effect: str
```

### FlowState

```python
@dataclass
class FlowState:
    session_key: str
    case_id: str
    flow_version: str
    current_phase: str
    question_plan: list[str]
    current_index: int
    vitals: dict[str, NormalizedVital]
    patient_context: dict[str, Any]
    answers: list[AnswerRecord]
    flags: list[ReviewFlag]
```

### ReviewFlag

```python
@dataclass
class ReviewFlag:
    code: str
    label: str
    source: str
    summary_text: str
    triggered_by: list[str]
```

Review flags are staff-review cues, not final clinical decisions.

## Vital Normalizer

### Purpose

Convert either a normalized caller payload or an imedtac-style payload into a
consistent runtime dictionary.

### Input Forms

V1 should support the current normalized shape:

```json
{
  "heart_rate_bpm": {
    "value": 130,
    "unit": "bpm",
    "measurement_status": "measured",
    "quality_flag": "needs_review"
  }
}
```

V1 may also prepare adapter support for company-provided iMVS API V1.4-style source objects, pending imedtac confirmation of the current demo-device field dictionary:

```json
{
  "HR": { "BP_Value": "130", "Unit": "bpm" },
  "NBP": { "SYS_Value": "102", "DIA_Value": "68", "Unit": "mmHg" }
}
```

### Normalization Rules

- Parse numeric strings into `int` or `float`.
- Keep `value=None` when measurement is missing or failed.
- Default `measurement_status` to `measured` only when a usable value exists.
- Default `quality_flag` to `unknown` when caller does not provide quality.
- Keep units explicit in the normalized result.
- Never infer real clinical validity from a value alone; validation belongs to
  clinical review.

### Function Shape

```python
def normalize_vitals(raw_vitals: dict[str, Any]) -> dict[str, NormalizedVital]:
    ...
```

## Vital Rule Engine

### Purpose

Evaluate measured vital context and choose deterministic review flags and
question-routing cues.

### V1 Demo Rules

These rules are demo-routing gates and must be documented as clinical-validation
pending.

| Condition | Review flag code | Routing impact |
| --- | --- | --- |
| `heart_rate_bpm >= 120` | `measured_elevated_heart_rate_demo` | Prefer palpitation / tachycardia branch. |
| `heart_rate_bpm >= 130` | `tachycardia_staff_review_demo` | Add staff-review cue and ask concise cardiopulmonary questions. |
| `spo2_percent < 94` | `low_spo2_review_demo` | Prefer respiratory branch or staff-review confirmation. |
| `temperature_c >= 37.5` | `measured_fever_context_demo` | Prefer fever module if no stronger chief concern. |
| `temperature_c >= 39.0` | `high_fever_staff_review_demo` | Add staff-review cue. |
| `blood_pressure_systolic_mm_hg < 90` | `low_bp_review_demo` | Add dizziness / weakness review cue. |
| `blood_pressure_systolic_mm_hg > 180` | `high_bp_review_demo` | Add headache dizziness/ staff-review cue. |

Ordering rule:

1. Severe staff-review cue with direct symptom branch.
2. Chief concern explicitly reported by caller or selected in Initial Phase.
3. Vital-triggered branch.
4. General initial intake fallback.

### Function Shape

```python
def evaluate_vitals(vitals: dict[str, NormalizedVital]) -> list[ReviewFlag]:
    ...
```

## Question Registry

### Purpose

Load patient-facing questions into stable server-side question objects.

V1 sources:

- Current tachycardia hard-coded questions, kept as a compatibility fixture.
- `Case_question/symptom_questions.csv` for future module-backed routing.
- Universal questions defined in a small Python or JSON fixture.

### CSV Mapping

| CSV column | Runtime field |
| --- | --- |
| `category` | `category` |
| `module_title` | `module_title` |
| `module_file` | `module_file` |
| `question_id` | `id` |
| `question_type` | `question_kind` or display metadata |
| `question` | `text` |
| `answer_options` | `options[].label` and generated option IDs |

Option IDs should be stable. V1 should generate them deterministically from the
question ID and normalized label if the CSV does not provide explicit option
IDs.

Example:

```text
PAL-1 + Racing -> pal-1_racing
PAL-1 + Not sure -> pal-1_not_sure
```

### Registry API

```python
class QuestionRegistry:
    def get(self, question_id: str) -> Question: ...
    def questions_for_module(self, module_key: str) -> list[Question]: ...
    def universal_questions(self) -> list[Question]: ...
```

## Flow Router

### Purpose

Build the deterministic `question_plan` for a session.

### V1 Routing Inputs

- `case_id`
- normalized vitals
- `patient_context`
- optional caller-provided chief concern
- review flags from vital rules
- answers collected so far

### Initial Session Routing

At `POST /api/triage-demo/sessions`:

1. Validate `case_id`, `workflow_mode`, `measurement_state`, and `vitals_ready`.
2. Normalize vitals.
3. Evaluate vital flags.
4. Build the first question plan.
5. Store `FlowState` in session store.
6. Return the first question.

For the current tachycardia case, preserve the V0 question path first:

```text
tachy-chief-concern
-> tachy-onset
-> tachy-current-feeling
-> tachy-associated-symptoms
-> tachy-post-vital-heart-rate-cue
-> tachy-heart-history-meds
-> tachy-medication-allergy-confirm
-> summary
```

### Dynamic But Fixed Branching

V1 is fixed-flow, but it can still branch deterministically:

```python
if has_flag("tachycardia_staff_review_demo"):
    branch = "palpitation"
elif chief_concern in HEART_CONCERNS:
    branch = "palpitation"
elif has_flag("low_spo2_review_demo"):
    branch = "shortness_of_breath"
elif has_flag("measured_fever_context_demo"):
    branch = "fever"
elif chief_concern:
    branch = map_chief_concern_to_module(chief_concern)
else:
    branch = "initial_intake"
```

The branch chooses a fixed module question list. The LLM is not used in V1.

### Answer-Time Routing

At `POST /api/triage-demo/sessions/{session_key}/answers`:

1. Load session.
2. Get current question from `question_plan[current_index]`.
3. Validate `question_id` and selected option IDs.
4. Store answer record.
5. If the answer changes the branch, apply only pre-defined deterministic branch
   rules.
6. Advance `current_index`.
7. Return next question or summary.

Branch changes should be limited in V1. Example: if Initial Phase chief concern
+ vital context points to `palpitation`, append the palpitation module and then
universal questions.

## Phase Design

### Phase 1: After Vital Sign

Purpose: make measured vital context visible to the engine first.

Question examples:

- Elevated HR cue: ask whether the patient feels heart racing, chest tightness,
  both, or neither.
- Low SpO2 cue: ask whether the patient feels short of breath or needs staff
  review.
- Fever cue: ask fever duration / chills / fever medicine context.

Response fields:

```json
{
  "question_phase": "post_measurement_intake",
  "phase_reason": "Measurement is complete and a demo vital cue is available."
}
```

### Phase 2: Initial

Purpose: collect chief concern when the branch is not already known.

Minimum questions:

- age, if not in `patient_context`, only for synthetic demo context;
- biological sex, if needed for demo branch display;
- chief concern;
- duration, if not included.

V1 can skip Initial Phase for the current tachycardia case if the session starts
with `case_id=demo-tachycardia-live-001` or a tachycardia vital cue.

### Phase 3: Symptom-Specific

Purpose: ask module-backed questions.

Initial V1 module targets:

| Module | Source | Reason |
| --- | --- | --- |
| Palpitation / tachycardia | Current V0 questions + `Heart/palpitation.md` CSV rows | Preserve live demo path. |
| Fever | `Body_temperture/fever.md` CSV rows | Tests vital-triggered fever branch. |
| Shortness of breath | Respiratory module rows | Tests SpO2-triggered branch. |
| Abdominal pain or urinary symptoms | CSV rows | Tests non-cardiac chief complaint routing. |

### Phase 4: Universal

Purpose: collect fields helpful for staff review.

Minimum V1 universal questions:

- Past medical history.
- Current medications.
- Medication allergy.
- Pregnancy possibility when applicable in synthetic demo context.

### Phase 5: Summary

Purpose: create staff-review summary.

Required fields:

- `summary_visibility="staff_only"`
- `scope_controls`
- `vitals_observed`
- `chief_concern`
- `symptom_answer_highlights`
- `history_medication_allergy_context`
- `staff_review_flags`
- `handoff_reason_codes`

Do not include diagnosis, treatment advice, ECG order, final acuity, or formal
triage score.

## Response Builder

V1 responses should preserve current envelope fields.

Question response:

```json
{
  "status": "question",
  "session_state": "active",
  "question_phase": "post_measurement_intake",
  "progress": { "current": 1, "expected_total": 7 },
  "question": {
    "id": "tachy-chief-concern",
    "type": "multi_choice",
    "text": "What are you feeling now?",
    "options": []
  }
}
```

Summary response:

```json
{
  "status": "summary",
  "session_state": "summary_ready",
  "question_phase": "summary",
  "staff_review_summary": {}
}
```

Error response should continue to use:

```json
{
  "status": "error",
  "session_state": "error",
  "error": {
    "code": "invalid_answer",
    "message": "...",
    "retryable": false
  }
}
```

## Implementation Steps

### Step 1: Add `triage_v1` Package

Create package files and move no behavior yet:

- `python_api/triage_v1/__init__.py`
- `models.py`
- `constants.py`

Add tests that import these modules.

### Step 2: Extract Response Constants

Move contract/version constants into a stable config layer:

- `DEMO_BOUNDARY`
- `SESSION_TTL_SECONDS`
- fixed value sets
- default rendering constraints

Keep public response values identical to V0.

### Step 3: Implement Vital Normalizer

Add `vital_normalizer.py` and unit tests.

Test cases:

- normalized object with numeric value;
- normalized object with string value;
- iMVS-style `HR.BP_Value`;
- iMVS-style `NBP.SYS_Value` / `DIA_Value`;
- missing vital;
- invalid numeric string.

### Step 4: Implement Vital Rule Engine

Add `vital_rules.py` and tests.

Test cases:

- HR 130 triggers tachycardia demo flag;
- HR 80 triggers no tachycardia flag;
- SpO2 93 triggers low SpO2 review flag;
- temperature 39 triggers high fever flag;
- missing vitals do not crash and add no false flag.

### Step 5: Implement Question Registry

Add `question_registry.py`.

Behavior:

- Load CSV using Python `csv.DictReader`.
- Parse semicolon-separated `answer_options`.
- Generate stable option IDs.
- Convert CSV rows into `Question` objects.
- Provide lookup by ID and module.

Test cases:

- `PAL-1` loads from CSV.
- Generated option IDs are stable.
- Missing question ID raises controlled registry error.
- Module lookup returns ordered questions.

### Step 6: Extract Current Tachycardia Questions

Move current V0 tachycardia question definitions into a fixture module or JSON
file while keeping IDs and option IDs unchanged.

Recommended file:

```text
python_api/triage_v1/tachycardia_questions.py
```

This avoids breaking the currently rehearsed path while V1 routing is built.

### Step 7: Implement Flow Router

Add `flow_router.py`.

Functions:

```python
def build_initial_flow(body: dict[str, Any], registry: QuestionRegistry) -> FlowState:
    ...

def next_question(flow_state: FlowState) -> Question | None:
    ...

def record_answer(flow_state: FlowState, body: dict[str, Any]) -> None:
    ...
```

Start with tachycardia compatibility, then add CSV-backed modules.

### Step 8: Implement Summary Builder

Add `summary_builder.py`.

Inputs:

- normalized vitals;
- patient context;
- answer records;
- review flags;
- question registry.

Output:

- `staff_review_summary` dictionary matching current API style.

Summary wording should be affirmative and product-minded:

```text
This demo shows a synthetic-data vital-aware intake loop for staff-review
summary generation.
```

Avoid defensive or apologetic language.

### Step 9: Delegate From `triage_contract.py`

Refactor `triage_contract.py` in small passes:

1. Keep function names `create_session()` and `submit_answer()`.
2. Use V1 normalizer inside `create_session()`.
3. Use V1 flow state for question progression.
4. Keep V0 response examples as compatibility references until summary builder
   output is fully tested.
5. Remove duplicated legacy functions only after tests cover the new path.

### Step 10: Add API-Level Regression Tests

Extend or add tests for:

- current tachycardia happy path;
- current tachycardia idempotency behavior;
- fever branch start;
- SpO2 branch start;
- invalid answer;
- summary boundary fields.

## Acceptance Criteria

V1 is complete when:

- Current tachycardia demo path still works through the same two endpoints.
- Runtime can load at least one CSV-backed symptom module.
- Vital normalizer handles normalized and iMVS-style payloads.
- Vital rules produce deterministic review flags.
- Flow router can choose at least tachycardia, fever, and low-SpO2 branches.
- Summary response includes measured vitals, answer highlights, staff-review
  flags, and scope controls.
- Tests pass with `uv run python -m pytest python_api/tests`.
- No real patient data or credentials are introduced.

## Suggested Development Order

1. Write `models.py` and `vital_normalizer.py`.
2. Add normalizer tests.
3. Write `vital_rules.py` and rule tests.
4. Write `question_registry.py` and CSV tests.
5. Extract current tachycardia questions without changing API behavior.
6. Add `flow_router.py` with tachycardia compatibility.
7. Add fever and low-SpO2 branch fixtures.
8. Add `summary_builder.py`.
9. Delegate `triage_contract.py` to V1 modules.
10. Run full API tests and update `python_api/README.md` only if public behavior
    or local run instructions change.

## Open Decisions

| Decision | Current recommendation |
| --- | --- |
| Store V1 questions in Python, JSON, or CSV? | Use Python fixture for current tachycardia compatibility, CSV registry for broader symptom modules. |
| Use dataclasses or Pydantic internally? | Start with dataclasses to keep the engine lightweight; keep FastAPI request parsing unchanged. |
| Add a new endpoint for vitals? | No. Preserve current two-endpoint contract. |
| Let V1 compute a triage score? | No. Staff-review summary only. |
| Include respiratory rate as measured vital? | Only as demo/manual/synthetic until imedtac confirms a measured source. |
| Enable LLM ranking? | No. Reserve for V2 behind a feature flag. |
