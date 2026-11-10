/**
 * Rough reading time for mixed Chinese/English prose.
 * Chinese is counted per character (~400/min), the rest per word (~220/min).
 */
export function getReadingTime(body: string | undefined): number {
  if (!body) return 1;

  const cjkChars = body.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latinWords = body
    .replace(/[\u4e00-\u9fff]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;

  const minutes = cjkChars / 400 + latinWords / 220;
  return Math.max(1, Math.round(minutes));
}
