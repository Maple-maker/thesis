/** M1-style slice palette, distinct, accessible on light backgrounds */
export const ALLOCATION_SLICE_COLORS = [
  "#0E7A66",
  "#5B9BD5",
  "#7C3AED",
  "#D98512",
  "#D8472C",
  "#149059",
  "#8C988F",
] as const;

export function sliceColorForIndex(index: number): string {
  return ALLOCATION_SLICE_COLORS[index % ALLOCATION_SLICE_COLORS.length];
}
