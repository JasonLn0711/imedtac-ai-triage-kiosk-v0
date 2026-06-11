const assert = require("node:assert/strict");
const test = require("node:test");

const { retrieveQuestionCandidates } = require("../../api/lib/dynamic-engine/ai-retrieval-client");
const manifest = require("../../../data/question_manifest.tachycardia.v0.3.json");
const vectorIndex = require("../../../data/vector_index/tachycardia.v0.3.json");

const questionsById = new Map(manifest.questions.map((question) => [question.id, question]));

test("AI-RET-001 retrieves warning-symptom candidates for HR plus chest and short-breath context", () => {
  const result = retrieveQuestionCandidates({
    session: { vitals: { heart_rate_bpm: 130 } },
    answerEffects: { effects: ["reported_chest_tightness", "associated_short_breath"] },
    questionsById,
    vectorIndex,
    answeredQuestionIds: ["tachy-chief-concern", "tachy-onset", "tachy-current-feeling", "tachy-associated-symptoms"]
  });
  assert.equal(result.ai_status, "local_embedding_reranker_ready");
  assert.ok(result.candidates.some((candidate) => candidate.question_id === "tachy-warning-symptom-review"));
  assert.ok(result.candidates.every((candidate) => candidate.retrieval_source === "question_vector_index"));
});

test("AI-RET-002 retrieves heart-rate/history candidates for none-associated path", () => {
  const result = retrieveQuestionCandidates({
    session: { vitals: { heart_rate_bpm: 130 } },
    answerEffects: { effects: ["associated_symptoms_none_selected"] },
    questionsById,
    vectorIndex,
    answeredQuestionIds: ["tachy-chief-concern", "tachy-onset", "tachy-current-feeling", "tachy-associated-symptoms"]
  });
  assert.ok(result.candidates.some((candidate) => candidate.question_id === "tachy-post-vital-heart-rate-cue"));
  assert.ok(result.candidates.some((candidate) => candidate.question_id === "tachy-heart-history-meds"));
});

test("AI-RET-003 vector service failure reports deterministic fallback status", () => {
  const previous = process.env.DEMO_AI_FORCE_FAILURE;
  process.env.DEMO_AI_FORCE_FAILURE = "1";
  try {
    const result = retrieveQuestionCandidates({
    session: { vitals: { heart_rate_bpm: 130 } },
    answerEffects: { effects: ["associated_short_breath"] },
    questionsById,
    vectorIndex,
    answeredQuestionIds: []
  });
    assert.equal(result.ai_status, "ai_service_unavailable_deterministic_fallback");
    assert.deepEqual(result.candidates, []);
  } finally {
    if (previous === undefined) delete process.env.DEMO_AI_FORCE_FAILURE;
    else process.env.DEMO_AI_FORCE_FAILURE = previous;
  }
});

test("AI-RERANK-001 reranker scoring keeps irrelevant medication allergy question below warning context", () => {
  const result = retrieveQuestionCandidates({
    session: { vitals: { heart_rate_bpm: 130 } },
    answerEffects: { effects: ["reported_chest_tightness", "associated_short_breath", "associated_dizzy_faint"] },
    questionsById,
    vectorIndex,
    answeredQuestionIds: ["tachy-chief-concern", "tachy-onset", "tachy-current-feeling", "tachy-associated-symptoms"]
  });
  const warning = result.candidates.find((candidate) => candidate.question_id === "tachy-warning-symptom-review");
  const medicationAllergy = result.candidates.find((candidate) => candidate.question_id === "tachy-medication-allergy-confirm");
  assert.ok(warning);
  assert.ok(medicationAllergy);
  assert.ok(warning.final_candidate_score >= medicationAllergy.final_candidate_score);
});
