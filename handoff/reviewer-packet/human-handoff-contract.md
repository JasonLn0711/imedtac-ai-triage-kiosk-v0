# Human Handoff Contract

Status: must be approved before clickable demo

## Core Rule

The AI layer does not complete triage. It prepares a clinician/staff-review
summary.

The demo must name what happens when the system sees a red-flag combination or
insufficient information.

## Required Decisions

| Decision | Options | Preferred v0 answer | Owner |
| --- | --- | --- | --- |
| Who reviews output? | nurse / physician / front desk / demo operator only | staff or clinician reviewer, not patient alone | 慧誠 / clinician |
| Where does output appear? | patient screen / staff screen / reviewer panel / exported summary | staff/reviewer panel preferred | product owner |
| What does patient see for red-flag path? | wait for staff / review signal present / generic demo notice | soft staff-review wording | clinician/company |
| Can patient leave after red-flag path? | yes / no / not represented in demo | not represented until approved | clinician/company |
| Is ESI shown? | no / source family only / final level | no final ESI level | clinician/company |
| Is source shown to patient? | no / simplified / full citation | no, source only in reviewer/debug view | product/clinical |

## Red-Flag Handoff Rows

| Scenario | Demo behavior | Output wording status |
| --- | --- | --- |
| chest pain plus high BP / low SpO2 context | show clinician/staff review signal and source-family basis | needs approval |
| fever plus urinary/systemic symptoms | show review signal and source-family basis | needs approval |
| missing vital field | mark unavailable; do not infer normal | acceptable draft |
| measurement failure | mark failed or ask repeat only if product owner approves | needs product input |
| patient cannot answer | provide skip/staff-assist path | needs UI/product input |

## Draft Staff-Review Wording

Conservative option:

```text
This demo found symptom and vital-sign information that should be reviewed by
staff. This is not a diagnosis or treatment recommendation.
```

More directive option, only if approved:

```text
Please wait for staff review before leaving the kiosk area. This is not a
diagnosis or treatment recommendation.
```

