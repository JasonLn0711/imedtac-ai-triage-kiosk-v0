(function attachTriageEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.AiTriageKioskEngine = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function triageEngineFactory() {
  const VERSION = {
    product: "AI Triage Kiosk Demo",
    versionLabel: "v0.2.0",
    boundary: "Demo-only workflow support; not diagnosis, treatment advice, final triage level, or HIS/EMR writeback."
  };

  const SAFETY_STATEMENTS = [
    "Synthetic demo data only.",
    "The output is a staff-review summary, not a diagnosis or final triage level.",
    "Vital-sign cues are displayed for review and must be validated against local clinical policy.",
    "No HIS, EMR, FHIR writeback, emergency order, or treatment recommendation is performed."
  ];

  const QUESTION_PHASES = {
    PRE_VITAL_INTAKE: "pre_vital_intake",
    POST_VITAL_FOLLOWUP: "post_vital_followup"
  };

  const MEASUREMENT_STATES = {
    IN_PROGRESS: "in_progress",
    COMPLETE: "complete",
    FAILED: "failed"
  };

  const CASES = [
    {
      id: "chest-pain-high-bp-low-spo2",
      label: "Chest pressure with high BP and low SpO2",
      shortLabel: "Chest pressure",
      fixturePath: "demo/fixtures/chest-pain-high-bp-low-spo2.json",
      opening: "I have chest pressure that started this morning.",
      profile: {
        demoId: "DEMO-001",
        age: "58",
        sex: "Male",
        language: "English",
        arrivalMode: "Walk-in kiosk",
        context: "Synthetic urgent-care visitor"
      },
      vitals: {
        bloodPressure: "188/122 mmHg",
        spo2: "91%",
        heartRate: "112 bpm",
        temperature: "36.8 C",
        bmiContext: "172 cm / 78 kg"
      },
      vitalCues: [
        "Blood pressure value is visibly high in the synthetic payload.",
        "SpO2 value is visibly low in the synthetic payload.",
        "Heart rate is elevated in the synthetic payload."
      ],
      questionLimit: 7,
      sourceFamilies: ["AHA public education", "ENA ESI reference family", "local protocol placeholder"],
      allowedOutput: "Staff-review summary and source-family display only.",
      forbiddenOutput: "No final acuity assignment, condition identification, automatic emergency order, treatment advice, or HIS/EMR writeback."
    },
    {
      id: "fever-urinary",
      label: "Fever with painful urination",
      shortLabel: "Fever and urinary symptoms",
      fixturePath: "demo/fixtures/fever-urinary.json",
      opening: "I have had fever and painful urination for two days.",
      profile: {
        demoId: "DEMO-002",
        age: "42",
        sex: "Female",
        language: "English",
        arrivalMode: "Walk-in kiosk",
        context: "Synthetic urgent-care visitor"
      },
      vitals: {
        bloodPressure: "102/66 mmHg",
        spo2: "96%",
        heartRate: "108 bpm",
        temperature: "38.7 C",
        bmiContext: "Not provided"
      },
      vitalCues: [
        "Temperature is elevated in the synthetic payload.",
        "Heart rate is elevated in the synthetic payload."
      ],
      questionLimit: 7,
      sourceFamilies: ["CDC fever warning reference family", "urology guideline reference family", "local protocol placeholder"],
      allowedOutput: "Staff-review summary and source-family display only.",
      forbiddenOutput: "No antibiotic recommendation, condition identification, final acuity assignment, emergency order, or HIS/EMR writeback."
    },
    {
      id: "respiratory-low-spo2-early-handoff",
      label: "Shortness of breath with fever and lower SpO2",
      shortLabel: "Respiratory handoff",
      fixturePath: "demo/fixtures/respiratory-low-spo2-early-handoff.json",
      opening: "I have felt short of breath for two days.",
      defaultMeasurementState: MEASUREMENT_STATES.IN_PROGRESS,
      allowedQuestionIds: [
        "chief-concern",
        "breathing-duration",
        "severity",
        "respiratory-symptoms",
        "chest-pain-pressure",
        "lung-history-context",
        "medication-allergy"
      ],
      questionLimit: 7,
      profile: {
        demoId: "DEMO-RESP-001",
        age: "80",
        sex: "Male",
        language: "English",
        arrivalMode: "Walk-in kiosk",
        context: "Synthetic urgent-care visitor"
      },
      vitals: {
        bloodPressure: "123/81 mmHg",
        spo2: "92%",
        heartRate: "102 bpm",
        respiratoryRate: "23/min",
        temperature: "38.5 C",
        bmiContext: "Not provided"
      },
      vitalCues: [
        "SpO2 value is lower than expected in the synthetic payload.",
        "Temperature is elevated in the synthetic payload.",
        "Respiratory-rate value is shown as a synthetic review cue."
      ],
      sourceFamilies: ["CDC respiratory warning reference family", "AHA chest-warning reference family", "local protocol placeholder", "Duobao design draft context"],
      allowedOutput: "Staff-review summary and source-family display only.",
      forbiddenOutput: "No diagnosis, final acuity assignment, condition identification, disposition recommendation, treatment advice, or HIS/EMR/FHIR writeback."
    },
    {
      id: "demo-tachycardia-live-001",
      label: "Palpitation and chest tightness with HR 130 cue",
      shortLabel: "Tachycardia live",
      fixturePath: "demo/fixtures/tachycardia-live-demo.json",
      opening: "I feel my heart racing and tightness in the middle of my chest.",
      defaultMeasurementState: MEASUREMENT_STATES.COMPLETE,
      allowedQuestionIds: [
        "tachy-chief-concern",
        "tachy-onset",
        "tachy-current-feeling",
        "tachy-associated-symptoms",
        "tachy-post-vital-heart-rate-cue",
        "tachy-heart-history-meds",
        "tachy-medication-allergy-confirm"
      ],
      questionLimit: 7,
      profile: {
        demoId: "DEMO-TACHY-001",
        age: "76",
        sex: "Female",
        language: "English",
        arrivalMode: "Walk-in kiosk",
        context: "Synthetic live-performance visitor"
      },
      vitals: {
        bloodPressure: "102/68 mmHg",
        spo2: "98%",
        heartRate: "130 bpm",
        respiratoryRate: "16/min",
        temperature: "36.5 C",
        bmiContext: "Not provided"
      },
      vitalCues: [
        "Heart rate is 130 bpm in the synthetic/live demo payload and needs staff review.",
        "SpO2 is 98% in the synthetic payload.",
        "Blood pressure is 102/68 mmHg in the synthetic payload."
      ],
      sourceFamilies: ["Duobao tachycardia case draft", "AHA tachycardia symptom family", "AHA heart-warning symptom family", "MedlinePlus AFib symptom context", "local protocol placeholder"],
      liveDemoControls: {
        primaryMode: "live_measured",
        fallbackModes: ["synthetic_override", "local_scripted_demo"],
        operatorNote: "Use voluntary live measurement only; switch to synthetic override or local scripted demo when the live HR cue is not suitable."
      },
      summaryPreview: {
        handoffReasonCodes: [
          "measured_elevated_heart_rate_demo",
          "reported_palpitations",
          "reported_chest_tightness",
          "associated_symptoms_none_selected",
          "staff_review_needed"
        ],
        subjective: [
          "Synthetic demo patient reports palpitations and middle chest tightness for about half a day.",
          "Selected associated symptoms: none of the listed shortness of breath, sweating, dizziness, or fainting options.",
          "Patient selected rhythm-history and hypertension context; aspirin, antihypertensive medication, and allergy status should be confirmed by staff."
        ],
        objective: [
          "Demo vital payload includes HR 130 bpm, SpO2 98%, BP 102/68 mmHg, respiratory rate 16/min, and temperature 36.5 C.",
          "Heart-rate field quality flag is needs_review."
        ],
        reviewBasis: [
          "Measured heart-rate cue plus reported palpitation / chest-tightness symptoms supports staff review in this demo workflow.",
          "The summary organizes measured vitals and selected answers for human review."
        ],
        reviewAction: [
          "Please review measured heart rate, reported symptoms, rhythm-history selection, and medication/allergy confirmation."
        ],
        staffHandoffNote: "Review measured heart rate and reported cardiopulmonary symptoms.",
        scopeControls: [
          "Staff-review intake support",
          "Human review workflow",
          "Synthetic-data demo context",
          "Separate validation path before clinical use"
        ]
      },
      allowedOutput: "Staff-review summary and source-family display only.",
      forbiddenOutput: "No AfRVR diagnosis, arrhythmia diagnosis, ACS diagnosis, ECG order, treatment advice, final acuity assignment, formal triage score, or HIS/EMR/FHIR writeback."
    }
  ];

  const QUESTION_BANK = [
    {
      id: "chief-concern",
      field: "chiefConcern",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "What is the main reason you are using the kiosk today?",
      type: "single",
      value: "Starts with the patient's own concern before symptom-specific follow-up.",
      options: ["Chest pressure or chest pain", "Shortness of breath", "Fever or chills", "Painful urination", "Dizziness or weakness", "Other concern"]
    },
    {
      id: "breathing-duration",
      field: "breathingDuration",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "How long have you felt short of breath?",
      type: "single",
      value: "Adds duration context for staff review before assigning any clinical meaning.",
      options: ["Started today", "1 to 2 days", "3 to 7 days", "More than 1 week", "Not sure"]
    },
    {
      id: "onset",
      field: "onset",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "When did this problem start?",
      type: "single",
      value: "Adds timing for staff review.",
      options: ["Just now or within 1 hour", "Today", "1 to 2 days ago", "3 to 7 days ago", "More than 1 week ago", "Not sure"]
    },
    {
      id: "severity",
      field: "severity",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "How severe does it feel right now?",
      type: "single",
      value: "Captures patient-reported severity without assigning a triage level.",
      options: ["Mild", "Moderate", "Severe", "Worst I can imagine", "Not sure"]
    },
    {
      id: "breathing",
      field: "breathing",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Are you having trouble breathing right now?",
      type: "single",
      value: "Makes a patient-reported breathing concern visible to staff.",
      options: ["No", "A little", "Yes", "I cannot speak full sentences", "Not sure"]
    },
    {
      id: "respiratory-symptoms",
      field: "respiratorySymptoms",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Which symptoms are present?",
      type: "multi",
      value: "Collects respiratory and fever context without naming a condition.",
      options: ["Cough", "Fever or chills", "Chest discomfort", "None of these", "Not sure"]
    },
    {
      id: "chest-pain-pressure",
      field: "chestPainPressure",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Are you having chest pain or pressure right now?",
      type: "single",
      value: "Confirms active chest symptoms for staff review after vitals are ready.",
      options: ["No", "Yes, chest pressure", "Yes, chest pain", "Not sure"]
    },
    {
      id: "chest-details",
      field: "chestDetails",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "For chest discomfort, which descriptions fit?",
      type: "multi",
      value: "Collects structured chest-symptom descriptors for review.",
      options: ["Pressure or tightness", "Sharp pain", "Spreads to arm, jaw, back, or shoulder", "Sweating or nausea", "Worse with activity", "None of these"]
    },
    {
      id: "neurologic-symptoms",
      field: "neuroSymptoms",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Do you have any new neurologic symptoms?",
      type: "multi",
      value: "Surfaces patient-reported neurologic symptoms without diagnosis.",
      options: ["New face droop", "New arm or leg weakness", "New speech trouble", "New confusion", "New severe headache", "None of these"]
    },
    {
      id: "fever-details",
      field: "feverDetails",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "For fever or infection concern, which descriptions fit?",
      type: "multi",
      value: "Collects fever context and visible review cues.",
      options: ["Measured fever", "Chills", "Cough or sore throat", "Painful urination", "Back or flank pain", "None of these"]
    },
    {
      id: "urinary-details",
      field: "urinaryDetails",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "For urinary symptoms, which descriptions fit?",
      type: "multi",
      value: "Collects urinary symptom context without diagnosing infection.",
      options: ["Pain or burning while urinating", "Urinating more often", "Urgent need to urinate", "Blood in urine", "Unable to urinate", "None of these"]
    },
    {
      id: "lung-history-context",
      field: "lungHistoryContext",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Do you have chronic lung disease, use home oxygen, or use breathing medicines?",
      type: "multi",
      value: "Adds baseline respiratory context to the staff-review summary.",
      options: ["Chronic lung disease", "Home oxygen", "Breathing medicines or inhaler", "None of these", "Not sure"]
    },
    {
      id: "pregnancy-context",
      field: "pregnancyContext",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Is pregnancy possible or currently known?",
      type: "single",
      value: "Keeps a key context field visible for staff review.",
      options: ["No", "Yes", "Possible", "Not applicable", "Prefer to discuss with staff"]
    },
    {
      id: "medication-allergy",
      field: "medicationAllergy",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Can you provide current medications or allergies?",
      type: "multi",
      value: "Routes medication and allergy details to staff confirmation.",
      options: ["Medication list available", "Medication list not available", "Known drug allergy", "No known drug allergy", "Not sure"]
    },
    {
      id: "tachy-chief-concern",
      field: "tachyChiefConcern",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "What is the main reason you are using the kiosk today?",
      type: "single",
      value: "Anchors the cardiopulmonary branch after the heart-rate cue is available.",
      options: ["Heart racing / palpitations", "Chest tightness / pressure", "Shortness of breath or dizziness", "Other / not sure"]
    },
    {
      id: "tachy-onset",
      field: "tachyOnset",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "When did this start?",
      type: "single",
      value: "Adds onset and duration context to the staff-review summary.",
      options: ["Within the last hour", "A few hours ago", "About half a day", "More than one day / not sure"]
    },
    {
      id: "tachy-current-feeling",
      field: "tachyCurrentFeeling",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Which descriptions fit what you feel now?",
      type: "multi",
      value: "Preserves the palpitation and chest-tightness branch using choice-only input.",
      options: ["Heart racing or pounding", "Chest tightness or heaviness", "Chest pressure or pain", "Burning, sharp discomfort, or not sure"]
    },
    {
      id: "tachy-associated-symptoms",
      field: "tachyAssociatedSymptoms",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Are any of these happening with it?",
      type: "multi",
      value: "Captures warning-symptom families for staff review without diagnosis.",
      options: ["Shortness of breath", "Sweating, nausea, or unusual fatigue", "Dizziness, lightheadedness, or fainting", "None of these"]
    },
    {
      id: "tachy-post-vital-heart-rate-cue",
      field: "tachyPostVitalHeartRateCue",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "The kiosk received a high heart-rate reading for this demo. How do you feel right now?",
      type: "single",
      value: "Connects the HR 130 vital cue with current patient-reported status.",
      options: ["My heart still feels fast", "My chest still feels heavy / tight", "Both", "Neither now / not sure"]
    },
    {
      id: "tachy-heart-history-meds",
      field: "tachyHeartHistoryMeds",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Have you been told you have a heart rhythm problem, or do you take heart / blood-pressure medicine?",
      type: "multi",
      value: "Adds rhythm-history and heart/blood-pressure medication context for staff confirmation.",
      options: ["Known rhythm problem", "Heart or blood-pressure medicine", "No known history / medicine", "Not sure, staff should confirm"]
    },
    {
      id: "tachy-medication-allergy-confirm",
      field: "tachyMedicationAllergyConfirm",
      phase: QUESTION_PHASES.POST_VITAL_FOLLOWUP,
      text: "Do you have medication allergies or medicines staff should confirm?",
      type: "multi",
      value: "Keeps medication and allergy context visible for the human review workflow.",
      options: ["Medication allergy", "Regular medicines", "No known medication allergy", "Not sure"]
    },
    {
      id: "support-needed",
      field: "supportNeeded",
      phase: QUESTION_PHASES.PRE_VITAL_INTAKE,
      text: "Do you need staff help before continuing?",
      type: "multi",
      value: "Supports kiosk usability and handoff safety.",
      options: ["Need help reading", "Need help typing", "Need interpreter support", "Need wheelchair or mobility help", "No help needed"]
    },
  ];

  const FIELD_LABELS = Object.fromEntries(QUESTION_BANK.map((question) => [question.field, question.text]));

  function createInitialState(caseId = CASES[0].id, options = {}) {
    const selectedCase = findCase(caseId);
    return {
      caseId: selectedCase.id,
      turn: 0,
      measurementState: options.measurementState || selectedCase.defaultMeasurementState || MEASUREMENT_STATES.COMPLETE,
      demoMode: options.demoMode || (selectedCase.liveDemoControls && selectedCase.liveDemoControls.primaryMode) || "local_scripted_demo",
      answers: {},
      answeredQuestionIds: [],
      transcript: selectedCase.opening
    };
  }

  function findCase(caseId) {
    return CASES.find((item) => item.id === caseId) || CASES[0];
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase();
  }

  function answerText(value) {
    if (Array.isArray(value)) return value.join(" ");
    return String(value || "");
  }

  function fieldAnswered(state, field) {
    const value = state.answers[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== "";
  }

  function measurementComplete(state) {
    return (state.measurementState || MEASUREMENT_STATES.COMPLETE) === MEASUREMENT_STATES.COMPLETE;
  }

  function markVitalsReady(state) {
    return {
      ...state,
      measurementState: MEASUREMENT_STATES.COMPLETE
    };
  }

  function setDemoMode(state, demoMode) {
    const selectedCase = findCase(state.caseId);
    const allowedModes = selectedCase.liveDemoControls
      ? [selectedCase.liveDemoControls.primaryMode, ...selectedCase.liveDemoControls.fallbackModes]
      : ["local_scripted_demo"];
    const nextMode = allowedModes.includes(demoMode) ? demoMode : allowedModes[0];
    return {
      ...state,
      demoMode: nextMode
    };
  }

  function caseQuestionLimit(selectedCase) {
    const limit = Number(selectedCase.questionLimit);
    return Number.isFinite(limit) && limit > 0 ? limit : QUESTION_BANK.length;
  }

  function caseAllowsQuestion(selectedCase, question) {
    return !selectedCase.allowedQuestionIds || selectedCase.allowedQuestionIds.includes(question.id);
  }

  function caseQuestionBank(selectedCase) {
    return QUESTION_BANK.filter((question) => caseAllowsQuestion(selectedCase, question));
  }

  function answeredQuestionCountForCase(state, selectedCase) {
    if (!selectedCase.allowedQuestionIds) return state.answeredQuestionIds.length;
    return state.answeredQuestionIds.filter((questionId) => selectedCase.allowedQuestionIds.includes(questionId)).length;
  }

  function inferConcernKeywords(state) {
    const selectedCase = findCase(state.caseId);
    const combined = normalizeText(`${selectedCase.opening} ${state.transcript} ${Object.values(state.answers).map(answerText).join(" ")}`);
    return {
      chest: /chest|pressure|tightness|heart|arm|jaw|shoulder/.test(combined),
      breathing: /breath|shortness|oxygen|spo2|speak full/.test(combined),
      fever: /fever|chill|temperature|infection|cough/.test(combined),
      urinary: /urinar|urinat|urine|pee|burn|flank|back pain/.test(combined),
      neuro: /weak|speech|face|confus|headache|dizz/.test(combined)
    };
  }

  function questionScore(question, state) {
    const selectedCase = findCase(state.caseId);
    if (!caseAllowsQuestion(selectedCase, question)) {
      return null;
    }
    if (answeredQuestionCountForCase(state, selectedCase) >= caseQuestionLimit(selectedCase)) {
      return null;
    }
    if (state.answeredQuestionIds.includes(question.id) || fieldAnswered(state, question.field)) {
      return null;
    }
    if (!measurementComplete(state) && question.phase === QUESTION_PHASES.POST_VITAL_FOLLOWUP) {
      return null;
    }

    const concern = inferConcernKeywords(state);
    let score = 40;
    const reasons = [];

    if (!measurementComplete(state) && question.phase === QUESTION_PHASES.PRE_VITAL_INTAKE) {
      score += 22;
      reasons.push("safe during vital-sign measurement");
    }
    if (measurementComplete(state) && question.phase === QUESTION_PHASES.POST_VITAL_FOLLOWUP) {
      score += 10;
      reasons.push("post-vital follow-up");
    }

    if (question.id === "chief-concern") {
      score += state.turn === 0 ? 50 : 0;
      reasons.push("first kiosk anchor");
    }

    if (question.id === "onset" || question.id === "severity") {
      score += state.turn <= 2 ? 20 : 12;
      reasons.push("core review field");
    }

    if (question.id === "breathing-duration" && (concern.breathing || selectedCase.id.includes("respiratory"))) {
      score += selectedCase.id.includes("respiratory") ? 34 : 20;
      reasons.push("respiratory duration context");
    }

    if (question.id === "respiratory-symptoms" && (concern.breathing || concern.fever || selectedCase.id.includes("respiratory"))) {
      score += selectedCase.id.includes("respiratory") ? 30 : 18;
      reasons.push("respiratory symptom context");
    }

    if (question.id === "breathing" && (concern.breathing || /9[0-2]%/.test(selectedCase.vitals.spo2))) {
      score += 32;
      reasons.push("visible breathing or SpO2 context");
    }

    if (question.id === "chest-pain-pressure" && (concern.chest || selectedCase.id.includes("respiratory"))) {
      score += 30;
      reasons.push("cardiopulmonary follow-up context");
    }

    if (question.id === "chest-details" && concern.chest) {
      score += 34;
      reasons.push("matches chest-pressure case context");
    }

    if (question.id === "neurologic-symptoms" && (concern.neuro || selectedCase.id.includes("chest"))) {
      score += 16;
      reasons.push("screening context before staff review");
    }

    if (question.id === "fever-details" && (concern.fever || selectedCase.vitals.temperature.startsWith("38"))) {
      score += 34;
      reasons.push("matches fever or temperature context");
    }

    if (question.id === "urinary-details" && concern.urinary) {
      score += 34;
      reasons.push("matches urinary symptom context");
    }

    if (question.id === "lung-history-context" && (concern.breathing || selectedCase.id.includes("respiratory"))) {
      score += 24;
      reasons.push("baseline respiratory context");
    }

    if (question.id === "pregnancy-context" && (concern.urinary || concern.fever)) {
      score += 14;
      reasons.push("context field for staff confirmation");
    }

    if (question.id === "medication-allergy") {
      score += state.turn >= 3 ? 12 : 4;
      reasons.push("handoff readiness");
    }

    if (question.id.startsWith("tachy-") && selectedCase.id === "demo-tachycardia-live-001") {
      const order = selectedCase.allowedQuestionIds.indexOf(question.id);
      score += 80 - Math.max(order, 0) * 3;
      reasons.push("tachycardia live lane sequence");
    }

    if (question.id === "support-needed") {
      score += state.turn >= 4 ? 10 : 2;
      reasons.push("kiosk assistance check");
    }

    return {
      question,
      score,
      reasons: reasons.length ? reasons : ["available governed question"]
    };
  }

  function rankQuestions(state) {
    const selectedCase = findCase(state.caseId);
    return caseQuestionBank(selectedCase)
      .map((question) => questionScore(question, state))
      .filter(Boolean)
      .sort((left, right) => right.score - left.score || left.question.id.localeCompare(right.question.id));
  }

  function selectNextQuestion(state) {
    const ranked = rankQuestions(state);
    return {
      selected: ranked[0] || null,
      ranked
    };
  }

  function recordAnswer(state, questionId, value) {
    const question = QUESTION_BANK.find((item) => item.id === questionId);
    if (!question) throw new Error(`Unknown question: ${questionId}`);
    const next = {
      ...state,
      turn: state.turn + 1,
      answers: { ...state.answers, [question.field]: value },
      answeredQuestionIds: [...state.answeredQuestionIds, question.id]
    };
    return next;
  }

  function buildStaffSummary(state) {
    const selectedCase = findCase(state.caseId);
    const answered = Object.entries(state.answers).map(([field, value]) => ({
      field,
      label: FIELD_LABELS[field] || field,
      value
    }));
    const missing = caseQuestionBank(selectedCase)
      .filter((question) => !fieldAnswered(state, question.field))
      .map((question) => ({ field: question.field, label: question.text }));
    const reviewCues = [...selectedCase.vitalCues];

    if (String(state.answers.breathing || "").includes("cannot speak")) {
      reviewCues.push("Patient selected inability to speak full sentences.");
    }
    if (Array.isArray(state.answers.chestDetails) && state.answers.chestDetails.some((item) => item.includes("Spreads"))) {
      reviewCues.push("Patient selected chest discomfort spreading to another area.");
    }
    if (String(state.answers.chestPainPressure || "").includes("Yes")) {
      reviewCues.push("Patient selected active chest pain or pressure.");
    }
    if (Array.isArray(state.answers.respiratorySymptoms) && !state.answers.respiratorySymptoms.includes("None of these")) {
      reviewCues.push("Patient selected one or more respiratory or fever descriptors.");
    }
    if (Array.isArray(state.answers.lungHistoryContext) && !state.answers.lungHistoryContext.includes("None of these")) {
      reviewCues.push("Patient selected baseline respiratory context for staff confirmation.");
    }
    if (Array.isArray(state.answers.neuroSymptoms) && !state.answers.neuroSymptoms.includes("None of these")) {
      reviewCues.push("Patient selected one or more neurologic symptom descriptors.");
    }
    if (Array.isArray(state.answers.urinaryDetails) && state.answers.urinaryDetails.includes("Unable to urinate")) {
      reviewCues.push("Patient selected inability to urinate.");
    }
    if (Array.isArray(state.answers.tachyAssociatedSymptoms) && state.answers.tachyAssociatedSymptoms.includes("None of these")) {
      reviewCues.push("Patient selected none of the listed associated symptom options in the tachycardia lane.");
    }
    if (String(state.answers.tachyPostVitalHeartRateCue || "").includes("Both")) {
      reviewCues.push("Patient selected ongoing fast heart feeling and chest heaviness after the heart-rate cue.");
    }
    if (Array.isArray(state.answers.tachyHeartHistoryMeds) && state.answers.tachyHeartHistoryMeds.length > 0) {
      reviewCues.push("Patient selected heart-rhythm history or heart/blood-pressure medicine context for staff confirmation.");
    }

    return {
      caseLabel: selectedCase.label,
      profileSummary: `${selectedCase.profile.age}-year-old ${selectedCase.profile.sex.toLowerCase()} synthetic visitor, ${selectedCase.profile.arrivalMode.toLowerCase()}.`,
      boundary: VERSION.boundary,
      vitalCues: reviewCues,
      answered,
      missing,
      sourceFamilies: selectedCase.sourceFamilies,
      allowedOutput: selectedCase.allowedOutput,
      forbiddenOutput: selectedCase.forbiddenOutput,
      staffReviewSummary: selectedCase.summaryPreview || null,
      requiresStaffReview: true,
      measurementState: state.measurementState || MEASUREMENT_STATES.COMPLETE,
      demoMode: state.demoMode || (selectedCase.liveDemoControls && selectedCase.liveDemoControls.primaryMode) || "local_scripted_demo",
      liveDemoControls: selectedCase.liveDemoControls || null,
      questionPhases: {
        preVitalIntakeAnswered: answered.filter((item) => {
          const question = QUESTION_BANK.find((candidate) => candidate.field === item.field);
          return question && question.phase === QUESTION_PHASES.PRE_VITAL_INTAKE;
        }).length,
        postVitalFollowupAnswered: answered.filter((item) => {
          const question = QUESTION_BANK.find((candidate) => candidate.field === item.field);
          return question && question.phase === QUESTION_PHASES.POST_VITAL_FOLLOWUP;
        }).length
      },
      safetyStatements: SAFETY_STATEMENTS
    };
  }

  return {
    VERSION,
    SAFETY_STATEMENTS,
    QUESTION_PHASES,
    MEASUREMENT_STATES,
    CASES,
    QUESTION_BANK,
    FIELD_LABELS,
    createInitialState,
    findCase,
    inferConcernKeywords,
    measurementComplete,
    markVitalsReady,
    setDemoMode,
    rankQuestions,
    selectNextQuestion,
    recordAnswer,
    buildStaffSummary
  };
});
