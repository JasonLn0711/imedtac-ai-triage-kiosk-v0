function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[，。！？、]/g, " ")
    .replace(/\s+/g, " ");
}

function optionTerms(option, optionIndexRow) {
  const indexedTerms = optionIndexRow
    ? [optionIndexRow.document, ...(optionIndexRow.tokens || [])]
    : [];
  return [option.label, option.id, ...(option.synonyms || []), ...indexedTerms]
    .map(normalize)
    .filter(Boolean);
}

function scoreOption(transcript, option, optionIndexRow) {
  const normalizedTranscript = normalize(transcript);
  if (!normalizedTranscript) return 0;

  const terms = optionTerms(option, optionIndexRow);
  let best = 0;
  for (const term of terms) {
    if (!term) continue;
    if (normalizedTranscript === term) best = Math.max(best, 0.96);
    if (normalizedTranscript.includes(term) || term.includes(normalizedTranscript)) best = Math.max(best, 0.91);
    for (const token of term.split(" ")) {
      if (token.length >= 4 && normalizedTranscript.includes(token)) best = Math.max(best, 0.72);
    }
  }
  return best;
}

function recommendedUiAction(candidates) {
  if (!candidates.length) return "ask_staff_confirm";
  if (candidates.some((candidate) => candidate.confidence >= 0.82)) return "highlight_candidates_require_confirmation";
  return "show_ambiguous_candidates_require_confirmation";
}

function suggestAnswerCandidates(question, input = {}, optionRowsByKey = new Map()) {
  const transcript = input.transcript || "";
  const candidates = question.options
    .map((option) => {
      const optionKey = `${question.id}.${option.id}`;
      const optionIndexRow = optionRowsByKey.get(optionKey);
      return {
        option_id: option.id,
        label: option.label,
        confidence: Number(scoreOption(transcript, option, optionIndexRow).toFixed(2)),
        needs_confirmation: true,
        retrieval_source: optionIndexRow ? "current_question_option_index" : "current_question_option_terms"
      };
    })
    .filter((candidate) => candidate.confidence >= 0.6)
    .sort((left, right) => right.confidence - left.confidence);

  return {
    status: "candidates",
    question_id: question.id,
    allowed_option_space: question.options.map((option) => option.id),
    candidates,
    recommended_ui_action: recommendedUiAction(candidates)
  };
}

module.exports = {
  optionTerms,
  scoreOption,
  suggestAnswerCandidates
};
