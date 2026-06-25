const state = {
  sessionKey: null,
  currentQuestion: null,
  selectedOptionIds: [],
  answerValue: null,
  durationUnit: "days"
};

const elements = {
  baseUrlInput: document.querySelector("#baseUrlInput"),
  tokenInput: document.querySelector("#tokenInput"),
  payloadFormatSelect: document.querySelector("#payloadFormatSelect"),
  payloadEditor: document.querySelector("#payloadEditor"),
  startButton: document.querySelector("#startButton"),
  autoAnswerButton: document.querySelector("#autoAnswerButton"),
  answerFirstButton: document.querySelector("#answerFirstButton"),
  refreshPayloadButton: document.querySelector("#refreshPayloadButton"),
  healthButton: document.querySelector("#healthButton"),
  resetButton: document.querySelector("#resetButton"),
  submitButton: document.querySelector("#submitButton"),
  sessionMeta: document.querySelector("#sessionMeta"),
  progressLabel: document.querySelector("#progressLabel"),
  questionText: document.querySelector("#questionText"),
  statusPill: document.querySelector("#statusPill"),
  routePreview: document.querySelector("#routePreview"),
  optionsMount: document.querySelector("#optionsMount"),
  summaryMount: document.querySelector("#summaryMount"),
  rawOutput: document.querySelector("#rawOutput"),
  lastStatus: document.querySelector("#lastStatus"),
  heartRateInput: document.querySelector("#heartRateInput"),
  spo2Input: document.querySelector("#spo2Input"),
  temperatureInput: document.querySelector("#temperatureInput"),
  systolicInput: document.querySelector("#systolicInput"),
  diastolicInput: document.querySelector("#diastolicInput"),
  respiratoryRateInput: document.querySelector("#respiratoryRateInput"),
  glucoseInput: document.querySelector("#glucoseInput"),
  heightInput: document.querySelector("#heightInput"),
  weightInput: document.querySelector("#weightInput")
};

const vitalInputs = [
  elements.heartRateInput,
  elements.spo2Input,
  elements.temperatureInput,
  elements.systolicInput,
  elements.diastolicInput,
  elements.respiratoryRateInput,
  elements.glucoseInput,
  elements.heightInput,
  elements.weightInput
];

const presets = {
  tachycardia: {
    heartRate: 130,
    spo2: 98,
    temperature: 36.5,
    systolic: 102,
    diastolic: 68,
    respiratoryRate: 16,
    glucose: 80,
    height: 165,
    weight: 60
  },
  fever: {
    heartRate: 96,
    spo2: 97,
    temperature: 38.5,
    systolic: 118,
    diastolic: 76,
    respiratoryRate: 18,
    glucose: 92,
    height: 165,
    weight: 60
  },
  lowSpo2: {
    heartRate: 108,
    spo2: 93,
    temperature: 37.2,
    systolic: 124,
    diastolic: 78,
    respiratoryRate: 22,
    glucose: 96,
    height: 170,
    weight: 72
  },
  normal: {
    heartRate: 78,
    spo2: 98,
    temperature: 36.6,
    systolic: 118,
    diastolic: 76,
    respiratoryRate: 16,
    glucose: 90,
    height: 170,
    weight: 70
  }
};

function requestId(prefix) {
  return `req-ui-${prefix}-${Date.now()}`;
}

function idemKey(prefix) {
  return `idem-ui-${prefix}-${Date.now()}`;
}

function numberValue(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? value : null;
}

function collectVitals() {
  return {
    heartRate: numberValue(elements.heartRateInput),
    spo2: numberValue(elements.spo2Input),
    temperature: numberValue(elements.temperatureInput),
    systolic: numberValue(elements.systolicInput),
    diastolic: numberValue(elements.diastolicInput),
    respiratoryRate: numberValue(elements.respiratoryRateInput),
    glucose: numberValue(elements.glucoseInput),
    height: numberValue(elements.heightInput),
    weight: numberValue(elements.weightInput)
  };
}

