const assert = require("node:assert/strict");
const test = require("node:test");

const { assembleStaffReviewSummary } = require("../../api/lib/dynamic-engine/summary-assembler");
const { retrieveSummaryTemplatePhrases } = require("../../api/lib/dynamic-engine/summary-template-retriever");
const summaryTemplates = require("../../../data/summary_templates.tachycardia.v0.3.json");

function session(overrides = {}) {
  return {
    vitals: overrides.vitals || {
      heart_rate_bpm: 130,
      spo2_percent: 97,
      blood_pressure_systolic_mm_hg: 128,
      blood_pressure_diastolic_mm_hg: 82
    },
    derived_flags: overrides.derived_flags || { elevated_heart_rate_demo: true },
    answers: overrides.answers || []
  };
}

test("UT-SUM-001 selected short_breath appears as staff-review phrase", () => {
  const summary = assembleStaffReviewSummary(session({
    answers: [{
      question_id: "tachy-associated-symptoms",
      effects: ["associated_short_breath", "associated_warning_symptom_selected"],
      reason_codes: ["selected_short_breath_with_high_hr"],
      selected_option_labels: ["Shortness of breath"],
      summary_phrases: { subjective: ["Associated symptoms selected for staff review include shortness of breath."] }
    }]
  }), summaryTemplates);
  assert.match(summary.staff_review_summary.subjective.join(" "), /shortness of breath/i);
});

test("UT-SUM-002 missing SpO2 is omitted from objective", () => {
  const summary = assembleStaffReviewSummary(session({
    vitals: { heart_rate_bpm: 118 },
    derived_flags: { elevated_heart_rate_demo: false }
  }), summaryTemplates);
  assert.match(summary.staff_review_summary.objective.join(" "), /HR 118 bpm/);
  assert.doesNotMatch(summary.staff_review_summary.objective.join(" "), /SpO2/);
});

test("UT-SUM-003 summary contains no diagnosis treatment or formal acuity wording", () => {
  const summary = assembleStaffReviewSummary(session(), summaryTemplates);
  const text = JSON.stringify(summary.staff_review_summary);
  assert.doesNotMatch(text, /diagnosis|treatment|formal triage|ESI level|ECG order/i);
});

test("SUM-006 not_sure selected asks staff to confirm symptom context", () => {
  const summary = assembleStaffReviewSummary(session({
    answers: [{
      question_id: "tachy-warning-symptom-review",
      effects: ["warning_symptom_status_needs_staff_confirmation"],
      reason_codes: ["warning_symptom_status_needs_staff_confirmation"],
      selected_option_labels: ["Not sure"],
      summary_phrases: {
        subjective: ["Patient selected not sure for current associated-symptom status; staff should confirm."]
      }
    }]
  }), summaryTemplates);

  assert.match(summary.staff_review_summary.subjective.join(" "), /not sure/i);
  assert.match(summary.staff_review_summary.subjective.join(" "), /staff should confirm/i);
});

test("AI-SUM-001 summary phrase retrieval selects only approved templates gated by session effects", () => {
  const retrieval = retrieveSummaryTemplatePhrases(summaryTemplates, {
    section: "review_basis",
    effects: ["associated_warning_symptom_selected"],
    derivedFlags: { elevated_heart_rate_demo: true },
    reasonCodes: ["associated_warning_symptom_selected"]
  });

  assert.equal(retrieval.status, "approved_template_retrieval_complete");
  assert.ok(retrieval.phrases.includes(summaryTemplates.review_basis_by_effect.measured_elevated_heart_rate_demo));
  assert.ok(retrieval.phrases.includes(summaryTemplates.review_basis_by_effect.associated_warning_symptom_selected));
  assert.ok(retrieval.candidate_rows.every((row) => row.row_id.startsWith("review_basis:")));
  assert.ok(retrieval.candidate_rows.filter((row) => row.selected_by_gate).length >= 2);
  assert.doesNotMatch(retrieval.phrases.join(" "), /diagnosis|treatment|formal triage|ECG order/i);
});
