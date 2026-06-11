from __future__ import annotations

DEMO_BOUNDARY = "Synthetic-data staff-review intake support with human-review workflow and separate production validation path."
SESSION_TTL_SECONDS = 30 * 60
WORKFLOW_MODE = "post_measurement_only"
MEASUREMENT_STATE_COMPLETE = "complete"

BRANCH_MODULES = {
    "palpitation": "Heart/palpitation.md",
    "tachycardia": "Heart/tachycardia.md",
    "bradycardia": "Heart/bradycardia.md",
    "hypertension": "Heart/hypertension.md",
    "fever": "Body_temperture/fever.md",
    "shortness_of_breath": "Respiratory/shortness_of_breath.md",
    "hypoxia_cyanosis": "Respiratory/hypoxia_cyanosis.md",
    "respiratory_depression": "Respiratory/respiratory_depression_drowsiness.md",
}

SCOPE_CONTROLS = [
]