function predictedRoute(vitals) {
  if (vitals.temperature !== null && (vitals.temperature >= 39 || vitals.temperature <= 35)) return "please notify staff";
  if (vitals.spo2 !== null && vitals.spo2 <= 91) return "please notify staff";
  if (vitals.heartRate !== null && (vitals.heartRate <= 40 || vitals.heartRate >= 131)) return "please notify staff";
  if (vitals.systolic !== null && (vitals.systolic <= 90 || vitals.systolic >= 220)) return "please notify staff";
  if (vitals.respiratoryRate !== null && (vitals.respiratoryRate <= 8 || vitals.respiratoryRate >= 25)) return "please notify staff";
  if (vitals.heartRate !== null && vitals.heartRate >= 41 && vitals.heartRate <= 50) return "bradycardia";
  if (vitals.heartRate !== null && vitals.heartRate > 120) return "tachycardia";
  if (vitals.spo2 !== null && vitals.spo2 < 94) return "hypoxia";
  if (vitals.respiratoryRate !== null && vitals.respiratoryRate >= 21 && vitals.respiratoryRate <= 24) return "shortness of breath";
  if (vitals.respiratoryRate !== null && vitals.respiratoryRate >= 9 && vitals.respiratoryRate <= 11) return "respiratory depression";
  if (vitals.systolic !== null && vitals.systolic >= 180) return "hypertension";
  if (vitals.temperature !== null && vitals.temperature >= 38) return "fever";
  return "initial intake";
}

function chiefConcernForRoute(route) {
  if (route === "tachycardia" || route === "palpitation") return "heart racing";
  if (route === "shortness of breath" || route === "hypoxia" || route === "respiratory depression") return "shortness of breath";
  if (route === "fever") return "fever";
  if (route === "bradycardia") return "slow heart rate";
  if (route === "hypertension") return "high blood pressure";
  return "";
}

function qualityFlag(value, kind) {
  if (value === null) return "missing";
  if (kind === "heartRate" && (value <= 50 || value > 120)) return "needs_review";
  if (kind === "spo2" && value < 94) return "needs_review";
  if (kind === "temperature" && (value <= 35 || value >= 38)) return "needs_review";
  if (kind === "systolic" && (value <= 90 || value >= 180)) return "needs_review";
  if (kind === "respiratoryRate" && (value <= 11 || value >= 21)) return "needs_review";
  return "ok";
}

function measured(value, unit, kind) {
  return {
    value,
    unit,
    measurement_status: value === null ? "missing" : "measured",
    quality_flag: qualityFlag(value, kind),
    missing_reason: value === null ? "not_provided" : null
  };
}

function normalizedVitals(vitals) {
  return {
    heart_rate_bpm: measured(vitals.heartRate, "bpm", "heartRate"),
    spo2_percent: measured(vitals.spo2, "%", "spo2"),
    temperature_c: measured(vitals.temperature, "C", "temperature"),
    blood_pressure_systolic_mm_hg: measured(vitals.systolic, "mmHg", "systolic"),
    blood_pressure_diastolic_mm_hg: measured(vitals.diastolic, "mmHg", "diastolic"),
    respiratory_rate_per_min: measured(vitals.respiratoryRate, "/min", "respiratoryRate"),
    glucose_mg_dl: measured(vitals.glucose, "mg/dL", "glucose"),
    height_cm: measured(vitals.height, "cm", "height"),
    weight_kg: measured(vitals.weight, "kg", "weight")
  };
}

function imvsVitals(vitals) {
  const payload = {
    CHART_NO: "DEMO-VITAL-001",
    SAVE_DATETIME: "2026/06/03 10:00:00",
    UPLOAD_DATETIME: "2026/06/03 10:00:05",
    STATION_NAME: "AI_TRIAGE_DEMO_KIOSK",
    HR: { BP_Value: String(vitals.heartRate ?? ""), Unit: "bpm" },
    SPO2: { Value: String(vitals.spo2 ?? ""), Unit: "%" },
    Temp: { Value: String(vitals.temperature ?? ""), Unit: "C" },
    NBP: {
      SYS_Value: String(vitals.systolic ?? ""),
      DIA_Value: String(vitals.diastolic ?? ""),
      Unit: "mmHg"
    },
    Glucose: { Value: String(vitals.glucose ?? ""), Unit: "mg/dL" },
    Height: { Value: String(vitals.height ?? ""), Unit: "cm" },
    Weight: { Value: String(vitals.weight ?? ""), Unit: "kg" }
  };
  if (vitals.respiratoryRate !== null) {
    payload.respiratory_rate_per_min = measured(vitals.respiratoryRate, "/min", "respiratoryRate");
  }
  return payload;
}

function capabilitiesForRoute(route) {
  return {
    question_types: ["single_choice", "multi_choice", "text"],
    max_questions: route === "tachycardia" || route === "palpitation" ? 7 : 8,
    max_options_per_question: 9,
    max_option_label_length: 64,
    variable_option_count: true,
    voice_input: false
  };
}

