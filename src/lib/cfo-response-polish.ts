/** Light cleanup so model output reads human in chat (labels stripped if model ignores prompt). */
export function polishCfoResponse(text: string): string {
  let t = text.trim();
  const labelStrip = [
    /\*\*Takeaway:\*\*\s*/gi,
    /\*\*Your situation:\*\*\s*/gi,
    /\*\*Your holdings \(linked\):\*\*\s*/gi,
    /\*\*What it means for you:\*\*\s*/gi,
    /\*\*Tradeoff[^*]*:\*\*\s*/gi,
    /\*\*Next step:\*\*\s*/gi,
    /\*\*In Thesis:\*\*\s*/gi,
    /\*\*Checklist[^*]*:\*\*\s*/gi,
  ];
  for (const re of labelStrip) t = t.replace(re, "");
  return t.replace(/\n{3,}/g, "\n\n").trim();
}
