const { unique } = require("./answer-effect-mapper");
const { tokenize } = require("./ai-retrieval-client");

function localSimilarity(queryTokens, phraseTokens) {
  if (!queryTokens.size || !phraseTokens.size) return 0;
  let overlap = 0;
  for (const token of queryTokens) {
    if (phraseTokens.has(token)) overlap += 1;
  }
  return overlap / Math.sqrt(queryTokens.size * phraseTokens.size);
}

function sectionMap(summaryTemplates, section) {
  if (section === "review_basis") return summaryTemplates.review_basis_by_effect || {};
  if (section === "review_action") return summaryTemplates.review_action_by_effect || {};
  return {};
}

function defaultPhrases(summaryTemplates, section) {
  if (section === "review_basis") return summaryTemplates.default_review_basis || [];
  if (section === "review_action") return [summaryTemplates.default_review_action].filter(Boolean);
  return [];
}

function summaryTemplateRows(summaryTemplates, section) {
  return Object.entries(sectionMap(summaryTemplates, section)).map(([effect, phrase]) => ({
    row_id: `${section}:${effect}`,
    section,
    effect,
    phrase,
    approved_template: true,
    tokens: tokenize([effect, phrase].join(" "))
  }));
}

function queryEffects({ effects = [], derivedFlags = {} }) {
  const values = [...effects];
  if (derivedFlags.elevated_heart_rate_demo) values.unshift("measured_elevated_heart_rate_demo");
  return unique(values);
}

function retrieveSummaryTemplatePhrases(summaryTemplates, options = {}) {
  const section = options.section || "review_basis";
  const effects = queryEffects({
    effects: options.effects || [],
    derivedFlags: options.derivedFlags || {}
  });
  const effectSet = new Set(effects);
  const queryTokens = new Set(tokenize([...effects, ...(options.reasonCodes || [])].join(" ")));
  const candidateRows = summaryTemplateRows(summaryTemplates, section)
    .map((row) => ({
      ...row,
      retrieval_score: Number(localSimilarity(queryTokens, new Set(row.tokens)).toFixed(4)),
      selected_by_gate: effectSet.has(row.effect)
    }))
    .sort((left, right) => {
      if (left.selected_by_gate !== right.selected_by_gate) return left.selected_by_gate ? -1 : 1;
      return right.retrieval_score - left.retrieval_score;
    });

  const selected = candidateRows
    .filter((row) => row.selected_by_gate && row.approved_template)
    .map((row) => row.phrase);

  return {
    status: "approved_template_retrieval_complete",
    section,
    query_effects: effects,
    candidate_rows: candidateRows.map((row) => ({
      row_id: row.row_id,
      effect: row.effect,
      retrieval_score: row.retrieval_score,
      selected_by_gate: row.selected_by_gate
    })),
    phrases: unique([...selected, ...defaultPhrases(summaryTemplates, section)])
  };
}

module.exports = {
  retrieveSummaryTemplatePhrases,
  summaryTemplateRows
};