function buildStartBody() {
  const vitals = collectVitals();
  const route = predictedRoute(vitals);
  const format = elements.payloadFormatSelect.value;
  return {
    request_id: requestId("start-vitals"),
    idempotency_key: idemKey("start-vitals"),
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    client: {
      source: "vital-first-api-checker",
      site: "local",
      locale: "en-US"
    },
    patient_context: {
      demo_patient_id: "DEMO-VITAL-001",
      identity_mode: "demo",
      chief_concern: chiefConcernForRoute(route)
    },
    vitals: format === "imvs" ? imvsVitals(vitals) : normalizedVitals(vitals),
    capabilities: capabilitiesForRoute(route)
  };
}

function refreshPayload() {
  const body = buildStartBody();
  elements.payloadEditor.value = JSON.stringify(body, null, 2);
  elements.routePreview.textContent = `route: ${predictedRoute(collectVitals())}`;
}

function apiBaseUrl() {
  return elements.baseUrlInput.value.trim() || window.location.origin;
}

function apiUrl(path) {
  return new URL(path, apiBaseUrl()).toString();
}

function headers() {
  const token = elements.tokenInput.value.trim();
  const value = { "Content-Type": "application/json" };
  if (token) value.Authorization = `Bearer ${token}`;
  return value;
}

function startBodyFromEditor() {
  try {
    const value = JSON.parse(elements.payloadEditor.value);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Start request must be a JSON object.");
    }
    value.request_id = requestId("start-vitals");
    value.idempotency_key = idemKey("start-vitals");
    return value;
  } catch (error) {
    throw new Error(`Invalid start request JSON: ${error.message}`);
  }
}

function answerBody() {
  const answer = {
    selected_option_ids: state.selectedOptionIds,
    scale_value: null
  };
  if (isNumberQuestion(state.currentQuestion)) {
    answer.numeric_value = Number(state.answerValue);
  } else if (isDurationQuestion(state.currentQuestion)) {
    answer.text_value = String(state.answerValue || "").trim() + " " + state.durationUnit;
  } else if (isTextQuestion(state.currentQuestion)) {
    answer.text_value = String(state.answerValue || "").trim();
  }
  return {
    request_id: requestId("answer"),
    idempotency_key: idemKey(`answer-${state.currentQuestion.id}`),
    session_key: state.sessionKey,
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    question_phase: state.currentQuestion.phase || "post_measurement_intake",
    question_id: state.currentQuestion.id,
    answer,
    client_event: {
      answered_at: new Date().toISOString(),
      input_mode: isNumberQuestion(state.currentQuestion) || isDurationQuestion(state.currentQuestion) ? "number_pad" : "touch"
    }
  };
}

async function postJson(path, body) {
  const response = await fetch(apiUrl(path), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });
  const data = await response.json();
  showRaw(data, response.status);
  if (!response.ok) {
    throw new Error(data.error ? data.error.message : `HTTP ${response.status}`);
  }
  return data;
}

async function getJson(path) {
  const response = await fetch(apiUrl(path));
  const data = await response.json();
  showRaw(data, response.status);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return data;
}

function showRaw(data, statusCode) {
  elements.rawOutput.textContent = JSON.stringify(data, null, 2);
  elements.lastStatus.textContent = statusCode ? `HTTP ${statusCode}` : "";
}

function renderQuestion(data) {
  state.currentQuestion = data.question;
  state.selectedOptionIds = [];
  state.answerValue = null;
  elements.statusPill.textContent = data.status;
  elements.progressLabel.textContent = `Question ${data.progress.current} of ${data.progress.expected_total}`;
  elements.questionText.textContent = data.question.text;
  elements.sessionMeta.textContent = `Session: ${data.session_key} | ${data.question_phase}`;
  elements.submitButton.disabled = true;
  elements.answerFirstButton.disabled = false;
  elements.autoAnswerButton.disabled = false;
  elements.summaryMount.classList.add("empty");
  elements.summaryMount.textContent = "Summary appears after the final question.";

  if (isNumberQuestion(data.question)) {
    renderNumberPad();
    return;
  }
  if (isDurationQuestion(data.question)) {
    renderDurationPad();
    return;
  }
  if (isTextQuestion(data.question)) {
    renderTextEntry();
    return;
  }

  elements.optionsMount.innerHTML = data.question.options.map((option) => `
    <button class="option" type="button" data-option-id="${escapeHtml(option.id)}">
      <strong>${escapeHtml(option.label)}</strong>
      <small>${escapeHtml(option.id)}</small>
    </button>
  `).join("");
  elements.optionsMount.querySelectorAll(".option").forEach((button) => {
    button.addEventListener("click", () => toggleOption(button));
  });
}

