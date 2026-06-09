const EFFECT_TO_FLAG = {
  reported_palpitations: "reported_palpitations",
  reported_chest_tightness: "reported_chest_tightness",
  reported_chest_pressure_pain: "reported_chest_pressure_pain",
  associated_short_breath: "selected_short_breath",
  associated_sweating_nausea_fatigue: "selected_sweating_nausea_fatigue",
  associated_dizzy_faint: "selected_dizzy_faint",
  associated_warning_symptom_selected: "associated_warning_symptom_selected",
  associated_symptoms_none_selected: "associated_symptoms_none_selected",
  known_rhythm_problem: "known_rhythm_problem",
  heart_bp_medicine: "heart_bp_medicine",
  medication_allergy_selected: "medication_allergy_selected",
  regular_medicines_selected: "regular_medicines_selected",
  patient_requests_staff_help: "patient_requests_staff_help"
};

function valueOfVital(vitals, field) {
  const value = vitals && vitals[field];
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value;
}

function numericVital(vitals, field) {
  const value = valueOfVital(vitals, field);
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function initialDerivedFlags(vitals, routingPolicy) {
  const threshold = routingPolicy.thresholds && routingPolicy.thresholds.elevated_heart_rate_bpm_demo;
  const heartRate = numericVital(vitals, "heart_rate_bpm");
  return {
    elevated_heart_rate_demo: Number.isFinite(heartRate) && Number.isFinite(threshold) ? heartRate >= threshold : false,
    measured_heart_rate_bpm: Number.isFinite(heartRate) ? heartRate : null
  };
}

function updateDerivedFlags(existingFlags, effects) {
  const flags = { ...(existingFlags || {}) };
  for (const effect of effects || []) {
    const flag = EFFECT_TO_FLAG[effect];
    if (flag) flags[flag] = true;
  }
  return flags;
}

module.exports = {
  initialDerivedFlags,
  numericVital,
  updateDerivedFlags,
  valueOfVital
};
