function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function mapAnswerEffects(answerEffects, question, selectedOptionIds) {
  const selectedOptions = new Map(question.options.map((option) => [option.id, option]));
  const mappings = selectedOptionIds.map((optionId) => {
    const key = `${question.id}.${optionId}`;
    const effectRecord = answerEffects.option_effects[key] || {};
    const option = selectedOptions.get(optionId) || { id: optionId, label: optionId };
    return {
      option_id: optionId,
      label: option.label,
      effects: effectRecord.effects || [],
      reason_codes: effectRecord.reason_codes || [],
      summary_phrases: effectRecord.summary_phrases || {}
    };
  });

  return {
    selected_option_ids: selectedOptionIds,
    selected_option_labels: mappings.map((mapping) => mapping.label),
    effects: unique(mappings.flatMap((mapping) => mapping.effects)),
    reason_codes: unique(mappings.flatMap((mapping) => mapping.reason_codes)),
    summary_phrases: {
      subjective: unique(mappings.flatMap((mapping) => mapping.summary_phrases.subjective || [])),
      objective: unique(mappings.flatMap((mapping) => mapping.summary_phrases.objective || [])),
      review_basis: unique(mappings.flatMap((mapping) => mapping.summary_phrases.review_basis || [])),
      review_action: unique(mappings.flatMap((mapping) => mapping.summary_phrases.review_action || []))
    },
    option_effects: mappings
  };
}

module.exports = {
  mapAnswerEffects,
  unique
};
