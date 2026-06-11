const Engine = window.AiTriageKioskEngine;
const STORAGE_KEY = "aiTriageKioskDemoState";

let state = loadState();
let selectedQuestion = null;
let selectedChoiceValues = [];

const elements = {
  versionBadge: document.querySelector("#versionBadge"),
  caseList: document.querySelector("#caseList"),
  profileGrid: document.querySelector("#profileGrid"),
  vitalGrid: document.querySelector("#vitalGrid"),
  sourceFamilies: document.querySelector("#sourceFamilies"),
  questionTitle: document.querySelector("#question-title"),
  questionValue: document.querySelector("#questionValue"),
  turnLabel: document.querySelector("#turnLabel"),
  demoModeLabel: document.querySelector("#demoModeLabel"),
  choiceMount: document.querySelector("#choiceMount"),
  continueButton: document.querySelector("#continueButton"),
  skipButton: document.querySelector("#skipButton"),
  vitalsReadyButton: document.querySelector("#vitalsReadyButton"),
  summaryButton: document.querySelector("#summaryButton"),
  demoModeSelect: document.querySelector("#demoModeSelect"),
  boundaryText: document.querySelector("#boundaryText"),
  rationaleMount: document.querySelector("#rationaleMount"),
  answeredFields: document.querySelector("#answeredFields"),
  summaryMount: document.querySelector("#summaryMount"),
  toast: document.querySelector("#toast"),
  loadChest: document.querySelector("#loadChest"),
  loadFever: document.querySelector("#loadFever"),
  loadRespiratory: document.querySelector("#loadRespiratory"),
  loadTachycardia: document.querySelector("#loadTachycardia"),
  resetDemo: document.querySelector("#resetDemo")
};

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  return Engine.createInitialState();
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatValue(value) {
  if (Array.isArray(value)) return value.join(", ");
  return String(value || "");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2600);
}

function setCase(caseId) {
  state = Engine.createInitialState(caseId);
  saveState();
  render();
  showToast("Synthetic case loaded.");
}

function resetDemo() {
  state = Engine.createInitialState(state.caseId);
  selectedChoiceValues = [];
  saveState();
  render();
  showToast("Demo reset.");
}

function markVitalsReadyForDemo() {
  state = Engine.markVitalsReady(state);
  saveState();
  render();
  showToast("Synthetic vital payload marked ready.");
}

function setDemoMode(demoMode) {
  state = Engine.setDemoMode(state, demoMode);
  saveState();
  render();
  showToast(`Demo mode: ${state.demoMode.replaceAll("_", " ")}.`);
}

function renderCases() {
  const currentCase = Engine.findCase(state.caseId);
  elements.caseList.innerHTML = Engine.CASES.map((demoCase) => `
    <button class="case-card" type="button" data-case-id="${demoCase.id}" aria-pressed="${demoCase.id === currentCase.id}">
      <strong>${escapeHtml(demoCase.shortLabel)}</strong>
      <span class="muted">${escapeHtml(demoCase.label)}</span>
    </button>
  `).join("");
  elements.caseList.querySelectorAll("[data-case-id]").forEach((button) => {
    button.addEventListener("click", () => setCase(button.dataset.caseId));
  });
}

function renderVitals() {
  const demoCase = Engine.findCase(state.caseId);
  const profileEntries = [
    ["Demo ID", demoCase.profile.demoId],
    ["Age", demoCase.profile.age],
    ["Sex", demoCase.profile.sex],
    ["Language", demoCase.profile.language],
    ["Arrival mode", demoCase.profile.arrivalMode],
    ["Context", demoCase.profile.context]
  ];
  elements.profileGrid.innerHTML = profileEntries.map(([label, value]) => `
    <div class="profile-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `).join("");

  const entries = [
    ["Blood pressure", demoCase.vitals.bloodPressure],
    ["SpO2", demoCase.vitals.spo2],
    ["Heart rate", demoCase.vitals.heartRate],
    ["Respiratory rate", demoCase.vitals.respiratoryRate],
    ["Temperature", demoCase.vitals.temperature],
    ["BMI context", demoCase.vitals.bmiContext]
  ].filter((entry) => entry[1]);
  elements.vitalGrid.innerHTML = entries.map(([label, value]) => {
    const isCue = demoCase.vitalCues.some((cue) => cue.toLowerCase().includes(label.toLowerCase().split(" ")[0]));
    return `
      <div class="vital-tile ${isCue ? "cue" : ""}">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `;
  }).join("");
  elements.sourceFamilies.innerHTML = demoCase.sourceFamilies.map((source) => `
    <div class="fact-card">${escapeHtml(source)}</div>
  `).join("");
}

