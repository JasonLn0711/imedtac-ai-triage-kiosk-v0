# FDA 510(k) Comparable Product Scan

Date: 2026-05-13
Status: Friday discussion artifact; not a regulatory opinion, predicate claim, clearance claim, or clinical validation memo.

## Executive Answer

The closest FDA-cleared patterns do not support starting with "AI determines
triage level." They support a narrower and safer v0:

> Build a safe, explainable English intake demo for clinician review. Vital
> signs may be displayed, summarized, and used as context for follow-up
> questions, but they should not directly decide triage level.

The five useful comparator patterns are:

1. Remote physiologic monitoring and transmission.
2. Patient questionnaire plus measurement diary.
3. Camera-based spot vital-sign measurement.
4. Clinician-facing physiologic dashboard / index.
5. Clinician-facing triage notification that runs in parallel to standard care.

## Comparator Table

| Product | 510(k) | Why it is close | Intended use / indications | Predicate / comparable device | Input / output | User-facing role | Information-only, triage, or recommendation | Claim-control lesson |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Carematix Wellness System | K073038 | Closest to a kiosk/remote-monitoring data pipe: it collects and transmits vital signs and other physiologic data from a remote patient to a clinical station. | Physiological monitoring system that collects, accumulates, and transmits patient vital signs / physiologic data from a remote patient to the practitioner. | Carematix Wellness System K040966. | Inputs include BP, pulse, glucose, SpO2, PT/INR, PEFR/FEV, weight through connected measurement devices; output is transmitted data for caregiver monitoring/trending/alerts. | Patient/home collection with caregiver/clinical review. | Collects/transmits/organizes physiologic data; not an autonomous triage product. | Good model for iMVS payload + clinician review. Do not claim the AI decides urgency; claim the workflow organizes measured context for review. |
| Asthma Monitor AM3 G+ / AMOS | K183479 | Strongest patient-intake analogue: combines patient-entered questionnaire answers, medication/symptom diary behavior, measurement, and clinician software configuration. | Electronic respiratory-flow measurement device for asthma/COPD/disease-management contexts, adults and children 5+. Patient sees numeric results and traffic-light style measurement indication based on physician-defined criteria. | Asthma Monitor AM3 GSM K133722. | Inputs are PEF/FEV1 and scheduled questionnaire answers; outputs are stored dated measurements/answers, transmitted/evaluated through AMOS. | Patient answers questions; professional user configures/uses AMOS. | Collects measurement + questionnaire data; no diagnosis or treatment suggestion from the software. | This is the best pattern for "question bank + measurements + clinician-owned thresholds." Let clinicians define thresholds and keep diagnosis/treatment with the physician. |
| Informed Vital Core Application | K241633 | Camera-based vital-sign app that can fit a no-extra-hardware demo story. | Non-invasive spot measurement of pulse rate for adult patients in home, hospital, clinic, and long-term-care settings; adults 22+ who do not require critical care or continuous monitoring. Not intended to independently direct therapy. | Oxehealth Vital Signs K211906. | Input is video from phone/tablet/laptop/desktop camera; output is pulse-rate spot check. | Measurement may occur in home/clinical settings; interpretation is not autonomous therapy direction. | Measurement only; no triage, no recommendation, no therapy direction. | If using camera/vital signs in demo, keep them as measurement/context. Do not let a pulse value drive a final triage statement. |
| T3 Software | K152258 | Useful pattern for aggregating many physiologic parameters and displaying an index to healthcare professionals. | Records/displays multiple physiological parameters from supported bedside devices for adult, pediatric, and neonatal patients. Not for alarm notification, waveform display, or controlling connected devices. Used by healthcare professionals to consult/review patient status and aid clinical decisions. | T3 Software K142732/K151715; Visensia K081140/K110953. | Inputs are multiple bedside physiologic/lab parameters; output is display, storage, real-time visualization, and an Inadequate Oxygen Delivery Index derived from physiologic/lab data. | Clinician-facing. | Clinical decision-support context, but not alarms/control; supports review rather than autonomous action. | If we compute any vital-aware summary, make it review-support, auditable, and clinician-facing. Do not control devices, generate alarms, or present it as a final triage command. |
| BriefCase | K180647 | Best "actual triage" boundary example: FDA-cleared triage/notification exists, but it is narrow, clinician-facing, and explicitly not diagnostic. | Radiological computer-aided triage/notification for non-enhanced head CT, assisting hospital networks and trained radiologists by flagging suspected ICH findings for workflow triage. | Viz.AI ContaCT DEN170073. | Input is head CT imaging; output is notification/list/preview for suspected ICH cases. | Clinician-facing: radiologists / trained hospital network users. | Performs workflow triage/prioritization of images, but runs in parallel to standard care and does not diagnose. | If we ever use "triage," it must be specific, clinician-facing, parallel to standard care, informational beyond notification, and dependent on professional judgment. For June, avoid claiming this level. |

