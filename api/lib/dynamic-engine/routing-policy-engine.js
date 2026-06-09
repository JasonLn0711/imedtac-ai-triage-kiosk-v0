function hasAny(effects, requiredEffects) {
  return requiredEffects.some((effect) => effects.includes(effect));
}

function hasAll(effects, requiredEffects) {
  return requiredEffects.every((effect) => effects.includes(effect));
}

function questionIsSafe(question) {
  if (!question) return false;
  if (question.demo_allowed !== true) return false;
  if (!["single_choice", "multi_choice"].includes(question.type)) return false;
  if (!Array.isArray(question.options) || question.options.length < 1) return false;
  if (question.options.length > 9) return false;
  return true;
}

function firstSafeCandidate(candidateIds, questionsById, answeredQuestionIds) {
  return candidateIds.find((questionId) => {
    if (answeredQuestionIds.includes(questionId)) return false;
    return questionIsSafe(questionsById.get(questionId));
  }) || null;
}

function selectNextQuestion({ session, currentQuestionId, answerEffects, aiResult, questionsById, routingPolicy }) {
  const answeredQuestionIds = session.answers.map((answer) => answer.question_id);
  const dynamicRules = [...(routingPolicy.dynamic_rules || [])].sort((left, right) => left.priority - right.priority);
  const aiCandidateQuestionIds = (aiResult && aiResult.candidates ? aiResult.candidates.map((candidate) => candidate.question_id) : []);

  for (const rule of dynamicRules) {
    if (rule.from_question_id !== currentQuestionId) continue;
    if (rule.any_effects && !hasAny(answerEffects.effects, rule.any_effects)) continue;
    if (rule.all_effects && !hasAll(answerEffects.effects, rule.all_effects)) continue;

    const candidateQuestionIds = [...new Set([...(aiCandidateQuestionIds || []), ...(rule.candidate_question_ids || [rule.selected_next_question_id])])];
    const selectedNextQuestionId = firstSafeCandidate([rule.selected_next_question_id, ...candidateQuestionIds], questionsById, answeredQuestionIds);
    return {
      status: selectedNextQuestionId ? "question" : "summary",
      rule_id: rule.id,
      ai_status: aiResult && aiResult.ai_status ? aiResult.ai_status : routingPolicy.fallback.ai_status,
      ai_candidate_question_ids: candidateQuestionIds,
      safe_candidate_question_ids: candidateQuestionIds.filter((questionId) => questionIsSafe(questionsById.get(questionId))),
      selected_next_question_id: selectedNextQuestionId,
      reason_codes: rule.reason_codes || [],
      phase_reason: rule.phase_reason
    };
  }

  if ((routingPolicy.summary_after_question_ids || []).includes(currentQuestionId)) {
    return {
      status: "summary",
      rule_id: "summary-after-final-question",
      ai_status: aiResult && aiResult.ai_status ? aiResult.ai_status : routingPolicy.fallback.ai_status,
      ai_candidate_question_ids: aiCandidateQuestionIds,
      safe_candidate_question_ids: [],
      selected_next_question_id: null,
      reason_codes: ["summary_ready_after_final_question"],
      phase_reason: "The final governed tachycardia demo question was recorded, so the staff-review summary is ready."
    };
  }

  const defaultNextQuestionId = routingPolicy.default_next_question_by_id[currentQuestionId] || null;
  const candidateQuestionIds = [...new Set([...(aiCandidateQuestionIds || []), ...(defaultNextQuestionId ? [defaultNextQuestionId] : [])])];
  const selectedNextQuestionId = firstSafeCandidate(defaultNextQuestionId ? [defaultNextQuestionId, ...candidateQuestionIds] : candidateQuestionIds, questionsById, answeredQuestionIds);

  return {
    status: selectedNextQuestionId ? "question" : "summary",
    rule_id: selectedNextQuestionId ? "default-next-question" : "default-summary",
    ai_status: aiResult && aiResult.ai_status ? aiResult.ai_status : routingPolicy.fallback.ai_status,
    ai_candidate_question_ids: candidateQuestionIds,
    safe_candidate_question_ids: selectedNextQuestionId ? [selectedNextQuestionId] : [],
    selected_next_question_id: selectedNextQuestionId,
    reason_codes: selectedNextQuestionId ? ["default_governed_next_question"] : ["deterministic_policy_fallback"],
    phase_reason: selectedNextQuestionId
      ? `${currentQuestionId} was recorded; the next governed tachycardia demo question is ready.`
      : "No remaining governed tachycardia demo question is available, so the staff-review summary is ready."
  };
}

module.exports = {
  questionIsSafe,
  selectNextQuestion
};
