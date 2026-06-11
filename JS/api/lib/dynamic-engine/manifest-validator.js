function assertCondition(condition, message, errors) {
  if (!condition) errors.push(message);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

function validateManifest(manifest) {
  const errors = [];
  assertCondition(Boolean(manifest && manifest.manifest_version), "manifest_version is required", errors);
  assertCondition(Array.isArray(manifest && manifest.questions), "questions must be an array", errors);

  for (const question of manifest.questions || []) {
    const prefix = question && question.id ? `question ${question.id}` : "question <missing-id>";
    assertCondition(Boolean(question.id), `${prefix} id is required`, errors);
    assertCondition(question.demo_allowed === true, `${prefix} must be demo_allowed=true`, errors);
    assertCondition(Boolean(question.text), `${prefix} text is required`, errors);
    assertCondition(["single_choice", "multi_choice"].includes(question.type), `${prefix} has unsupported type ${question.type}`, errors);
    assertCondition(Array.isArray(question.registry_refs) && question.registry_refs.length > 0, `${prefix} registry_refs are required`, errors);
    assertCondition(Array.isArray(question.source_refs) && question.source_refs.length > 0, `${prefix} source_refs are required`, errors);
    assertCondition(Boolean(question.review_owner), `${prefix} review_owner is required`, errors);
    assertCondition(Boolean(question.evidence_status), `${prefix} evidence_status is required`, errors);
    assertCondition(Array.isArray(question.options), `${prefix} options must be an array`, errors);

    const options = question.options || [];
    assertCondition(options.length >= 2 && options.length <= 9, `${prefix} option count must be 2-9`, errors);
    const optionIds = options.map((option) => option.id).filter(Boolean);
    assertCondition(optionIds.length === options.length, `${prefix} every option needs an id`, errors);
    for (const duplicate of duplicateValues(optionIds)) {
      errors.push(`${prefix} has duplicate option id ${duplicate}`);
    }
    for (const option of options) {
      assertCondition(Boolean(option.label), `${prefix}.${option.id || "<missing-option-id>"} label is required`, errors);
      assertCondition(String(option.label || "").length <= 80, `${prefix}.${option.id || "<missing-option-id>"} label is longer than 80 chars`, errors);
    }
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

function assertValidManifest(manifest) {
  const result = validateManifest(manifest);
  if (!result.ok) {
    throw new Error(`Invalid dynamic question manifest:\n${result.errors.join("\n")}`);
  }
}

module.exports = {
  assertValidManifest,
  validateManifest
};