## Cross-Product Findings

### 1. The safest v0 is intake + review, not AI triage

The lower-risk comparators collect, display, transmit, or organize measured
data and patient answers. They do not independently determine treatment,
diagnosis, or final urgency.

### 2. Patient-facing and clinician-facing functions must be separated

Patient-facing functions should collect answers and show neutral measurement
context. Clinician/staff-facing functions can summarize measured context,
answers, missing information, and review signals.

### 3. Vital signs can be context, but direct triage requires more evidence

Vital-sign devices are cleared with tight limitations: spot measurement,
non-critical-care populations, trained/professional oversight, and "not sole
method" or "not therapy direction" language. That supports vital-sign context,
not automatic triage judgment.

### 4. If using triage language, copy the constraint pattern, not the claim

BriefCase shows that a triage-cleared software can exist, but only under a
highly specific input/output: one imaging modality, one suspected condition,
trained users, parallel standard-of-care workflow, informational preview, and
clinician responsibility for full review and treatment decisions.

### 5. The comparator scan narrows the Friday scope

The Friday/Jume scope should be:

```text
English intake + adaptive questions + measured context + clinician/staff
review summary, using synthetic or demo payloads.
```

It should not be:

```text
AI decides triage level, emergency referral, diagnosis, treatment, production
HIS/EMR writeback, or 510(k)-cleared equivalent product.
```

## Draft Intended-Use Language For June Demo

> This demo is a synthetic-data English intake and adaptive-questioning workflow
> that organizes patient-reported symptoms and optional measured vital-sign
> context into a clinician/staff review summary. It does not diagnose, treat,
> determine final triage level, issue emergency orders, or integrate with
> production HIS/EMR systems.

## Friday Questions

1. Does 慧誠 want the June demo to be framed as intake/review support rather
   than triage decision support?
2. Which iMVS fields are guaranteed in the demo payload: BP, HR, SpO2, Temp,
   glucose, height, weight, BMI?
3. Is the output patient-facing, staff-facing, clinician-facing, or all three
   with separate wording?
4. Who owns clinical sign-off for thresholds, red-flag wording, and human
   handoff?
5. Can we ask 苗先生 / the US partner for the actual product name, competitor
   name, or known `510(k)` number they have in mind?

## Sources

- FDA K073038, Carematix Wellness System:
  https://www.accessdata.fda.gov/cdrh_docs/pdf7/K073038.pdf
- FDA K183479, Asthma Monitor AM3 G+ / AMOS:
  https://www.accessdata.fda.gov/cdrh_docs/pdf18/K183479.pdf
- FDA K241633, Informed Vital Core Application:
  https://www.accessdata.fda.gov/cdrh_docs/pdf24/K241633.pdf
- FDA K152258, T3 Software:
  https://www.accessdata.fda.gov/cdrh_docs/pdf15/K152258.pdf
- FDA K180647, BriefCase:
  https://www.accessdata.fda.gov/cdrh_docs/pdf18/K180647.pdf
