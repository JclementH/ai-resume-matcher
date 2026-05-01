export function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    // Extract JSON block
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
    return null;
  }
}