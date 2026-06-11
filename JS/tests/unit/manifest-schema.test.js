const assert = require("node:assert/strict");
const test = require("node:test");

const { validateManifest } = require("../../api/lib/dynamic-engine/manifest-validator");
const manifest = require("../../../data/question_manifest.tachycardia.v0.3.json");
const vectorIndex = require("../../../data/vector_index/tachycardia.v0.3.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("UT-MAN-001 valid tachycardia manifest passes schema validation", () => {
  const result = validateManifest(manifest);
  assert.equal(result.ok, true);
});

test("UT-MAN-002 option count over 9 fails schema validation", () => {
  const invalid = clone(manifest);
  invalid.questions[0].options = Array.from({ length: 10 }, (_, index) => ({
    id: `option_${index}`,
    label: `Option ${index}`
  }));
  const result = validateManifest(invalid);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /option count/);
});

test("UT-MAN-003 duplicate option id fails schema validation", () => {
  const invalid = clone(manifest);
  invalid.questions[0].options[1].id = invalid.questions[0].options[0].id;
  const result = validateManifest(invalid);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /duplicate option id/);
});

test("UT-MAN-004 missing source refs fails schema validation", () => {
  const invalid = clone(manifest);
  invalid.questions[0].source_refs = [];
  const result = validateManifest(invalid);
  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /source_refs/);
});

test("dynamic vector index includes question and option rows for every manifest item", () => {
  const questionIds = new Set(manifest.questions.map((question) => question.id));
  const optionKeys = new Set(manifest.questions.flatMap((question) => question.options.map((option) => `${question.id}.${option.id}`)));
  const questionRows = vectorIndex.rows.filter((row) => row.row_type === "question");
  const optionRows = vectorIndex.rows.filter((row) => row.row_type === "option");

  assert.deepEqual(new Set(questionRows.map((row) => row.question_id)), questionIds);
  assert.deepEqual(new Set(optionRows.map((row) => row.option_key)), optionKeys);
  assert.equal(vectorIndex.row_counts.questions, questionIds.size);
  assert.equal(vectorIndex.row_counts.options, optionKeys.size);
  assert.ok(optionRows.every((row) => row.tokens.length > 0));
});
