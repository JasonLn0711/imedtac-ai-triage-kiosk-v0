#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { tokenize } = require("../api/lib/dynamic-engine/ai-retrieval-client");

const ROOT = path.resolve(__dirname, "../..");
const manifestPath = path.join(ROOT, "data/question_manifest.tachycardia.v0.3.json");
const outputPath = path.join(ROOT, "data/vector_index/tachycardia.v0.3.json");

function questionDocument(question) {
  return [
    question.id,
    question.text,
    ...(question.trigger_reason_codes || []),
    ...(question.source_refs || []),
    ...(question.registry_refs || []),
    ...question.options.flatMap((option) => [option.id, option.label, ...(option.synonyms || [])])
  ].join(" ");
}

function optionDocument(question, option) {
  return [
    question.id,
    question.text,
    ...(question.trigger_reason_codes || []),
    ...(question.source_refs || []),
    ...(question.registry_refs || []),
    option.id,
    option.label,
    ...(option.synonyms || [])
  ].join(" ");
}

function rowTokens(document) {
  return [...new Set(tokenize(document))].sort();
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const questionRows = manifest.questions.map((question) => {
    const document = questionDocument(question);
    return {
      row_type: "question",
      row_id: `question:${question.id}`,
      question_id: question.id,
      manifest_version: manifest.manifest_version,
      document,
      tokens: rowTokens(document)
    };
  });
  const optionRows = manifest.questions.flatMap((question) => question.options.map((option) => {
    const document = optionDocument(question, option);
    return {
      row_type: "option",
      row_id: `option:${question.id}.${option.id}`,
      question_id: question.id,
      option_id: option.id,
      option_key: `${question.id}.${option.id}`,
      manifest_version: manifest.manifest_version,
      document,
      tokens: rowTokens(document)
    };
  }));
  const rows = [...questionRows, ...optionRows];

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify({
    index_version: manifest.manifest_version,
    generated_from: "data/question_manifest.tachycardia.v0.3.json",
    embedding_backend: "local_token_index_qwen_service_ready",
    row_counts: {
      questions: questionRows.length,
      options: optionRows.length
    },
    rows
  }, null, 2)}\n`);
  console.log(`Built ${path.relative(ROOT, outputPath)} question_rows=${questionRows.length} option_rows=${optionRows.length}`);
}

main();
