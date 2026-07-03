export const ENTRY_FEE = 100;

// แพ็กเกจเติมเงิน: จ่ายเท่าไร ได้เท่าไร (โบนัสจูงใจให้เติมก้อนใหญ่)
export const TOPUP_PACKAGES: { pay: number; get: number; tag?: string }[] = [
  { pay: 300, get: 300 },
  { pay: 500, get: 520 },
  { pay: 1000, get: 1100, tag: "ยอดนิยม" },
  { pay: 2000, get: 2300, tag: "คุ้มสุด" },
];

export function getAmountFor(pay: number): number {
  const pkg = TOPUP_PACKAGES.find((p) => p.pay === pay);
  return pkg ? pkg.get : pay;
}
