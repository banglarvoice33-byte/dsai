import { createWorker } from 'tesseract.js';

export type BrowserOcrLang = 'ben' | 'ben+eng' | 'eng';

export async function runBrowserOcr(
  image: File | Blob,
  lang: BrowserOcrLang = 'ben',
  onProgress?: (percent: number) => void,
): Promise<{ text: string; confidence: number }> {
  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(image);
    return {
      text: data.text.trim(),
      confidence: Math.round(data.confidence),
    };
  } finally {
    await worker.terminate();
  }
}
