export const WORDS_0_99: string[];
export function bnToNum(value: unknown): number;
export function intToWords(value: number | string): string;
export function timeWord(hour: number, minute: number): string;
export function periodForHour(hour: number): string;
export interface BanglaSpeechChange { kind: string; from: string; to: string }
export interface BanglaSpeechOptions {
  maxChanges?: number;
  /** @deprecated Kept for backward compatibility; standard Bengali spelling is preserved. */
  latinTtsSpelling?: boolean;
  /** Exact words or phrases to replace for a specific TTS voice. */
  pronunciationMap?: Record<string, string>;
}
export function normalizeBanglaForSpeech(
  input: unknown,
  options?: BanglaSpeechOptions,
): { text: string; changes: BanglaSpeechChange[] };
export default normalizeBanglaForSpeech;
