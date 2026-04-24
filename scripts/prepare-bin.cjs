const fs = require("node:fs");
const path = require("node:path");

const BIN_PATH = path.join(__dirname, "..", "dist", "index.js");
const SHEBANG = "#!/usr/bin/env node";

if (!fs.existsSync(BIN_PATH)) {
  throw new Error(`Missing bin file: ${BIN_PATH}. Run build first.`);
}

let content = fs.readFileSync(BIN_PATH, "utf8");
if (!content.startsWith(SHEBANG)) {
  content = `${SHEBANG}\n${content}`;
  fs.writeFileSync(BIN_PATH, content, "utf8");
}

if (process.platform !== "win32") {
  fs.chmodSync(BIN_PATH, 0o755);
}
