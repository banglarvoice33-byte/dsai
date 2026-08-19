const SECRET_KEY = /(token|secret|password|authorization|cookie|api[_-]?key|prompt|body|payload)/i;

export type TelemetryAttributes = Record<string, string | number | boolean | null | undefined>;

export function redactTelemetryAttributes(attributes: TelemetryAttributes) {
  return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, SECRET_KEY.test(key) ? "[REDACTED]" : value]));
}

export function emitTelemetry(event: string, attributes: TelemetryAttributes = {}) {
  const record = { event, timestamp: new Date().toISOString(), ...redactTelemetryAttributes(attributes) };
  console.info(JSON.stringify(record));
  return record;
}

export function durationMs(startedAt: number) {
  return Math.max(0, Math.round(performance.now() - startedAt));
}
