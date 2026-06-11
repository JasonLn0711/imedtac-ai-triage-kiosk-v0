## Case 2: AfRVR (Atrial Fibrillation with Rapid Ventricular Response)
### Question Answer demo

### Vitals *(measured first)*

| T | HR | RR | SpO₂ | BP |
|---|-----|-----|------|--------|
| 36.5°C | **130** ⚠ | 16 | 98% | 102/68 |

---

### (0) Initial Phase

| # | Question | Answer |
|---|----------|--------|
| 1 | What's your age? | **76** |
| 2 | What's your biological gender? | Female |
| 3 | What brings you here? | [x] Palpitation · [x] Chest pain · [ ] Headache · [ ] Fever · [ ] Wounded |

---

### (1) Symptom-Specific Phase *(Case 1-3 Chest tightness / pain)*

| # | Question | Answer |
|---|----------|--------|
| 4 | Where is the pain/tightness? | [ ] Left · [x] Middle · [ ] Right · [ ] Radiating to arm/jaw |
| 5 | What does it feel like? | [ ] Pressure · [x] Tightness · [ ] Sharp pain · [ ] Burning · [x] Palpitation |
| 6 | Do you have any of these? | [ ] Shortness of breath · [ ] Sweating · [ ] Dizziness · [ ] Fainting · [x] None |

---

### (2) Universal Phase

| # | Question | Answer |
|---|----------|--------|
| 7 | Past medical history? | [x] Arrhythmia · [ ] Stroke · [x] Hypertension · [ ] Diabetes · [ ] Dyslipidemia · [ ] Cancer |
| 8 | Current medication? | [x] Aspirin · [x] Hypertensive drug · [ ] DM drug |
| 9 | Allergy? | [x] None |

Output:
```
76 y/o Female
C.C.: Palpitation and chest tightness for half day
Detail: Symptoms: Palpitation, tightness in middle chest.
Note: Critical Tachycardia (HR 130) detected.
Past history: Arrhythmia, HTN
Medications: Aspirin, hypertensive drug
Allergy: Nil
Vitals: T 36.5°C, **HR 130**, RR 16, SpO₂ 98%, BP 102/68
```
