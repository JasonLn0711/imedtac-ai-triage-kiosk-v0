# Triage Question Design

## System Flow Chart

```mermaid
graph LR
    A[Patient Arrival] --> B[Vital Signs Measurement]
    B --> C[Initial Phase - Section 0]
    C --> D[Symptom-Specific Phase - Section 1]
    D --> E[Universal Phase - Section 2]
    E --> G[Generate SOAP Report]
    G --> H[Triage Complete]
```

---

## (0) Initial Phase

**Question 0-1**
What's your name? Gender? Age?

**Question 0-2**
What brings you here?
*Example: headache for 3 days*

**Question 0-3** *(if duration not provided in 0-2)*
How long have you had {symptoms}?

---

## (1) Symptom-Specific Phase

Route to one case based on chief complaint from 0-2.

### Case 1-1 Abdominal pain

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-1-1 | Location | Which part of the abdomen hurts? | Left/Right Upper, Left/Right Lower, Middle, General |
| 1-1-2 | Quality | Rate the pain from 1–10. | NRS (Numeric Rating Scale) |
| 1-1-3 | Association | Do you have nausea, vomiting, or diarrhea? | [ ] Nausea [ ] Vomiting [ ] Diarrhea [ ] None |

### Case 1-2 Headache

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-2-1 | Location | Which part of the head hurts? | Frontal, Temporal, Occipital, Behind eyes, General |
| 1-2-2 | Quality | Did any of these happen? | [ ] Sudden severe headache [ ] Weakness / numbness [ ] Trouble speaking [ ] Vision change [ ] Fever [ ] Neck stiffness [ ] None |
| 1-2-3 | Association | Is this headache: | [ ] New [ ] Similar to before [ ] Gradually worsening |

### Case 1-3 Chest tightness / chest pain

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-3-1 | Location | Where is the pain/tightness? | Left, Right, Middle, Radiating to arm/jaw |
| 1-3-2 | Quality | What does it feel like? | [ ] Pressure [ ] Tightness [ ] Sharp pain [ ] Burning [ ] Palpitation |
| 1-3-3 | Association | Do you have any of these? | [ ] Shortness of breath [ ] Sweating [ ] Dizziness [ ] Fainting [ ] None |

### Case 1-4 Fever

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-4-1 | Association | Do you have other symptoms? | [ ] Sore throat [ ] Abdominal pain [ ] Dysuria [ ] Rash [ ] None |
| 1-4-2 | Quality | Are you experiencing chills? | [ ] Chills [ ] Shaking [ ] None |
| 1-4-3 | Red flags | Do you feel any of these? | [ ] Shortness of breath [ ] Confusion [ ] Severe weakness [ ] Unable to drink [ ] None |

### Case 1-5 Dizziness

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-5-1 | Quality | What type of dizziness? | [ ] Room spinning (vertigo) [ ] Feeling faint [ ] Unsteady walking |
| 1-5-2 | Onset | Did it happen suddenly? | Yes / No |
| 1-5-3 | Association | Do you have other symptoms? | [ ] Hearing loss/ringing [ ] Headache [ ] Chest pain [ ] Weakness [ ] Head injury [ ] None |

### Case 1-6 Trauma

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-6-1 | Mechanism | What happened? | [ ] Fall [ ] Traffic accident [ ] Sports injury [ ] Cut injury [ ] Hit by object |
| 1-6-2 | Location | Which body part is injured? | Head, Neck, Chest, Abdomen, Back, Limbs |
| 1-6-3 | Association | Do you have any of these? | [ ] Loss of consciousness [ ] Severe bleeding [ ] Unable to move limb [ ] Severe pain [ ] None |

### Case 1-7 Skin infection

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-7-1 | Location | Where is the affected skin? | Face, Limbs, Trunk, etc. |
| 1-7-2 | Quality | How does it look or feel? | [ ] Redness / warmth [ ] Swelling [ ] Pus or discharge [ ] Pain [ ] Itching |
| 1-7-3 | Association | Any of these symptoms? | [ ] Fever [ ] Spreading redness [ ] Red streaks [ ] None |

### Case 1-8 Allergy

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-8-1 | Trigger | What caused the reaction? | Food, Drug, Insect, Unknown |
| 1-8-2 | Quality | What symptoms do you have? | [ ] Rash / hives [ ] Swelling [ ] Itching [ ] Shortness of breath [ ] Wheezing [ ] Nausea [ ] None |
| 1-8-3 | Red flags | Any severe symptoms? | [ ] Trouble breathing [ ] Throat tightness [ ] Feeling faint [ ] None |

### Case 1-9 UTI (urinary symptoms)

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-9-1 | Quality | What urinary symptoms? | [ ] Dysuria [ ] Frequency [ ] Urgency [ ] Blood in urine [ ] Flank pain |
| 1-9-2 | Association | Do you have other symptoms? | [ ] Fever [ ] Chills [ ] Nausea/Vomiting [ ] None |
| 1-9-3 | History | Is this similar to before? | Yes / No / First time |

### Case 1-10 URI (upper respiratory)

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-10-1 | Quality | What symptoms do you have? | [ ] Runny nose [ ] Sore throat [ ] Cough [ ] Fever [ ] Body aches |
| 1-10-2 | Association | Any of these symptoms? | [ ] Shortness of breath [ ] Chest pain [ ] Wheezing [ ] None |
| 1-10-3 | Duration | How long have they lasted? | Days / Weeks |

