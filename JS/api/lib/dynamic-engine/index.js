const { mapAnswerEffects } = require("./answer-effect-mapper");
const { suggestAnswerCandidates } = require("./answer-candidate-matcher");
const { retrieveQuestionCandidates } = require("./ai-retrieval-client");
const { initialDerivedFlags, updateDerivedFlags } = require("./derived-flag-updater");
const { loadDynamicEngineData } = require("./data-loader");
const { recordRoutingTrace } = require("./routing-trace-recorder");
const { selectNextQuestion } = require("./routing-policy-engine");
const { assembleStaffReviewSummary } = require("./summary-assembler");

const data = loadDynamicEngineData();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getQuestion(questionId) {
  const question = data.questionsById.get(questionId);
  return question ? clone(question) : null;
}

function startQuestionId() {
  return data.routingPolicy.start_question_id;
}

function expectedTotal() {
  return data.routingPolicy.expected_total;
}

function defaultQuestionSequence() {
  const ids = [
    "tachy-chief-concern",
    "tachy-onset",
    "tachy-current-feeling",
    "tachy-associated-symptoms",
    "tachy-post-vital-heart-rate-cue",
    "tachy-heart-history-meds",
    "tachy-medication-allergy-confirm"
  ];
  return ids.map(getQuestion);
}

function initializeSession(session) {
  session.manifest_version = data.manifest.manifest_version;
  session.current_question_id = startQuestionId();
  session.derived_flags = initialDerivedFlags(session.vitals || {}, data.routingPolicy);
  session.routing_trace = [];
  return session;
}

function applyAnswerAndSelectNext(session, question, selectedOptionIds) {
  const mapped = mapAnswerEffects(data.answerEffects, question, selectedOptionIds);
  session.derived_flags = updateDerivedFlags(session.derived_flags, mapped.effects);

  const answerRecord = {
    question_id: question.id,
    selected_option_ids: mapped.selected_option_ids,
    selected_option_labels: mapped.selected_option_labels,
    effects: mapped.effects,
    reason_codes: mapped.reason_codes,
    summary_phrases: mapped.summary_phrases,
    option_effects: mapped.option_effects
  };

  const aiResult = retrieveQuestionCandidates({
    session,
    answerEffects: mapped,
    questionsById: data.questionsById,
    vectorIndex: data.vectorIndex,
    answeredQuestionIds: session.answers.map((answer) => answer.question_id)
  });

  const decision = selectNextQuestion({
    session,
    currentQuestionId: question.id,
    answerEffects: mapped,
    aiResult,
    questionsById: data.questionsById,
    routingPolicy: data.routingPolicy
  });

  const trace = recordRoutingTrace(session, {
    from_question_id: question.id,
    selected_option_ids: selectedOptionIds,
    effects: mapped.effects,
    ai_status: decision.ai_status,
    ai_query: aiResult.query,
    ai_candidate_question_ids: decision.ai_candidate_question_ids,
    safe_candidate_question_ids: decision.safe_candidate_question_ids,
    selected_next_question_id: decision.selected_next_question_id,
    reason_codes: decision.reason_codes
  });

  return { answerRecord, decision, trace };
}

function buildSummary(session) {
  return assembleStaffReviewSummary(session, data.summaryTemplates);
}

function answerCandidatesForCurrentQuestion(session, input) {
  return suggestAnswerCandidates(getQuestion(session.current_question_id), input, data.optionRowsByKey);
}

module.exports = {
  answerCandidatesForCurrentQuestion,
  applyAnswerAndSelectNext,
  buildSummary,
  defaultQuestionSequence,
  expectedTotal,
  getQuestion,
  initializeSession,
  manifest: data.manifest,
  startQuestionId
};
