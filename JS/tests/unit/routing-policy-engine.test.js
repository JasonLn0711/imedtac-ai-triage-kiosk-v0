const assert = require("node:assert/strict");
const test = require("node:test");

const { initialDerivedFlags, updateDerivedFlags } = require("../../api/lib/dynamic-engine/derived-flag-updater");
const { selectNextQuestion } = require("../../api/lib/dynamic-engine/routing-policy-engine");
const manifest = require("../../../data/question_manifest.tachycardia.v0.3.json");
const routingPolicy = require("../../../data/routing_policy.tachycardia.v0.3.json");

const questionsById = new Map(manifest.questions.map((question) => [question.id, question]));

test("UT-FLAG-001 HR 130 sets elevated_heart_rate_demo=true", () => {
  const flags = initialDerivedFlags({ heart_rate_bpm: 130 }, routingPolicy);
  assert.equal(flags.elevated_heart_rate_demo, true);
});

test("UT-FLAG-002 missing HR does not create measured HR claim", () => {
  const flags = initialDerivedFlags({}, routingPolicy);
  assert.equal(flags.elevated_heart_rate_demo, false);
  assert.equal(flags.measured_heart_rate_bpm, null);
});

test("UT-ROUTE-001 short_breath plus dizzy selects warning-symptom follow-up", () => {
  const session = {
    answers: [
      { question_id: "tachy-chief-concern" },
      { question_id: "tachy-onset" },
      { question_id: "tachy-current-feeling" }
    ]
  };
  const decision = selectNextQuestion({
    session,
    currentQuestionId: "tachy-associated-symptoms",
    answerEffects: { effects: ["associated_short_breath", "associated_dizzy_faint"] },
    aiResult: {
      ai_status: "local_embedding_reranker_ready",
      candidates: [{ question_id: "tachy-heart-history-meds" }, { question_id: "tachy-warning-symptom-review" }]
    },
    questionsById,
    routingPolicy
  });
  assert.equal(decision.selected_next_question_id, "tachy-warning-symptom-review");
});

test("UT-ROUTE-002 none_of_these selects heart-rate cue path", () => {
  const session = {
    answers: [
      { question_id: "tachy-chief-concern" },
      { question_id: "tachy-onset" },
      { question_id: "tachy-current-feeling" }
    ]
  };
  const decision = selectNextQuestion({
    session,
    currentQuestionId: "tachy-associated-symptoms",
    answerEffects: { effects: ["associated_symptoms_none_selected"] },
    aiResult: {
      ai_status: "local_embedding_reranker_ready",
      candidates: [{ question_id: "tachy-heart-history-meds" }]
    },
    questionsById,
    routingPolicy
  });
  assert.equal(decision.selected_next_question_id, "tachy-post-vital-heart-rate-cue");
});

test("UT-ROUTE-003 unapproved AI candidate is filtered out", () => {
  const unsafeQuestions = new Map(questionsById);
  unsafeQuestions.set("unapproved-question", {
    id: "unapproved-question",
    demo_allowed: false,
    type: "single_choice",
    options: [{ id: "x", label: "X" }, { id: "y", label: "Y" }]
  });
  const decision = selectNextQuestion({
    session: { answers: [] },
    currentQuestionId: "tachy-onset",
    answerEffects: { effects: ["reported_palpitations"] },
    aiResult: {
      ai_status: "local_embedding_reranker_ready",
      candidates: [{ question_id: "unapproved-question" }, { question_id: "tachy-current-feeling" }]
    },
    questionsById: unsafeQuestions,
    routingPolicy
  });
  assert.equal(decision.selected_next_question_id, "tachy-current-feeling");
  assert.ok(!decision.safe_candidate_question_ids.includes("unapproved-question"));
});

test("AI-RERANK-002 top candidate unreviewed is rejected by the safety gate", () => {
  const unsafeQuestions = new Map(questionsById);
  unsafeQuestions.set("unreviewed-top-question", {
    id: "unreviewed-top-question",
    demo_allowed: false,
    type: "single_choice",
    options: [{ id: "x", label: "X" }, { id: "y", label: "Y" }]
  });
  const decision = selectNextQuestion({
    session: { answers: [{ question_id: "tachy-chief-concern" }] },
    currentQuestionId: "tachy-onset",
    answerEffects: { effects: ["reported_palpitations"] },
    aiResult: {
      ai_status: "local_embedding_reranker_ready",
      candidates: [{ question_id: "unreviewed-top-question" }, { question_id: "tachy-current-feeling" }]
    },
    questionsById: unsafeQuestions,
    routingPolicy
  });

  assert.equal(decision.selected_next_question_id, "tachy-current-feeling");
  assert.deepEqual(decision.safe_candidate_question_ids, ["tachy-current-feeling"]);
});

test("AI-RERANK-003 unsupported UI type is filtered out", () => {
  const unsafeQuestions = new Map(questionsById);
  unsafeQuestions.set("free-text-question", {
    id: "free-text-question",
    demo_allowed: true,
    type: "text",
    options: [{ id: "x", label: "X" }, { id: "y", label: "Y" }]
  });
  const decision = selectNextQuestion({
    session: { answers: [] },
    currentQuestionId: "tachy-onset",
    answerEffects: { effects: ["reported_palpitations"] },
    aiResult: {
      ai_status: "local_embedding_reranker_ready",
      candidates: [{ question_id: "free-text-question" }, { question_id: "tachy-current-feeling" }]
    },
    questionsById: unsafeQuestions,
    routingPolicy
  });
  assert.equal(decision.selected_next_question_id, "tachy-current-feeling");
  assert.ok(!decision.safe_candidate_question_ids.includes("free-text-question"));
});

test("updateDerivedFlags records answer effects as boolean flags", () => {
  const flags = updateDerivedFlags({}, ["associated_short_breath", "reported_palpitations"]);
  assert.equal(flags.selected_short_breath, true);
  assert.equal(flags.reported_palpitations, true);
});
