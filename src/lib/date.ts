// วันที่/เดือน ตามเวลาไทย (Asia/Bangkok)
export function dateKeyBKK(d = new Date()): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" }); // YYYY-MM-DD
}
export function monthKeyBKK(d = new Date()): string {
  return dateKeyBKK(d).slice(0, 7); // YYYY-MM
}
export function thaiDate(d: Date | string | number): string {
  return new Date(d).toLocaleDateString("th-TH", {
    timeZone: "Asia/Bangkok", day: "numeric", month: "short", year: "2-digit",
  });
}
export function thaiDateTime(d: Date | string | number): string {
  return new Date(d).toLocaleString("th-TH", {
    timeZone: "Asia/Bangkok", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}
export const THAI_MONTHS = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
export function thaiMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}