function isNumberQuestion(question) {
  if (!question) return false;
  return question.type === "number";
}

function isTextQuestion(question) {
  if (!question) return false;
  return question.type === "text" || question.type === "time";
}

function isDurationQuestion(question) {
  if (!question) return false;
  return question.type === "time";
}

function renderNumberPad() {
  state.answerValue = "";
  elements.optionsMount.innerHTML = `
    <div class="answer-pad">
      <div class="answer-display" aria-live="polite">
        <span class="answer-display-label">Age</span>
        <div id="answerValueDisplay" class="answer-display-value">Enter age</div>
      </div>
      <div class="numpad" role="group" aria-label="Age number pad">
        ${[1,2,3,4,5,6,7,8,9].map((digit) => `<button class="numpad-key" type="button" data-digit="${digit}">${digit}</button>`).join("")}
        <button class="numpad-key secondary" type="button" data-action="clear">Clear</button>
        <button class="numpad-key" type="button" data-digit="0">0</button>
        <button class="numpad-key secondary" type="button" data-action="backspace">Back</button>
      </div>
    </div>
  `;
  elements.optionsMount.querySelectorAll("[data-digit]").forEach((button) => {
    button.addEventListener("click", () => appendDigit(button.dataset.digit));
  });
  elements.optionsMount.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handlePadAction(button.dataset.action));
  });
  if (isDurationQuestion(state.currentQuestion)) updateDurationPad();
  else updateNumberPad();
}

function renderDurationPad() {
  state.answerValue = "";
  state.durationUnit = "days";
  elements.optionsMount.innerHTML = `
    <div class="answer-pad">
      <div class="answer-display" aria-live="polite">
        <span class="answer-display-label">Duration</span>
        <div id="answerValueDisplay" class="answer-display-value">Enter duration</div>
      </div>
      <div class="unit-picker" role="group" aria-label="Duration unit">
        <button class="unit-button" type="button" data-unit="hours">hours</button>
        <button class="unit-button" type="button" data-unit="days">days</button>
        <button class="unit-button" type="button" data-unit="weeks">weeks</button>
        <button class="unit-button" type="button" data-unit="months">months</button>
      </div>
      <div class="numpad" role="group" aria-label="Duration number pad">
        <button class="numpad-key" type="button" data-digit="1">1</button>
        <button class="numpad-key" type="button" data-digit="2">2</button>
        <button class="numpad-key" type="button" data-digit="3">3</button>
        <button class="numpad-key" type="button" data-digit="4">4</button>
        <button class="numpad-key" type="button" data-digit="5">5</button>
        <button class="numpad-key" type="button" data-digit="6">6</button>
        <button class="numpad-key" type="button" data-digit="7">7</button>
        <button class="numpad-key" type="button" data-digit="8">8</button>
        <button class="numpad-key" type="button" data-digit="9">9</button>
        <button class="numpad-key secondary" type="button" data-action="clear">Clear</button>
        <button class="numpad-key" type="button" data-digit="0">0</button>
        <button class="numpad-key secondary" type="button" data-action="backspace">Back</button>
      </div>
    </div>
  `;
  elements.optionsMount.querySelectorAll("[data-unit]").forEach((button) => {
    button.addEventListener("click", () => selectDurationUnit(button.dataset.unit));
  });
  elements.optionsMount.querySelectorAll("[data-digit]").forEach((button) => {
    button.addEventListener("click", () => appendDigit(button.dataset.digit));
  });
  elements.optionsMount.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handlePadAction(button.dataset.action));
  });
  updateDurationPad();
}

function renderTextEntry() {
  elements.optionsMount.innerHTML = `
    <label class="answer-input">
      <span>Type answer</span>
      <input id="answerValueInput" type="text" inputmode="text" autocomplete="off">
    </label>
  `;
  const input = elements.optionsMount.querySelector("#answerValueInput");
  input.addEventListener("input", () => {
    state.answerValue = input.value;
    elements.submitButton.disabled = !input.value.trim();
  });
  input.focus();
}

function updateNumberPad() {
  const display = elements.optionsMount.querySelector("#answerValueDisplay");
  if (!display) return;
  display.textContent = state.answerValue ? `${state.answerValue}` : "Enter age";
  elements.submitButton.disabled = !state.answerValue;
}

