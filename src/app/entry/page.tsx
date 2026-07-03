import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";

export default function EntryPage() {
  return (
    <main className="min-h-dvh bg-[#f5f8f7] pb-28">
      <TopBar title="เข้าบ่อผ่าน LINE" back />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="rounded-card bg-white p-6 shadow-sm ring-1 ring-line">
          <p className="text-xs font-semibold uppercase tracking-widest text-dim">LINE</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-deep">การเข้าบ่อดำเนินผ่านเมนูบริการเท่านั้น</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim">
            เพื่อความปลอดภัยและป้องกันการใช้งานแทนกัน ระบบจะสร้าง QR เช็คอินจากบัญชี LINE ของสมาชิกเท่านั้น
            ข้อมูลจะผูกกับ LINE ID ที่เพิ่มเพื่อนบัญชีทางการไว้
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-mist p-4">
              <p className="font-semibold text-deep">1. เปิด LINE</p>
              <p className="mt-1 text-sm text-dim">เข้าแชทบัญชี LINE</p>
            </div>
            <div className="rounded-lg bg-mist p-4">
              <p className="font-semibold text-deep">2. กด “เข้าบ่อ”</p>
              <p className="mt-1 text-sm text-dim">จากเมนูบริการช่องซ้ายบน</p>
            </div>
            <div className="rounded-lg bg-mist p-4">
              <p className="font-semibold text-deep">3. ให้เจ้าหน้าที่สแกน</p>
              <p className="mt-1 text-sm text-dim">ระบบบันทึกการเข้าใช้บริการโดยอัตโนมัติ</p>
            </div>
          </div>
        </section>

        <aside className="rounded-card bg-deep p-6 text-white shadow-sm">
          <p className="text-sm text-white/60">เมนู LINE</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">เมนูบริการหลัก</h2>
          <div className="mt-5 space-y-3 text-sm text-white/75">
            <p className="rounded-lg bg-white/10 p-3">เข้าบ่อ</p>
            <p className="rounded-lg bg-white/10 p-3">กระเป๋าเงิน</p>
            <p className="rounded-lg bg-white/10 p-3">ส่งผลงานปลา</p>
            <p className="rounded-lg bg-white/10 p-3">อันดับ / ตารางลงปลา / ติดต่อเจ้าหน้าที่</p>
          </div>
        </aside>
      </div>
      <BottomNav />
    </main>
  );
}