### Case 1-11 Diarrhea

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-11-1 | Quality | Frequency and content? | Episodes per day, [ ] Blood [ ] Mucus |
| 1-11-2 | Association | Do you have other symptoms? | [ ] Fever [ ] Vomiting [ ] Severe pain [ ] None |
| 1-11-3 | Hydration | Any signs of dehydration? | [ ] Dizziness [ ] Decreased urine [ ] Unable to keep fluids |

### Case 1-12 Back pain

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-12-1 | Location | Where is the pain? | Upper, Middle, Lower, Radiating to leg |
| 1-12-2 | Quality | Onset and Intensity? | Sudden / Gradual, NRS 1-10 |
| 1-12-3 | Red flags | Do you have any of these? | [ ] Weakness in legs [ ] Incontinence [ ] Fever [ ] Recent trauma [ ] None |

### Case 1-13 Eye

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-13-1 | Quality | Main problem and eye? | Left, Right, Both. [ ] Redness [ ] Pain [ ] Discharge [ ] Vision change |
| 1-13-2 | Association | Any other factors? | [ ] Injury [ ] Contact lenses [ ] Light sensitivity |
| 1-13-3 | Red flags | Emergency signs? | [ ] Sudden vision loss [ ] Severe pain [ ] Penetrating injury |

### Case 1-14 ENT (ear / nose / throat)

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-14-1 | Location | Main problem area? | Ear, Nose, Throat |
| 1-14-2 | Quality | Describe the symptom. | [ ] Pain [ ] Hearing loss [ ] Congestion [ ] Sore throat [ ] Discharge |
| 1-14-3 | Association | Any of these symptoms? | [ ] Fever [ ] Difficulty swallowing [ ] Trouble breathing |

### Case 1-15 Chronic disease (follow-up / medication refill)

| ID | Type | Question | Options / Note |
|----|------|----------|----------------|
| 1-15-1 | Purpose | Reason for visit? | [ ] Routine follow-up [ ] Medication refill [ ] Symptom flare-up |
| 1-15-2 | Condition | Which condition? | [ ] HTN [ ] DM [ ] Heart disease [ ] Asthma/COPD [ ] Other |
| 1-15-3 | Monitoring | Recent home readings? | (e.g., BP 130/80, Sugar 110) |

---

## (2) Universal Phase
*Ask all patients after symptom-specific questions.*

**Question 2-1** — Past medical history
(HTN / DM / Heart disease / Stroke / Cancer / Others)

**Question 2-2** — Previous surgery?

**Question 2-3** — Current medications?

**Question 2-4** — Drug allergy?

**Question 2-5** *(if childbearing age female)* — Are you pregnant?

---

## (3) After Vital Signs Phase
*Triggered by measured vitals.*

### Case 3-1 Temperature

| Condition | Action / Question |
|-----------|-------------------|
| T > 37.5°C | You have a fever. Are you feeling chills? Have you taken any fever-reducing medicine in the last 4 hours? |
| T > 39.0°C | ⚠ High fever detected — please notify staff. |
| T < 35.0°C | ⚠ Low body temperature — please notify staff. |

### Case 3-2 SpO₂

| Condition | Action / Question |
|-----------|-------------------|
| SpO₂ < 94% | Please remeasure. Are you feeling short of breath or having trouble breathing? |
| SpO₂ < 90% | ⚠ Severe hypoxia — please notify staff immediately. |

### Case 3-3 Heart rate

| Condition | Action / Question |
|-----------|--------|
| HR < 50 | ⚠ Bradycardia — please notify staff. Are you feeling dizzy or faint? |
| HR > 120 | Please sit for a while, then remeasure. Are you feeling palpitations (heart racing) or chest pain? |
| HR > 130 | ⚠ Tachycardia — please notify staff immediately. |

### Case 3-4 Blood pressure

| Condition | Action / Question |
|-----------|--------|
| SBP < 90 | ⚠ Low Blood Pressure — please notify staff. Are you feeling dizzy, weak, or faint? |
| SBP > 180 | ⚠ High Blood Pressure — please notify staff. Do you have a severe headache, blurred vision, or chest pain? |
| DBP > 110 | ⚠ High Diastolic Pressure — please notify staff. |

### Case 3-5 Respiratory rate

| Condition | Action / Question |
|-----------|--------|
| RR > 24 or RR < 10 | ⚠ Abnormal Respiratory Rate — please notify staff. Is it hard to catch your breath? |

---

## (4) Output Template (SOAP)

### Subjective (S)

```
<age> y/o <gender>
C.C.: <chief complaint> for <duration>
Detail: <symptom-specific answers from Case 1-X>
Past history: <2-1, 2-2>
Medications: <2-3>
Allergy: <2-4>
NRS: <from 1-1-2, 1-12-2, or similar>
Pregnancy: <2-5 if applicable>
```

### Objective (O)

```
Vital signs: T ___  P ___  R ___  SpO₂ ___%  BP ___/___
```

### Assessment (A)

```
- Potential Triage Level: <Level 1-5 based on symptoms and vitals>
```

### Plan (P)

```
-
```
