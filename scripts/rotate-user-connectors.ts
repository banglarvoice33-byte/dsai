import { rotateUserConnectorCredentials } from "../server/userConnectors";

const batchSize = Number(process.env.ROTATION_BATCH_SIZE || 100);
if (!Number.isInteger(batchSize) || batchSize < 1 || batchSize > 1000) {
  throw new Error("ROTATION_BATCH_SIZE must be an integer from 1 to 1000.");
}

let scanned = 0;
let rotated = 0;
let skipped = 0;
let failed = 0;
let activeKeyId = "legacy";
for (;;) {
  const result = await rotateUserConnectorCredentials(batchSize);
  scanned += result.scanned;
  rotated += result.rotated;
  skipped += result.skipped;
  failed += result.failed;
  activeKeyId = result.activeKeyId;
  if (result.failed > 0 || result.scanned < batchSize || result.rotated === 0) break;
}

// Never print credential material; only aggregate counts and the non-secret key identifier.
console.log(JSON.stringify({ scanned, rotated, skipped, failed, activeKeyId }));
if (failed > 0) process.exitCode = 1;
