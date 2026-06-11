const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function startBody(overrides = {}) {
  return {
    request_id: overrides.request_id || "req-dynamic-start-001",
    idempotency_key: overrides.idempotency_key || "idem-dynamic-start-001",
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    vitals: overrides.vitals || {
      heart_rate_bpm: 130,
      spo2_percent: 97,
      blood_pressure_systolic_mm_hg: 128,
      blood_pressure_diastolic_mm_hg: 82,
      temperature_c: 36.5
    },
    capabilities: {
      question_types: ["single_choice", "multi_choice"],
      max_questions: 99,
      max_options_per_question: 9,
      variable_option_count: true,
      voice_input: false
    }
  };
}

function answerBody(question, selectedOptionIds, idempotencyKey, extra = {}) {
  return {
    request_id: `req-dynamic-answer-${question.id}-${idempotencyKey}`,
    idempotency_key: idempotencyKey,
    session_key: "filled-by-test",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    question_id: question.id,
    answer: {
      selected_option_ids: selectedOptionIds,
      scale_value: null
    },
    client_event: {
      answered_at: "2026-06-08T10:02:00+08:00",
      input_mode: "touch"
    },
    ...extra
  };
}

function submitCurrent(sessionKey, question, selectedOptionIds, key) {
  const result = contract.submitAnswer(sessionKey, answerBody(question, selectedOptionIds, key));
  assert.equal(result.statusCode, 200);
  return result.body;
}

function runLowConcernPath() {
  contract.resetMockState();
  const start = contract.createSession(startBody({ idempotency_key: "idem-low-start" }));
  const sessionKey = start.body.session_key;
  let body = start.body;

  body = submitCurrent(sessionKey, body.question, ["heart_racing"], "idem-low-001");
  body = submitCurrent(sessionKey, body.question, ["half_day"], "idem-low-002");
  body = submitCurrent(sessionKey, body.question, ["heart_racing", "chest_heavy"], "idem-low-003");
  body = submitCurrent(sessionKey, body.question, ["none_of_these"], "idem-low-004");
  assert.equal(body.question.id, "tachy-post-vital-heart-rate-cue");

  body = submitCurrent(sessionKey, body.question, ["both"], "idem-low-005");
  body = submitCurrent(sessionKey, body.question, ["known_rhythm_problem", "heart_bp_medicine"], "idem-low-006");
  body = submitCurrent(sessionKey, body.question, ["none_known"], "idem-low-007");

  return { sessionKey, summary: body, snapshot: contract.getSessionSnapshot(sessionKey) };
}

function runWarningPath() {
  contract.resetMockState();
  const start = contract.createSession(startBody({ idempotency_key: "idem-warning-start" }));
  const sessionKey = start.body.session_key;
  let body = start.body;

  body = submitCurrent(sessionKey, body.question, ["chest_tightness"], "idem-warning-001");
  body = submitCurrent(sessionKey, body.question, ["half_day"], "idem-warning-002");
  body = submitCurrent(sessionKey, body.question, ["chest_heavy"], "idem-warning-003");
  body = submitCurrent(sessionKey, body.question, ["short_breath", "dizzy_faint"], "idem-warning-004");
  assert.equal(body.question.id, "tachy-warning-symptom-review");

  body = submitCurrent(sessionKey, body.question, ["symptoms_still_present"], "idem-warning-005");
  body = submitCurrent(sessionKey, body.question, ["staff_confirm"], "idem-warning-006");
  body = submitCurrent(sessionKey, body.question, ["not_sure"], "idem-warning-007");

  return { sessionKey, summary: body, snapshot: contract.getSessionSnapshot(sessionKey) };
}

function forbiddenOutputText(summary) {
  return JSON.stringify(summary.staff_review_summary);
}

