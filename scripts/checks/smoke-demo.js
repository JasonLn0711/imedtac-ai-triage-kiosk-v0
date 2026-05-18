const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "../..");
const REQUIRED_FILES = [
  "package.json",
  "vercel.json",
  "scripts/build-vercel.js",
  "app/index.html",
  "app/triage-kiosk/index.html",
  "app/triage-kiosk/triage-kiosk.js",
  "app/shared/styles.css",
  "core/triage_engine/index.js",
  "demo/fixtures/chest-pain-high-bp-low-spo2.json",
  "demo/fixtures/fever-urinary.json"
];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

for (const relativePath of REQUIRED_FILES) {
  assert(fs.existsSync(path.join(ROOT, relativePath)), `Missing required demo file: ${relativePath}`);
}

const html = read("app/triage-kiosk/index.html");
const script = read("app/triage-kiosk/triage-kiosk.js");
const engine = require(path.join(ROOT, "core/triage_engine/index.js"));

assert(html.includes("AI Triage Kiosk Demo"), "Demo HTML should expose the English product title.");
assert(html.includes("../../core/triage_engine/index.js"), "Demo HTML should load the triage engine.");
assert(script.includes("AiTriageKioskEngine"), "Demo script should bind to the triage engine.");
assert(script.includes("Selected #"), "Multi-choice selections should show visible selection order.");
assert(engine.CASES.length >= 2, "At least two synthetic cases are required.");
assert(engine.QUESTION_BANK.length >= 8, "The governed question bank is too small for the demo.");
assert(engine.CASES.every((demoCase) => demoCase.profile && demoCase.profile.age && demoCase.profile.sex), "Every case should include synthetic patient profile metadata.");
assert(!html.includes("<textarea"), "Demo runtime should stay choice-only and not expose free-text input.");
assert(engine.QUESTION_BANK.every((question) => question.type !== "text"), "Question bank should not include free-text questions.");
assert(engine.VERSION.boundary.includes("not diagnosis"), "Safety boundary must reject diagnosis claims.");

const vercelConfig = JSON.parse(read("vercel.json"));
assert(vercelConfig.outputDirectory === "dist", "Vercel should deploy only the sanitized dist directory.");

const serializedDemo = [html, script, read("core/triage_engine/index.js")].join("\n");
const forbiddenTerms = [
  "\u6ccc\u5c3f",
  "\u9810\u8a3a",
  "\u5c3f\u5c3f",
  "\u91ab\u5e2b",
  "\u75c5\u4eba",
  "\u8b77\u7406",
  ["Uro", "Previsit"].join("")
];
for (const term of forbiddenTerms) {
  assert(!serializedDemo.includes(term), `Demo runtime still contains urology/source-language term: ${term}`);
}

console.log("AI triage kiosk demo smoke check passed.");
