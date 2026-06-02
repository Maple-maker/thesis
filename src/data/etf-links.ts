/** Issuer fund pages, educational links, not trade execution */
const PROSPECTUS_BY_SYMBOL: Record<string, string> = {
  VOO: "https://investor.vanguard.com/investment-products/etfs/profile/voo",
  VTI: "https://investor.vanguard.com/investment-products/etfs/profile/vti",
  QQQ: "https://www.invesco.com/us/financial-products/etfs/product-detail?productId=QQQ",
  SMH: "https://www.vaneck.com/us/en/investments/semiconductor-etf-smh/",
  SOXX: "https://www.ishares.com/us/products/239705/ishares-semiconductor-etf",
  AIQ: "https://www.globalxetfs.com/funds/aiq/",
  HACK: "https://www.etfmg.com/HACK",
  CIBR: "https://www.firsttrust.com/etf-ticker/CIBR",
  SCHD: "https://www.schwabassetmanagement.com/products/schy",
  VYM: "https://investor.vanguard.com/investment-products/etfs/profile/vym",
  JEPI: "https://www.jpmorgan.com/us/en/asset-management/adv/products/jpmorgan-equity-premium-income-etf-etf-shares-46641Q332",
  VXUS: "https://investor.vanguard.com/investment-products/etfs/profile/vxus",
  VWO: "https://investor.vanguard.com/investment-products/etfs/profile/vwo",
  VNQ: "https://investor.vanguard.com/investment-products/etfs/profile/vnq",
  ARKK: "https://www.ark-funds.com/funds/arkk/",
  BOTZ: "https://www.globalxetfs.com/funds/botz/",
};

export function prospectusUrlForEtf(symbol: string): string {
  return (
    PROSPECTUS_BY_SYMBOL[symbol] ??
    `https://www.sec.gov/edgar/search/#/q=${encodeURIComponent(symbol)}%20ETF`
  );
}
