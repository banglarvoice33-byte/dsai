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
const sharedConstants = fs.readFileSync(path.join(root, "shared/const.ts"), "utf8");
const contactConstants = fs.readFileSync(path.join(root, "shared/contact.ts"), "utf8");
const css = fs.readFileSync(path.join(root, "client/src/index.css"), "utf8");
const supportEmail = contactConstants.match(/export const CONTACT_EMAIL = "([^"]+)";/)?.[1];
const hasBengaliBodyRhythm = /:lang\(bn\)\s+body\s*\{[^}]*line-height:\s*1\.85/s.test(css);
const hasBengaliHeadingRhythm = /:lang\(bn\)\s+:is\(h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\)\s*\{[^}]*line-height:\s*1\.28/s.test(css);
const hasLegacySupportAddress = /banglarvoice33@gmail\.com/.test(source);
const hasSupportCompatibilityExport = sharedConstants.includes("CONTACT_EMAIL as SUPPORT_EMAIL");
const checks = [
  ["visible focus treatment", /focus-visible|focus:ring/],
  ["reduced motion support", /prefers-reduced-motion/],
  ["image alternative text", /<img[\s\S]{0,240}(alt=|aria-label=)/],
  ["labeled form controls", /(aria-label=|<label)/],
  ["semantic dialog support", /role="dialog"|aria-modal=/],
  ["Bengali body reading rhythm", hasBengaliBodyRhythm],
  ["Bengali heading glyph clearance", hasBengaliHeadingRhythm],
  ["single canonical support contact", Boolean(supportEmail === "info@banglarvoice24news.com" && source.includes("CONTACT_EMAIL") && hasSupportCompatibilityExport && !hasLegacySupportAddress)],
];
const failures = checks.filter(([, condition]) => typeof condition === "boolean" ? !condition : !condition.test(source)).map(([label]) => label);
if (failures.length) {
  console.error(`Accessibility contract failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`Accessibility contract passed: ${checks.length} checks across ${sourceFiles.length} client files.`);
