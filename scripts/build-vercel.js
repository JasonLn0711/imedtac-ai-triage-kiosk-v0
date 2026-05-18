const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const ALLOWED_TOP_LEVEL = ["app", "core", "demo"];

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

for (const folder of ALLOWED_TOP_LEVEL) {
  copyDirectory(path.join(ROOT, folder), path.join(DIST, folder));
}

fs.writeFileSync(
  path.join(DIST, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./app/triage-kiosk/">
    <title>AI Triage Kiosk Demo</title>
  </head>
  <body>
    <p><a href="./app/triage-kiosk/">Open the AI Triage Kiosk Demo</a></p>
  </body>
</html>
`,
  "utf8"
);

const forbidden = ["source", "handoff", "docs", "planning-bridge", "decisions"];
const leaked = forbidden.filter((folder) => fs.existsSync(path.join(DIST, folder)));
if (leaked.length) {
  throw new Error(`Forbidden folders leaked into dist: ${leaked.join(", ")}`);
}

console.log("Built dist/ with frontend runtime only.");
