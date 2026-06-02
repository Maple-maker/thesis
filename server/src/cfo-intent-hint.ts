/** Optional nudge, never blocks the model; hints only sharpen niche asks. */
export function cfoIntentHint(userMessage: string): string {
  const q = userMessage.toLowerCase();

  if (/dry powder|cash cushion|buy the dip|when things go down/i.test(q)) {
    return "[Cash cushion ETFs: SGOV, BIL, SHV, tie to deploying on dips vs user's holdings.]";
  }
  if (/commodit|copper|gold|iron|rare.?earth|metal|mining|bottleneck/i.test(q)) {
    return "[Commodity exposure: COPX, GLDM, PICK, SLX, REMX as relevant.]";
  }
  if (/bitcoin|btc|ethereum|eth|crypto/i.test(q)) {
    return "[Crypto: volatility, sizing vs equities, custody, use user risk/horizon.]";
  }
  if (/fed|federal reserve|interest rate|yield curve|inflation|cpi|monetary|fomc|powell|headline|treasury|bond market/i.test(q)) {
    return "[Macro/rates: use live tool data or injected macro block, cite Fed funds, 10y/2y, curve spread, headlines; connect to user holdings; never invent current levels.]";
  }
  if (/earnings|revenue|guidance|eps|margin/i.test(q)) {
    return "[Earnings literacy: what investors watch; no invented live numbers.]";
  }
  if (/defense|aerospace|military/i.test(q) && /etf|fund/i.test(q)) {
    return "[Defense ETFs: ITA, XAR, PPA with one-line roles.]";
  }
  if (/dividend|income|yield/i.test(q)) {
    return "[Income/dividends: connect to user SCHD/quality tilt if in holdings.]";
  }

  return "";
}
