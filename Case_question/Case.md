# Demo Cases for AI-Triage (Structured)

This file contains four detailed medical scenarios for the June 2026 demo, restyled to match the logic in `Question_design.md`.

---

## Case 1: Acute Cholecystitis

### (0) Initial Phase
- **Name:** Patient 1
- **Age:** 40
- **Gender:** Male
- **C.C.:** Fever and right upper quadrant (RUQ) abdominal pain for 1 day.

### (1) Symptom-Specific Phase (Case 1-1 Abdominal pain)
- **Location:** Right Upper Quadrant
- **Quality:** NRS 6/10
- **Association:** [ ] Nausea [ ] Vomiting [ ] Diarrhea [ ] None

### (3) After Vital Signs Phase (Abnormal)
- **Vitals:** **T 38.5°C**, HR 98, RR 16, SpO₂ 99%, BP 123/81
- **Trigger:** Fever (>37.5°C)
- **Follow-up Q:** Are you feeling chills? Have you taken any fever-reducing medicine in the last 4 hours? -> "Yes, I have chills. No medicine taken."

### (2) Universal Phase
- **PMH:** Nil
- **Meds:** Nil
- **Allergy:** Nil

### (4) Expected SOAP Output (S)
```
40 y/o Male
C.C.: Fever with RUQ abdominal pain for 1 day
Detail: Location: RUQ. NRS: 6/10.
Note: Patient has fever (38.5°C) with active chills. No antipyretics taken.
Past history: Nil
Medications: Nil
Allergy: Nil
NRS: 6/10
```

---

## Case 2: AfRVR (Atrial Fibrillation with Rapid Ventricular Response)

### (0) Initial Phase
- **Name:** Patient 2
- **Age:** 76
- **Gender:** Female
- **C.C.:** Palpitation and chest tightness for half a day.

### (1) Symptom-Specific Phase (Case 1-3 Chest tightness / pain)
- **Location:** Middle chest
- **Quality:** [x] Palpitation, [x] Tightness
- **Association:** [ ] Shortness of breath, [ ] Sweating, [ ] Dizziness

### (3) After Vital Signs Phase (Abnormal)
- **Vitals:** T 36.5°C, **HR 150**, RR 16, SpO₂ 98%, BP 102/68
- **Trigger:** Tachycardia (HR > 130)
- **Action:** ⚠ Tachycardia — please notify staff immediately.
- **Follow-up Q:** Are you feeling palpitations or chest pain? -> "My heart is beating very fast and my chest feels heavy."

### (2) Universal Phase
- **PMH:** Arrhythmia, Hyperlipidemia
- **Meds:** Unknown
- **Allergy:** Peanut

### (4) Expected SOAP Output (S)
```
76 y/o Female
C.C.: Palpitation and chest tightness for half day
Detail: Symptoms: Palpitation, tightness in middle chest.
Note: Critical Tachycardia (HR 150) detected. Patient reports heart racing and chest heaviness.
Past history: Arrhythmia, Hyperlipidemia
Medications: Unknown
Allergy: Peanut
```

---

## Case 3: Pneumonia

### (0) Initial Phase
- **Name:** Patient 3
- **Age:** 80
- **Gender:** Male
- **C.C.:** Shortness of breath (Dyspnea) for 2 days.

### (1) Symptom-Specific Phase (Case 1-10 URI/Respiratory)
- **Quality:** [x] Cough, [x] Fever
- **Association:** [x] Shortness of breath, [ ] Chest pain
- **Duration:** 2 days

### (3) After Vital Signs Phase (Abnormal)
- **Vitals:** **T 38.5°C**, **HR 102**, **RR 23**, **SpO₂ 92%**, BP 123/81
- **Trigger:** Fever, Abnormal RR, Hypoxia (SpO₂ < 94%)
- **Action:** ⚠ Hypoxia — please notify staff.
- **Follow-up Q:** Are you feeling short of breath or having trouble breathing? -> "Yes, it is very hard to breathe even while sitting."

### (2) Universal Phase
- **PMH:** DM, HTN
- **Meds:** Metformin, Lisinopril
- **Allergy:** Penicillin

### (4) Expected SOAP Output (S)
```
80 y/o Male
C.C.: Dyspnea for 2 days
Detail: Symptoms: Shortness of breath, cough, fever.
Note: Hypoxia (SpO2 92%) and Tachypnea (RR 23) detected. Patient reports significant difficulty breathing.
Past history: DM, HTN
Medications: Metformin, Lisinopril
Allergy: Penicillin
```

---

## Case 4: URI (Upper Respiratory Infection)

### (0) Initial Phase
- **Name:** Patient 4
- **Age:** 26
- **Gender:** Female
- **C.C.:** Fever for 2 days, cough, and runny nose.

### (1) Symptom-Specific Phase (Case 1-10 URI)
- **Quality:** [x] Fever, [x] Cough, [x] Runny nose
- **Association:** [ ] Shortness of breath, [ ] Chest pain
- **Duration:** 2 days

### (3) After Vital Signs Phase (Abnormal)
- **Vitals:** **T 37.5°C**, HR 98, **RR 21**, SpO₂ 98%, BP 124/76
- **Trigger:** Fever, Mild Tachypnea
- **Follow-up Q:** Are you feeling chills? -> "No, just a bit warm."

### (2) Universal Phase
- **PMH:** Nil
- **Meds:** Nil
- **Allergy:** Nil

### (4) Expected SOAP Output (S)
```
26 y/o Female
C.C.: Fever for 2 days, cough and runny nose
Detail: Symptoms: Fever, cough, runny nose. Duration: 2 days.
Note: Mild fever (37.5°C) and slightly elevated RR (21).
Past history: Nil
Medications: Nil
Allergy: Nil
```
