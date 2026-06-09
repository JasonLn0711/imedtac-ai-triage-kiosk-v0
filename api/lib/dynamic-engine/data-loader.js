const fs = require("node:fs");
const path = require("node:path");
const { assertValidManifest } = require("./manifest-validator");

const ROOT = path.resolve(__dirname, "../../..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function indexQuestions(manifest) {
  return new Map(manifest.questions.map((question) => [question.id, question]));
}

function indexOptionRows(vectorIndex) {
  return new Map((vectorIndex.rows || [])
    .filter((row) => row.row_type === "option")
    .map((row) => [row.option_key, row]));
}

function loadDynamicEngineData() {
  const manifest = readJson("data/question_manifest.tachycardia.v0.3.json");
  assertValidManifest(manifest);
  const vectorIndex = readJson("data/vector_index/tachycardia.v0.3.json");
  return {
    manifest,
    answerEffects: readJson("data/answer_effects.tachycardia.v0.3.json"),
    routingPolicy: readJson("data/routing_policy.tachycardia.v0.3.json"),
    summaryTemplates: readJson("data/summary_templates.tachycardia.v0.3.json"),
    vectorIndex,
    optionRowsByKey: indexOptionRows(vectorIndex),
    questionsById: indexQuestions(manifest)
  };
}

module.exports = {
  indexOptionRows,
  loadDynamicEngineData
};
