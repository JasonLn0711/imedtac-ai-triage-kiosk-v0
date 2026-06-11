const { unique } = require("./answer-effect-mapper");
const { valueOfVital } = require("./derived-flag-updater");
const { retrieveSummaryTemplatePhrases } = require("./summary-template-retriever");

function formatVitalValue(vitals, field, suffix) {
  const value = valueOfVital(vitals, field);
  if (value === null || value === undefined || value === "") return null;
  return `${value}${suffix}`;
}

function formatBloodPressure(vitals) {
  const systolic = valueOfVital(vitals, "blood_pressure_systolic_mm_hg");
  const diastolic = valueOfVital(vitals, "blood_pressure_diastolic_mm_hg");
  if (systolic !== null && systolic !== undefined && diastolic !== null && diastolic !== undefined) {
    return `BP ${systolic}/${diastolic} mmHg`;
  }

  const bloodPressure = valueOfVital(vitals, "blood_pressure");
  if (bloodPressure) return `BP ${bloodPressure}`;
  return null;
}

function vitalQualityPhrase(vitals, field, label) {
  const value = vitals && vitals[field];
  if (!value || typeof value !== "object" || !value.quality_flag) return null;
  return `${label} field quality flag is ${value.quality_flag}.`;
}

function buildObjective(vitals) {
  const parts = [
    formatVitalValue(vitals, "heart_rate_bpm", " bpm") && `HR ${valueOfVital(vitals, "heart_rate_bpm")} bpm`,
    formatVitalValue(vitals, "spo2_percent", "%") && `SpO2 ${valueOfVital(vitals, "spo2_percent")}%`,
    formatBloodPressure(vitals),
    formatVitalValue(vitals, "respiratory_rate_per_min", " breaths/min") && `respiratory rate ${valueOfVital(vitals, "respiratory_rate_per_min")} breaths/min`,
    formatVitalValue(vitals, "temperature_c", " C") && `temperature ${valueOfVital(vitals, "temperature_c")} C`
  ].filter(Boolean);

  const objective = parts.length
    ? [`Demo vital payload includes ${parts.join(", ")}.`]
    : ["No measured vital values were provided in this demo session."];

  const qualityPhrases = [
    vitalQualityPhrase(vitals, "heart_rate_bpm", "Heart-rate"),
    vitalQualityPhrase(vitals, "spo2_percent", "SpO2"),
    vitalQualityPhrase(vitals, "blood_pressure_systolic_mm_hg", "Blood-pressure systolic"),
    vitalQualityPhrase(vitals, "blood_pressure_diastolic_mm_hg", "Blood-pressure diastolic")
  ].filter(Boolean);

  return objective.concat(qualityPhrases);
}

function answerSubjectivePhrases(session) {
  return unique(session.answers.flatMap((answer) => {
    const phrases = answer.summary_phrases && answer.summary_phrases.subjective;
    if (phrases && phrases.length) return phrases;
    return [`${answer.question_id}: ${answer.selected_option_labels.join(", ")}.`];
  }));
}

function effectSet(session) {
  return new Set(session.answers.flatMap((answer) => answer.effects || []));
}

function reasonCodes(session) {
  const codes = session.answers.flatMap((answer) => answer.reason_codes || []);
  if (session.derived_flags && session.derived_flags.elevated_heart_rate_demo) {
    codes.unshift("measured_elevated_heart_rate_demo");
  }
  codes.push("staff_review_needed");
  return unique(codes);
}

function buildReviewBasis(session, summaryTemplates) {
  const effects = effectSet(session);
  return retrieveSummaryTemplatePhrases(summaryTemplates, {
    section: "review_basis",
    effects: [...effects],
    derivedFlags: session.derived_flags || {},
    reasonCodes: reasonCodes(session)
  }).phrases;
}

function buildReviewAction(session, summaryTemplates) {
  const effects = effectSet(session);
  return retrieveSummaryTemplatePhrases(summaryTemplates, {
    section: "review_action",
    effects: [...effects],
    derivedFlags: session.derived_flags || {},
    reasonCodes: reasonCodes(session)
  }).phrases;
}

function pathType(session) {
  const effects = effectSet(session);
  return effects.has("associated_warning_symptom_selected") ? "warning" : "low_concern";
}

function assembleStaffReviewSummary(session, summaryTemplates) {
  const path = pathType(session);
  return {
    summary_visibility: "staff_only",
    handoff_required: true,
    handoff_reason_codes: reasonCodes(session),
    staff_review_summary: {
      format: summaryTemplates.format,
      subjective: answerSubjectivePhrases(session),
      objective: buildObjective(session.vitals || {}),
      review_basis: buildReviewBasis(session, summaryTemplates),
      review_action: buildReviewAction(session, summaryTemplates),
      staff_handoff_note: summaryTemplates.staff_handoff_note_by_path[path],
      scope_controls: summaryTemplates.scope_controls
    }
  };
}

module.exports = {
  assembleStaffReviewSummary,
  buildObjective
};