function updateDurationPad() {
  const display = elements.optionsMount.querySelector("#answerValueDisplay");
  if (!display) return;
  display.textContent = state.answerValue ? String(state.answerValue) + " " + state.durationUnit : "Enter duration";
  elements.optionsMount.querySelectorAll("[data-unit]").forEach((button) => {
    button.classList.toggle("selected", button.dataset.unit === state.durationUnit);
  });
  elements.submitButton.disabled = !state.answerValue;
}

function selectDurationUnit(unit) {
  state.durationUnit = unit;
  updateDurationPad();
}

function appendDigit(digit) {
  const next = `${state.answerValue || ""}${digit}`.replace(/^0+(?=\d)/, "");
  state.answerValue = next.slice(0, 3);
  if (isDurationQuestion(state.currentQuestion)) updateDurationPad();
  else updateNumberPad();
}

function handlePadAction(action) {
  if (action === "clear") {
    state.answerValue = "";
  } else if (action === "backspace") {
    state.answerValue = (state.answerValue || "").slice(0, -1);
  }
  if (isDurationQuestion(state.currentQuestion)) updateDurationPad();
  else updateNumberPad();
}

function renderStaffNotify(data) {
  state.currentQuestion = null;
  state.selectedOptionIds = [];
  state.answerValue = null;
  elements.statusPill.textContent = "staff_notify";
  elements.progressLabel.textContent = "Staff notification";
  elements.questionText.textContent = data.screen_text || "Please notify staff.";
  elements.sessionMeta.textContent = `Session: ${data.session_key} | staff_notify_ready`;
  elements.optionsMount.innerHTML = "";
  elements.submitButton.disabled = true;
  elements.answerFirstButton.disabled = true;
  elements.autoAnswerButton.disabled = true;

  const flags = data.staff_review_flags || [];
  elements.summaryMount.classList.remove("empty");
  elements.summaryMount.innerHTML = `
    <section class="soap-section">
      <div class="soap-label" aria-hidden="true">!</div>
      <div>
        <h3>Please notify staff.</h3>
        ${renderSoapContent(flags.map((flag) => `${flag.label}: ${flag.summary_text}`))}
      </div>
    </section>
  `;
}

function renderSummary(data) {
  state.currentQuestion = null;
  state.selectedOptionIds = [];
  window.name = JSON.stringify({
    type: "nycu_summary_review_payload",
    payload: data
  });
  window.location.assign(summaryReviewUrl());
}

function summaryReviewUrl() {
  const configured = new URLSearchParams(window.location.search).get("summary_review_url");
  return configured || "/demo-ui/summary-review/";
}

function toggleOption(button) {
  if (!state.currentQuestion) return;
  const optionId = button.dataset.optionId;
  const isSingle = state.currentQuestion.max_selections === 1;

  if (isSingle) {
    state.selectedOptionIds = [optionId];
    elements.optionsMount.querySelectorAll(".option").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  } else if (state.selectedOptionIds.includes(optionId)) {
    state.selectedOptionIds = state.selectedOptionIds.filter((id) => id !== optionId);
    button.classList.remove("selected");
  } else if (state.selectedOptionIds.length < state.currentQuestion.max_selections) {
    state.selectedOptionIds.push(optionId);
    button.classList.add("selected");
  }

  elements.submitButton.disabled = state.selectedOptionIds.length === 0;
}

function pickFirstOption() {
  if (isNumberQuestion(state.currentQuestion)) {
    state.answerValue = "40";
    updateNumberPad();
    return;
  }
  if (isDurationQuestion(state.currentQuestion)) {
    state.answerValue = "1";
    state.durationUnit = "days";
    updateDurationPad();
    return;
  }
  if (isTextQuestion(state.currentQuestion)) {
    const input = elements.optionsMount.querySelector("#answerValueInput");
    if (input) {
      input.value = "Today";
      input.dispatchEvent(new Event("input"));
    }
    return;
  }
  const first = elements.optionsMount.querySelector(".option");
  if (first) toggleOption(first);
}