function renderQuestion() {
  const ranked = Engine.selectNextQuestion(state);
  selectedQuestion = ranked.selected ? ranked.selected.question : null;
  selectedChoiceValues = [];

  elements.versionBadge.textContent = Engine.VERSION.versionLabel;
  elements.boundaryText.textContent = Engine.VERSION.boundary;
  elements.turnLabel.textContent = `Turn ${state.turn}`;
  elements.demoModeLabel.textContent = `Mode: ${String(state.demoMode || "local_scripted_demo").replaceAll("_", " ")}`;
  elements.demoModeSelect.value = state.demoMode || "local_scripted_demo";
  elements.vitalsReadyButton.hidden = Engine.measurementComplete(state);

  if (!selectedQuestion) {
    elements.questionTitle.textContent = "Staff-review summary is ready.";
    elements.questionValue.textContent = "The demo has no more governed questions to ask.";
    elements.choiceMount.innerHTML = "";
    elements.continueButton.disabled = true;
    elements.continueButton.hidden = true;
    renderRationale(ranked.ranked);
    return;
  }

  elements.continueButton.disabled = false;
  elements.continueButton.hidden = selectedQuestion.type === "single";
  elements.continueButton.textContent = selectedQuestion.type === "multi" ? "Save selections" : "Save answer";
  elements.questionTitle.textContent = selectedQuestion.text;
  elements.questionValue.textContent = selectedQuestion.value;
  elements.choiceMount.innerHTML = selectedQuestion.options.map((option) => `
    <button class="choice-card" type="button" data-choice="${escapeHtml(option)}">
      <span>${escapeHtml(option)}</span>
      <small>${selectedQuestion.type === "multi" ? "Select all that apply" : "Choose one"}</small>
    </button>
  `).join("");
  elements.choiceMount.querySelectorAll("[data-choice]").forEach((button) => {
    button.addEventListener("click", () => toggleChoice(button));
  });

  renderRationale(ranked.ranked);
}

function toggleChoice(button) {
  const value = button.dataset.choice;
  if (selectedQuestion.type === "single") {
    selectedChoiceValues = [value];
    elements.choiceMount.querySelectorAll(".choice-card").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    saveAnswer();
    return;
  }

  const selected = selectedChoiceValues.includes(value);
  selectedChoiceValues = selected
    ? selectedChoiceValues.filter((item) => item !== value)
    : [...selectedChoiceValues, value];
  updateMultiChoiceOrder();
}

function updateMultiChoiceOrder() {
  elements.choiceMount.querySelectorAll(".choice-card").forEach((button) => {
    const order = selectedChoiceValues.indexOf(button.dataset.choice);
    button.classList.toggle("selected", order !== -1);
    const label = button.querySelector("small");
    label.textContent = order === -1 ? "Select all that apply" : `Selected #${order + 1}`;
  });
}

function saveAnswer() {
  if (!selectedQuestion) return;
  let value;
  if (selectedQuestion.type === "multi") {
    value = selectedChoiceValues;
  } else {
    value = selectedChoiceValues[0] || "";
  }

  if ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && !value)) {
    showToast("Choose an answer before continuing.");
    return;
  }

  state = Engine.recordAnswer(state, selectedQuestion.id, value);
  saveState();
  render();
}

function skipQuestion() {
  if (!selectedQuestion) return;
  state = Engine.recordAnswer(state, selectedQuestion.id, selectedQuestion.type === "multi" ? ["Skipped in demo"] : "Skipped in demo");
  saveState();
  render();
}

