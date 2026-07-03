export default function WalletCard({ balance, points, name, memberCode }:
  { balance: number; points: number; name: string; memberCode: string }) {
  return (
    <section className="relative overflow-hidden rounded-card bg-deep text-white shadow-sm">
      <div className="relative z-10 p-6 pb-16">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">ยอดในกระเป๋า</p>
            <p className="font-display text-4xl font-semibold tracking-tight">
              ฿{balance.toLocaleString("th-TH")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/60">แต้มสะสม</p>
            <p className="font-display text-xl font-semibold text-gold">{points.toLocaleString("th-TH")} ★</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-white/80">{name} · <span className="font-mono">{memberCode}</span></p>
        {balance < 100 && (
          <p className="mt-3 inline-block rounded-md bg-buoy px-3 py-1.5 text-xs font-semibold">
            ยอดไม่พอค่าเข้าบ่อ 100 บาท
          </p>
        )}
      </div>
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-12 overflow-hidden">
        <svg className="wave slow absolute bottom-0 h-12 w-[200%]" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0,30 C150,55 300,5 450,30 C600,55 750,5 900,30 C1050,55 1150,15 1200,30 L1200,60 L0,60 Z" fill="#135a66" />
        </svg>
        <svg className="wave absolute bottom-0 h-10 w-[200%]" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d="M0,35 C150,10 300,58 450,35 C600,12 750,58 900,35 C1050,12 1150,50 1200,35 L1200,60 L0,60 Z" fill="#1d7482" opacity="0.9" />
        </svg>
      </div>
    </section>
  );
}