async function autoAnswerFlow() {
  while (state.currentQuestion) {
    if (isNumberQuestion(state.currentQuestion)) {
      state.answerValue = 40;
    } else if (isDurationQuestion(state.currentQuestion)) {
      state.answerValue = "1";
      state.durationUnit = "days";
    } else if (isTextQuestion(state.currentQuestion)) {
      state.answerValue = "Today";
    } else {
      const noneId = state.currentQuestion.none_option_id;
      const selected = noneId || state.currentQuestion.options[0]?.id;
      if (!selected) return;
      state.selectedOptionIds = [selected];
    }
    await submitAnswer();
  }
}
function renderSoapContent(value) {
  const items = Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
  if (!items.length) return `<p class="soap-empty">No demo data recorded.</p>`;
  return `<ul>${items.map((item) => `<li>${escapeHtml(formatValue(item))}</li>`).join("")}</ul>`;
}

function formatValue(value) {
  if (Array.isArray(value)) return value.map(formatValue).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function applyPreset(name) {
  const preset = presets[name] || presets.tachycardia;
  elements.heartRateInput.value = preset.heartRate;
  elements.spo2Input.value = preset.spo2;
  elements.temperatureInput.value = preset.temperature;
  elements.systolicInput.value = preset.systolic;
  elements.diastolicInput.value = preset.diastolic;
  elements.respiratoryRateInput.value = preset.respiratoryRate;
  elements.glucoseInput.value = preset.glucose;
  elements.heightInput.value = preset.height;
  elements.weightInput.value = preset.weight;
  refreshPayload();
}

async function startSession() {
  refreshPayload();
  const data = await postJson("/api/triage-demo/sessions", startBodyFromEditor());
  state.sessionKey = data.session_key;
  if (data.status === "staff_notify") renderStaffNotify(data);
  else if (data.status === "summary") renderSummary(data);
  else renderQuestion(data);
}

function hasAnswerReady() {
  if (!state.currentQuestion) return false;
  if (isNumberQuestion(state.currentQuestion)) return Boolean(String(state.answerValue || "").trim()) && Number.isFinite(Number(state.answerValue));
  if (isDurationQuestion(state.currentQuestion)) return Boolean(String(state.answerValue || "").trim());
  if (isTextQuestion(state.currentQuestion)) return Boolean(String(state.answerValue || "").trim());
  return state.selectedOptionIds.length > 0;
}

async function submitAnswer() {
  if (!state.sessionKey || !state.currentQuestion || !hasAnswerReady()) return;
  const data = await postJson(`/api/triage-demo/sessions/${encodeURIComponent(state.sessionKey)}/answers`, answerBody());
  if (data.status === "staff_notify") renderStaffNotify(data);
  else if (data.status === "summary") renderSummary(data);
  else renderQuestion(data);
}

function resetFlowOnly() {
  state.sessionKey = null;
  state.currentQuestion = null;
  state.selectedOptionIds = [];
  state.answerValue = null;
  state.durationUnit = "days";
  elements.sessionMeta.textContent = "";
  elements.progressLabel.textContent = "Question";
  elements.questionText.textContent = "Start from the vital-sign phase to load the first governed question.";
  elements.statusPill.textContent = "ready";
  elements.optionsMount.innerHTML = "";
  elements.summaryMount.innerHTML = "Summary appears after the final question.";
  elements.summaryMount.classList.add("empty");
  elements.submitButton.disabled = true;
  elements.answerFirstButton.disabled = true;
  elements.autoAnswerButton.disabled = true;
  showRaw({}, null);
}

function reset() {
  resetFlowOnly();
  elements.payloadFormatSelect.value = "normalized";
  applyPreset("tachycardia");
}

function withBusy(button, action) {
  return async () => {
    button.disabled = true;
    try {
      await action();
    } catch (error) {
      alert(error.message);
    } finally {
      if (button !== elements.submitButton || state.currentQuestion) button.disabled = false;
    }
  };
}

document.querySelectorAll(".preset-button").forEach((button) => {
  button.addEventListener("click", () => {
    resetFlowOnly();
    applyPreset(button.dataset.preset);
  });
});

vitalInputs.forEach((input) => input.addEventListener("input", refreshPayload));
elements.payloadFormatSelect.addEventListener("change", refreshPayload);
elements.refreshPayloadButton.addEventListener("click", refreshPayload);
elements.startButton.addEventListener("click", withBusy(elements.startButton, startSession));
elements.submitButton.addEventListener("click", withBusy(elements.submitButton, submitAnswer));
elements.autoAnswerButton.addEventListener("click", withBusy(elements.autoAnswerButton, autoAnswerFlow));
elements.answerFirstButton.addEventListener("click", pickFirstOption);
elements.resetButton.addEventListener("click", reset);
elements.healthButton.addEventListener("click", withBusy(elements.healthButton, () => getJson("/healthz")));

applyPreset("tachycardia");
