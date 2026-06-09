const { questionIsSafe } = require("./routing-policy-engine");

const EFFECT_QUERY_TERMS = {
  associated_short_breath: "shortness of breath warning symptom cardiopulmonary",
  associated_dizzy_faint: "dizzy faint lightheaded warning symptom cardiopulmonary",
  associated_sweating_nausea_fatigue: "sweating nausea fatigue warning symptom cardiopulmonary",
  associated_symptoms_none_selected: "none associated symptoms heart rate history medication",
  reported_chest_tightness: "chest tightness pressure current feeling",
  reported_chest_pressure_pain: "chest pressure pain current feeling",
  reported_palpitations: "palpitations heart racing high heart rate",
  patient_requests_staff_help: "staff help confirmation",
  history_meds_needs_staff_confirmation: "history medication staff confirmation"
};

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildContextQuery({ session, answerEffects }) {
  const effects = answerEffects.effects || [];
  const vitals = session.vitals || {};
  const heartRateValue = vitals.heart_rate_bpm && typeof vitals.heart_rate_bpm === "object"
    ? vitals.heart_rate_bpm.value
    : vitals.heart_rate_bpm;
  const vitalTerms = Number(heartRateValue) >= 120 ? ["high heart rate", `HR ${heartRateValue}`] : [];
  const effectTerms = effects.flatMap((effect) => tokenize(EFFECT_QUERY_TERMS[effect] || effect));
  return unique([...vitalTerms.flatMap(tokenize), ...effectTerms]).join(" ");
}

function localSimilarity(query, document) {
  const queryTokens = new Set(tokenize(query));
  const documentTokens = new Set(tokenize(document));
  if (!queryTokens.size || !documentTokens.size) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (documentTokens.has(token)) overlap += 1;
  }
  return overlap / Math.sqrt(queryTokens.size * documentTokens.size);
}

function questionDocument(question) {
  return [
    question.id,
    question.text,
    ...(question.trigger_reason_codes || []),
    ...(question.source_refs || []),
    ...(question.registry_refs || []),
    ...question.options.flatMap((option) => [option.id, option.label, ...(option.synonyms || [])])
  ].join(" ");
}

function questionRowsById(vectorIndex) {
  return new Map((vectorIndex && vectorIndex.rows ? vectorIndex.rows : [])
    .filter((row) => row.row_type === "question")
    .map((row) => [row.question_id, row]));
}

function retrieveQuestionCandidates({ session, answerEffects, questionsById, vectorIndex = null, answeredQuestionIds = [], topK = 20 }) {
  if (process.env.DEMO_AI_FORCE_FAILURE === "1") {
    return {
      ai_status: "ai_service_unavailable_deterministic_fallback",
      query: buildContextQuery({ session, answerEffects }),
      candidates: [],
      error: "DEMO_AI_FORCE_FAILURE=1"
    };
  }

  const query = buildContextQuery({ session, answerEffects });
  const indexedQuestionRows = questionRowsById(vectorIndex);
  const candidates = [...questionsById.values()]
    .filter((question) => !answeredQuestionIds.includes(question.id))
    .map((question) => {
      const indexRow = indexedQuestionRows.get(question.id);
      const document = indexRow ? indexRow.document : questionDocument(question);
      const embeddingSimilarity = localSimilarity(query, document);
      const clinicalPolicyNeedScore = (question.trigger_reason_codes || []).some((reasonCode) => query.includes(reasonCode.replaceAll("_", " "))) ? 0.9 : 0.2;
      const unansweredGoalScore = questionIsSafe(question) ? 0.8 : 0;
      const rerankerScore = Math.max(embeddingSimilarity, clinicalPolicyNeedScore * 0.75);
      const unsupportedUiPenalty = questionIsSafe(question) ? 0 : 1;
      const finalCandidateScore =
        0.35 * rerankerScore +
        0.25 * embeddingSimilarity +
        0.25 * clinicalPolicyNeedScore +
        0.15 * unansweredGoalScore -
        unsupportedUiPenalty;

      return {
        question_id: question.id,
        embedding_similarity: Number(embeddingSimilarity.toFixed(4)),
        reranker_score: Number(rerankerScore.toFixed(4)),
        clinical_policy_need_score: Number(clinicalPolicyNeedScore.toFixed(4)),
        unanswered_goal_score: unansweredGoalScore,
        final_candidate_score: Number(finalCandidateScore.toFixed(4)),
        retrieval_source: indexRow ? "question_vector_index" : "manifest_document"
      };
    })
    .sort((left, right) => right.final_candidate_score - left.final_candidate_score)
    .slice(0, topK);

  return {
    ai_status: "local_embedding_reranker_ready",
    query,
    candidates
  };
}

module.exports = {
  buildContextQuery,
  questionRowsById,
  retrieveQuestionCandidates,
  tokenize
};
