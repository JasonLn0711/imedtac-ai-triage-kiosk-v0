const assert = require("node:assert/strict");
const test = require("node:test");

const contract = require("../../api/lib/triage-demo-contract");

function startBody(idempotencyKey = "idem-answer-candidates-start") {
  return {
    request_id: `req-${idempotencyKey}`,
    idempotency_key: idempotencyKey,
    case_id: "demo-tachycardia-live-001",
    workflow_mode: "post_measurement_only",
    measurement_state: "complete",
    vitals_ready: true,
    vitals: { heart_rate_bpm: 130, spo2_percent: 97 },
    capabilities: {
      question_types: ["single_choice", "multi_choice"],
      max_questions: 99,
      max_options_per_question: 9,
      variable_option_count: true,
      voice_input: true
    }
  };
}

function answerBody(question, selectedOptionIds, idempotencyKey) {
  return {
    request_id: `req-${idempotencyKey}`,
    idempotency_key: idempotencyKey,
    question_id: question.id,
    answer: { selected_option_ids: selectedOptionIds, scale_value: null }
  };
}

function advanceToAssociatedSymptoms() {
  contract.resetMockState();
  const start = contract.createSession(startBody());
  const sessionKey = start.body.session_key;
  let body = start.body;
  body = contract.submitAnswer(sessionKey, answerBody(body.question, ["heart_racing"], "idem-ac-001")).body;
  body = contract.submitAnswer(sessionKey, answerBody(body.question, ["half_day"], "idem-ac-002")).body;
  body = contract.submitAnswer(sessionKey, answerBody(body.question, ["heart_racing", "chest_heavy"], "idem-ac-003")).body;
  assert.equal(body.question.id, "tachy-associated-symptoms");
  return { sessionKey, question: body.question };
}

const cases = [
  ["ASR-OPT-001", "我喘不過氣", ["short_breath"]],
  ["ASR-OPT-002", "我頭暈快昏倒", ["dizzy_faint"]],
  ["ASR-OPT-003", "沒有這些症狀", ["none_of_these"]],
  ["ASR-OPT-006", "I almost fainted", ["dizzy_faint"]],
  ["ASR-OPT-007", "喘 and dizzy", ["short_breath", "dizzy_faint"]]
];

for (const [testId, transcript, expectedOptionIds] of cases) {
  test(`${testId} maps transcript to current-question candidates with confirmation`, () => {
    const { sessionKey, question } = advanceToAssociatedSymptoms();
    const result = contract.answerCandidates(sessionKey, {
      request_id: `req-${testId}`,
      question_id: question.id,
      input: { method: "asr", locale: "zh-TW", transcript }
    });
    const candidateIds = result.body.candidates.map((candidate) => candidate.option_id);

    assert.equal(result.statusCode, 200);
    for (const expectedOptionId of expectedOptionIds) {
      assert.ok(candidateIds.includes(expectedOptionId), `${expectedOptionId} should be suggested`);
    }
    assert.ok(result.body.candidates.every((candidate) => candidate.needs_confirmation === true));
    assert.ok(result.body.candidates.every((candidate) => candidate.retrieval_source === "current_question_option_index"));
    assert.equal(result.body.official_answer_submission, "POST /api/triage-demo/sessions/{session_key}/answers");
  });
}

test("ASR-OPT-004 low confidence transcript asks staff and does not auto-submit", () => {
  const { sessionKey, question } = advanceToAssociatedSymptoms();
  const result = contract.answerCandidates(sessionKey, {
    request_id: "req-ASR-OPT-004",
    question_id: question.id,
    input: { method: "asr", locale: "zh-TW", transcript: "很不舒服" }
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body.candidates, []);
  assert.equal(result.body.recommended_ui_action, "ask_staff_confirm");
  assert.equal(contract.getSessionSnapshot(sessionKey).answers.length, 3);
});

test("ASR-OPT-005 transcript does not map to option absent from current question", () => {
  const { sessionKey, question } = advanceToAssociatedSymptoms();
  const result = contract.answerCandidates(sessionKey, {
    request_id: "req-ASR-OPT-005",
    question_id: question.id,
    input: { method: "asr", locale: "zh-TW", transcript: "我胸口悶" }
  });

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body.candidates, []);
});

test("ASR-OPT-008 multi-candidate transcript never auto-submits an answer", () => {
  const { sessionKey, question } = advanceToAssociatedSymptoms();
  const result = contract.answerCandidates(sessionKey, {
    request_id: "req-ASR-OPT-008",
    question_id: question.id,
    input: { method: "asr", locale: "zh-TW", transcript: "我喘不過氣，也有點頭暈" }
  });

  assert.equal(result.statusCode, 200);
  assert.ok(result.body.candidates.length >= 2);
  assert.equal(contract.getSessionSnapshot(sessionKey).answers.length, 3);
});

test("CLD-PRIV-001 raw audio payload is rejected and not retained", () => {
  const { sessionKey, question } = advanceToAssociatedSymptoms();
  const result = contract.answerCandidates(sessionKey, {
    request_id: "req-raw-audio",
    question_id: question.id,
    input: { method: "asr", raw_audio: "base64-audio-should-not-be-here" }
  });

  assert.equal(result.statusCode, 422);
  assert.equal(result.body.error.code, "raw_audio_not_accepted");
});
