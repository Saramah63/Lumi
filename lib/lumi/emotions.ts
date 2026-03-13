export const LUMI_EMOTIONS = [
  { key: "happy", emoji: "🙂", labelFi: "Iloinen" },
  { key: "sad", emoji: "😢", labelFi: "Surullinen" },
  { key: "angry", emoji: "😠", labelFi: "Vihainen" },
  { key: "afraid", emoji: "😨", labelFi: "Pelokas" },
] as const;

export type LumiEmotionKey = (typeof LUMI_EMOTIONS)[number]["key"];

export type LumiEmotionCounts = Record<LumiEmotionKey, number>;

export function emptyEmotionCounts(): LumiEmotionCounts {
  return { happy: 0, sad: 0, angry: 0, afraid: 0 };
}

export function normalizeEmotionKey(value: string | null | undefined): LumiEmotionKey | null {
  if (!value) return null;
  if (value === "scared") return "afraid";
  return LUMI_EMOTIONS.some((emotion) => emotion.key === value) ? (value as LumiEmotionKey) : null;
}

export function sanitizeEmotionCounts(input?: Record<string, number> | null): LumiEmotionCounts {
  const counts = emptyEmotionCounts();
  if (!input) return counts;

  Object.entries(input).forEach(([rawKey, rawValue]) => {
    const key = normalizeEmotionKey(rawKey);
    if (!key) return;
    const value = Number(rawValue ?? 0);
    counts[key] += Number.isFinite(value) ? Math.max(0, value) : 0;
  });

  return counts;
}

export function dominantEmotion(counts?: Record<string, number> | null): LumiEmotionKey | null {
  const normalized = sanitizeEmotionCounts(counts);
  const entries = Object.entries(normalized).sort((a, b) => b[1] - a[1]);
  const top = entries[0];
  if (!top || top[1] === 0) return null;
  const second = entries[1];
  if (second && second[1] === top[1]) return null;
  return top[0] as LumiEmotionKey;
}

export function emotionLabelFi(key: string | null | undefined): string {
  const normalized = normalizeEmotionKey(key);
  return LUMI_EMOTIONS.find((emotion) => emotion.key === normalized)?.labelFi ?? (key ?? "—");
}

export function emotionEmoji(key: string | null | undefined): string {
  const normalized = normalizeEmotionKey(key);
  return LUMI_EMOTIONS.find((emotion) => emotion.key === normalized)?.emoji ?? "•";
}
