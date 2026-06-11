const assert = require("node:assert/strict");
const test = require("node:test");

const { mapAnswerEffects } = require("../../api/lib/dynamic-engine/answer-effect-mapper");
const manifest = require("../../../data/question_manifest.tachycardia.v0.3.json");
const answerEffects = require("../../../data/answer_effects.tachycardia.v0.3.json");

const associatedQuestion = manifest.questions.find((question) => question.id === "tachy-associated-symptoms");

test("UT-EFF-001 short_breath maps to associated_short_breath", () => {
  const mapped = mapAnswerEffects(answerEffects, associatedQuestion, ["short_breath"]);
  assert.ok(mapped.effects.includes("associated_short_breath"));
  assert.ok(mapped.reason_codes.includes("selected_short_breath_with_high_hr"));
});

test("UT-EFF-002 none_of_these carries mutually exclusive none-selected effect", () => {
  const mapped = mapAnswerEffects(answerEffects, associatedQuestion, ["none_of_these"]);
  assert.deepEqual(mapped.effects, ["associated_symptoms_none_selected"]);
  assert.ok(mapped.reason_codes.includes("no_listed_associated_symptoms_selected"));
});
