const assert = require("node:assert/strict");
const test = require("node:test");

const engine = require("../../core/triage_engine");

test("chest case ranks breathing or chest follow-up early", () => {
  const state = engine.createInitialState("chest-pain-high-bp-low-spo2");
  const ranked = engine.rankQuestions(state).slice(0, 4).map((item) => item.question.id);
  assert.ok(ranked.includes("breathing"));
  assert.ok(ranked.includes("chest-details"));
});

test("fever urinary case ranks fever and urinary context", () => {
  const state = engine.createInitialState("fever-urinary");
  const ranked = engine.rankQuestions(state).slice(0, 5).map((item) => item.question.id);
  assert.ok(ranked.includes("fever-details"));
  assert.ok(ranked.includes("urinary-details"));
});

test("staff summary preserves demo-only safety boundary", () => {
  let state = engine.createInitialState("chest-pain-high-bp-low-spo2");
  state = engine.recordAnswer(state, "breathing", "Yes");
  const summary = engine.buildStaffSummary(state);
  assert.equal(summary.requiresStaffReview, true);
  assert.match(summary.boundary, /not diagnosis/);
  assert.match(summary.forbiddenOutput, /No final acuity assignment/);
});

test("pre-vital intake excludes post-vital follow-up until measurement completes", () => {
  let state = engine.createInitialState("chest-pain-high-bp-low-spo2", {
    measurementState: engine.MEASUREMENT_STATES.IN_PROGRESS
  });
  let ranked = engine.rankQuestions(state);
  assert.ok(ranked.length > 0);
  assert.ok(ranked.every((item) => item.question.phase === engine.QUESTION_PHASES.PRE_VITAL_INTAKE));

  state = engine.markVitalsReady(state);
  ranked = engine.rankQuestions(state);
  assert.ok(ranked.some((item) => item.question.phase === engine.QUESTION_PHASES.POST_VITAL_FOLLOWUP));
});

test("respiratory case starts as two-phase Duobao-aligned handoff", () => {
  let state = engine.createInitialState("respiratory-low-spo2-early-handoff");
  assert.equal(state.measurementState, engine.MEASUREMENT_STATES.IN_PROGRESS);

  let ranked = engine.rankQuestions(state);
  const initialIds = ranked.map((item) => item.question.id);
  assert.equal(initialIds[0], "chief-concern");
  assert.ok(initialIds.includes("breathing-duration"));
  assert.ok(initialIds.includes("respiratory-symptoms"));
  assert.ok(!initialIds.includes("chest-pain-pressure"));
  assert.ok(ranked.every((item) => item.question.phase === engine.QUESTION_PHASES.PRE_VITAL_INTAKE));

  state = engine.recordAnswer(state, "chief-concern", "Shortness of breath");
  state = engine.markVitalsReady(state);
  ranked = engine.rankQuestions(state);
  const postVitalIds = ranked.slice(0, 4).map((item) => item.question.id);
  assert.ok(postVitalIds.includes("chest-pain-pressure"));
  assert.ok(postVitalIds.includes("lung-history-context"));
});

test("respiratory case keeps visible question count under eight", () => {
  const respiratoryCase = engine.findCase("respiratory-low-spo2-early-handoff");
  assert.equal(respiratoryCase.questionLimit, 7);
  assert.equal(respiratoryCase.allowedQuestionIds.length, 7);

  let state = engine.createInitialState(respiratoryCase.id);
  for (const questionId of respiratoryCase.allowedQuestionIds) {
    const question = engine.QUESTION_BANK.find((item) => item.id === questionId);
    state = engine.recordAnswer(state, questionId, question.type === "multi" ? ["None of these"] : "Not sure");
  }

  assert.equal(engine.rankQuestions(state).length, 0);
  assert.equal(engine.buildStaffSummary(state).missing.length, 0);
});

test("tachycardia live case is wired as the HR 130 seven-question lane", () => {
  const tachyCase = engine.findCase("demo-tachycardia-live-001");
  assert.equal(tachyCase.fixturePath, "demo/fixtures/tachycardia-live-demo.json");
  assert.equal(tachyCase.vitals.heartRate, "130 bpm");
  assert.equal(tachyCase.questionLimit, 7);
  assert.deepEqual(tachyCase.allowedQuestionIds, [
    "tachy-chief-concern",
    "tachy-onset",
    "tachy-current-feeling",
    "tachy-associated-symptoms",
    "tachy-post-vital-heart-rate-cue",
    "tachy-heart-history-meds",
    "tachy-medication-allergy-confirm"
  ]);

  const state = engine.createInitialState(tachyCase.id);
  assert.equal(state.demoMode, "live_measured");
  const ranked = engine.rankQuestions(state).map((item) => item.question.id);
  assert.equal(ranked[0], "tachy-chief-concern");
  assert.ok(ranked.includes("tachy-post-vital-heart-rate-cue"));
});

test("tachycardia live staff summary carries the demo-safe preview wording", () => {
  let state = engine.createInitialState("demo-tachycardia-live-001");
  state = engine.recordAnswer(state, "tachy-chief-concern", "Heart racing / palpitations");
  state = engine.recordAnswer(state, "tachy-onset", "About half a day");
  state = engine.recordAnswer(state, "tachy-current-feeling", ["Heart racing or pounding", "Chest tightness or heaviness"]);
  state = engine.recordAnswer(state, "tachy-associated-symptoms", ["None of these"]);
  state = engine.recordAnswer(state, "tachy-post-vital-heart-rate-cue", "Both");
  state = engine.recordAnswer(state, "tachy-heart-history-meds", ["Known rhythm problem", "Heart or blood-pressure medicine"]);
  state = engine.recordAnswer(state, "tachy-medication-allergy-confirm", ["Regular medicines", "No known medication allergy"]);

  const summary = engine.buildStaffSummary(state);
  assert.equal(summary.requiresStaffReview, true);
  assert.match(summary.vitalCues.join(" "), /130 bpm/);
  assert.match(summary.forbiddenOutput, /No AfRVR diagnosis/);
  assert.ok(summary.staffReviewSummary);
  assert.match(summary.staffReviewSummary.subjective.join(" "), /palpitations and middle chest tightness/);
  assert.match(summary.staffReviewSummary.objective.join(" "), /HR 130 bpm/);
  assert.equal(summary.missing.length, 0);
});

test("tachycardia live demo mode supports synthetic and local scripted fallback", () => {
  let state = engine.createInitialState("demo-tachycardia-live-001");
  state = engine.setDemoMode(state, "synthetic_override");
  assert.equal(state.demoMode, "synthetic_override");
  assert.equal(engine.buildStaffSummary(state).demoMode, "synthetic_override");

  state = engine.setDemoMode(state, "local_scripted_demo");
  assert.equal(state.demoMode, "local_scripted_demo");

  state = engine.setDemoMode(state, "unsupported_mode");
  assert.equal(state.demoMode, "live_measured");
});