function renderRationale(ranked) {
  const top = ranked.slice(0, 4);
  elements.rationaleMount.innerHTML = top.length
    ? top.map((item, index) => `
        <div class="rationale-card">
          <strong>${index + 1}. ${escapeHtml(item.question.text)}</strong>
          <p class="muted">Score ${item.score}: ${escapeHtml(item.reasons.join(", "))}</p>
        </div>
      `).join("")
    : `<div class="rationale-card">No candidate questions remain.</div>`;
}

function renderAnsweredFields() {
  const summary = Engine.buildStaffSummary(state);
  elements.answeredFields.innerHTML = summary.answered.length
    ? summary.answered.map((item) => `
        <div class="fact-card">
          <strong>${escapeHtml(item.label)}</strong>
          <p class="muted">${escapeHtml(formatValue(item.value))}</p>
        </div>
      `).join("")
    : `<div class="fact-card">No answers recorded yet.</div>`;
}

function renderSummary() {
  const summary = Engine.buildStaffSummary(state);
  const staffReviewSummaryCards = summary.staffReviewSummary ? [
    `<div class="summary-card"><strong>Subjective</strong><p>${escapeHtml(summary.staffReviewSummary.subjective.join(" "))}</p></div>`,
    `<div class="summary-card"><strong>Objective</strong><p>${escapeHtml(summary.staffReviewSummary.objective.join(" "))}</p></div>`,
    `<div class="summary-card"><strong>Review basis</strong><p>${escapeHtml(summary.staffReviewSummary.reviewBasis.join(" "))}</p></div>`,
    `<div class="summary-card ok"><strong>Review action</strong><p>${escapeHtml(summary.staffReviewSummary.reviewAction.join(" "))}</p></div>`
  ] : [];
  elements.summaryMount.innerHTML = [
    `<div class="summary-card warning"><strong>Review boundary</strong><p>${escapeHtml(summary.boundary)}</p></div>`,
    `<div class="summary-card"><strong>Synthetic profile</strong><p>${escapeHtml(summary.profileSummary)}</p></div>`,
    `<div class="summary-card"><strong>Visible review cues</strong><p>${escapeHtml(summary.vitalCues.join(" "))}</p></div>`,
    `<div class="summary-card"><strong>Demo mode</strong><p>${escapeHtml(String(summary.demoMode).replaceAll("_", " "))}</p></div>`,
    ...staffReviewSummaryCards,
    `<div class="summary-card ok"><strong>Allowed output</strong><p>${escapeHtml(summary.allowedOutput)}</p></div>`,
    `<div class="summary-card warning"><strong>Forbidden output</strong><p>${escapeHtml(summary.forbiddenOutput)}</p></div>`,
    `<div class="summary-card"><strong>Still missing</strong><p>${escapeHtml(summary.missing.slice(0, 5).map((item) => item.label).join(" | ") || "No core demo gaps remain.")}</p></div>`
  ].join("");
}

function render() {
  renderCases();
  renderVitals();
  renderQuestion();
  renderAnsweredFields();
  renderSummary();
}

elements.continueButton.addEventListener("click", saveAnswer);
elements.skipButton.addEventListener("click", skipQuestion);
elements.vitalsReadyButton.addEventListener("click", markVitalsReadyForDemo);
elements.summaryButton.addEventListener("click", () => {
  renderSummary();
  showToast("Staff-review summary refreshed.");
});
elements.demoModeSelect.addEventListener("change", () => setDemoMode(elements.demoModeSelect.value));
elements.loadChest.addEventListener("click", () => setCase("chest-pain-high-bp-low-spo2"));
elements.loadFever.addEventListener("click", () => setCase("fever-urinary"));
elements.loadRespiratory.addEventListener("click", () => setCase("respiratory-low-spo2-early-handoff"));
elements.loadTachycardia.addEventListener("click", () => setCase("demo-tachycardia-live-001"));
elements.resetDemo.addEventListener("click", resetDemo);

render();