test("RT-DYN-001 SUM-003 same vitals with none-associated path selects the heart-rate cue path and session-derived summary", () => {
  const { summary, snapshot } = runLowConcernPath();

  assert.equal(summary.status, "summary");
  assert.equal(summary.progress.current, 7);
  assert.match(summary.staff_review_summary.objective.join(" "), /HR 130 bpm/);
  assert.match(summary.staff_review_summary.objective.join(" "), /SpO2 97%/);
  assert.match(summary.staff_review_summary.objective.join(" "), /BP 128\/82 mmHg/);
  assert.ok(summary.handoff_reason_codes.includes("no_listed_associated_symptoms_selected"));
  assert.ok(!summary.handoff_reason_codes.includes("associated_warning_symptom_selected"));
  assert.equal(snapshot.routing_trace[3].selected_next_question_id, "tachy-post-vital-heart-rate-cue");
});

test("RT-DYN-002 RT-DYN-003 SUM-004 SUM-005 same vitals with associated warning symptoms selects warning review and different summary", () => {
  const low = runLowConcernPath();
  const warning = runWarningPath();

  assert.equal(warning.summary.status, "summary");
  assert.notDeepEqual(
    warning.summary.staff_review_summary.subjective,
    low.summary.staff_review_summary.subjective
  );
  assert.deepEqual(
    warning.summary.staff_review_summary.objective,
    low.summary.staff_review_summary.objective
  );
  assert.ok(warning.summary.handoff_reason_codes.includes("associated_warning_symptom_selected"));
  assert.match(warning.summary.staff_review_summary.subjective.join(" "), /shortness of breath/i);
  assert.match(warning.summary.staff_review_summary.subjective.join(" "), /dizziness|fainting/i);
  assert.equal(warning.snapshot.routing_trace[3].selected_next_question_id, "tachy-warning-symptom-review");
  assert.ok(warning.snapshot.routing_trace[3].ai_candidate_question_ids.includes("tachy-warning-symptom-review"));
  assert.equal(warning.snapshot.routing_trace[3].ai_status, "local_embedding_reranker_ready");
  assert.match(warning.snapshot.routing_trace[3].ai_query, /shortness|dizzy|heart/);
});

test("AI-TRACE-001 successful AI path records candidate ids selected id and reason codes", () => {
  const warning = runWarningPath();
  const trace = warning.snapshot.routing_trace[3];

  assert.equal(trace.from_question_id, "tachy-associated-symptoms");
  assert.ok(trace.ai_candidate_question_ids.length > 0);
  assert.ok(trace.safe_candidate_question_ids.includes("tachy-warning-symptom-review"));
  assert.equal(trace.selected_next_question_id, "tachy-warning-symptom-review");
  assert.ok(trace.reason_codes.includes("associated_warning_symptom_selected"));
});

test("SUM-001 SUM-002 dynamic summaries use custom HR omit missing vital facts and avoid forbidden output phrases", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody({
    idempotency_key: "idem-missing-vitals-start",
    vitals: {
      heart_rate_bpm: { value: 118, unit: "bpm", quality_flag: "measured" }
    }
  }));
  const sessionKey = start.body.session_key;
  let body = start.body;

  body = submitCurrent(sessionKey, body.question, ["heart_racing"], "idem-missing-001");
  body = submitCurrent(sessionKey, body.question, ["half_day"], "idem-missing-002");
  body = submitCurrent(sessionKey, body.question, ["heart_racing"], "idem-missing-003");
  body = submitCurrent(sessionKey, body.question, ["none_of_these"], "idem-missing-004");
  body = submitCurrent(sessionKey, body.question, ["still_racing"], "idem-missing-005");
  body = submitCurrent(sessionKey, body.question, ["staff_confirm"], "idem-missing-006");
  body = submitCurrent(sessionKey, body.question, ["not_sure"], "idem-missing-007");

  const objective = body.staff_review_summary.objective.join(" ");
  assert.match(objective, /HR 118 bpm/);
  assert.doesNotMatch(objective, /SpO2/);
  assert.doesNotMatch(objective, /BP/);
  assert.doesNotMatch(forbiddenOutputText(body), /AfRVR|atrial fibrillation diagnosis|heart attack diagnosis|formal triage level|ESI level|CTAS level|treatment|medication order|ECG order|go to emergency department|cardiology department recommendation/i);
});

