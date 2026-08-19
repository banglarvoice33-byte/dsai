import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "dist"].includes(entry.name)) walk(full);
    else if (/\.(tsx|css|html)$/.test(entry.name)) sourceFiles.push(full);
  }
}
walk(path.join(root, "client"));
const source = sourceFiles.map(file => fs.readFileSync(file, "utf8")).join("\n");
const checks = [
  ["visible focus treatment", /focus-visible|focus:ring/],
  ["reduced motion support", /prefers-reduced-motion/],
  ["image alternative text", /<img[\s\S]{0,240}(alt=|aria-label=)/],
  ["labeled form controls", /(aria-label=|<label)/],
  ["semantic dialog support", /role="dialog"|aria-modal=/],
];
const failures = checks.filter(([, pattern]) => !pattern.test(source)).map(([label]) => label);
if (failures.length) {
  console.error(`Accessibility contract failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`Accessibility contract passed: ${checks.length} checks across ${sourceFiles.length} client files.`);