test("SUM-007 summary generated after AI retrieval failure is still safe and template based", () => {
  const previous = process.env.DEMO_AI_FORCE_FAILURE;
  process.env.DEMO_AI_FORCE_FAILURE = "1";
  try {
    const { summary, snapshot } = runLowConcernPath();
    const text = JSON.stringify(summary.staff_review_summary);

    assert.equal(summary.status, "summary");
    assert.ok(snapshot.routing_trace.every((trace) => trace.ai_status === "ai_service_unavailable_deterministic_fallback"));
    assert.ok(summary.handoff_reason_codes.includes("no_listed_associated_symptoms_selected"));
    assert.doesNotMatch(text, /diagnosis|treatment|formal triage level|ECG order|department recommendation/i);
  } finally {
    if (previous === undefined) delete process.env.DEMO_AI_FORCE_FAILURE;
    else process.env.DEMO_AI_FORCE_FAILURE = previous;
  }
});

test("CT-SUM-001 CT-SUM-002 summary lookup returns stable active and ready session responses", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody({ idempotency_key: "idem-summary-lookup-start" }));
  const active = contract.getSummary(start.body.session_key, { request_id: "req-summary-active" });

  assert.equal(active.statusCode, 409);
  assert.equal(active.body.error.code, "session_not_summary_ready");

  const complete = runLowConcernPath();
  const ready = contract.getSummary(complete.sessionKey, { request_id: "req-summary-ready" });

  assert.equal(ready.statusCode, 200);
  assert.equal(ready.body.status, "summary");
  assert.ok(ready.body.staff_review_summary);
});

test("answer candidate matching stays inside the current question option space", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody({ idempotency_key: "idem-candidate-start" }));
  const sessionKey = start.body.session_key;
  let body = start.body;
  body = submitCurrent(sessionKey, body.question, ["heart_racing"], "idem-candidate-001");
  body = submitCurrent(sessionKey, body.question, ["half_day"], "idem-candidate-002");
  body = submitCurrent(sessionKey, body.question, ["heart_racing", "chest_heavy"], "idem-candidate-003");
  assert.equal(body.question.id, "tachy-associated-symptoms");

  const candidates = contract.answerCandidates(sessionKey, {
    request_id: "req-candidates-001",
    question_id: body.question.id,
    input: {
      method: "asr",
      locale: "zh-TW",
      transcript: "我喘不過氣，也有點頭暈",
      asr_confidence: 0.86
    }
  });
  const candidateIds = candidates.body.candidates.map((candidate) => candidate.option_id);

  assert.equal(candidates.statusCode, 200);
  assert.deepEqual(candidates.body.allowed_option_space, ["short_breath", "sweating_nausea_fatigue", "dizzy_faint", "none_of_these"]);
  assert.ok(candidateIds.includes("short_breath"));
  assert.ok(candidateIds.includes("dizzy_faint"));

  const absentOption = contract.answerCandidates(sessionKey, {
    request_id: "req-candidates-002",
    question_id: body.question.id,
    input: {
      method: "asr",
      locale: "zh-TW",
      transcript: "我胸口悶"
    }
  });

  assert.equal(absentOption.statusCode, 200);
  assert.deepEqual(absentOption.body.candidates, []);
  assert.equal(absentOption.body.recommended_ui_action, "ask_staff_confirm");
});

test("none option cannot be combined with another selected option", () => {
  contract.resetMockState();
  const start = contract.createSession(startBody({ idempotency_key: "idem-none-conflict-start" }));
  const sessionKey = start.body.session_key;
  let body = start.body;
  body = submitCurrent(sessionKey, body.question, ["heart_racing"], "idem-none-conflict-001");
  body = submitCurrent(sessionKey, body.question, ["half_day"], "idem-none-conflict-002");
  body = submitCurrent(sessionKey, body.question, ["heart_racing"], "idem-none-conflict-003");

  const conflict = contract.submitAnswer(
    sessionKey,
    answerBody(body.question, ["short_breath", "none_of_these"], "idem-none-conflict-004")
  );

  assert.equal(conflict.statusCode, 422);
  assert.equal(conflict.body.error.code, "invalid_answer");
  assert.match(conflict.body.error.message, /cannot be combined/);
});
