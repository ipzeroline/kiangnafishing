import SiteChrome from "./SiteChrome";
import { Locale, siteContact } from "@/lib/site";

const privacy = {
  th: {
    title: "นโยบายความเป็นส่วนตัว",
    intro: "เคียงนา Fishing Lake ให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของลูกค้า โดยรายการสำคัญของลูกค้าดำเนินผ่าน LINE และระบบภายในที่จำกัดสิทธิ์การเข้าถึงตามบทบาท",
    sections: [
      ["ข้อมูลที่อาจเก็บ", "ชื่อบัญชี LINE, LINE user ID, รูปโปรไฟล์ LINE, ประวัติ QR เข้าบ่อ, รายการเครดิต/แต้ม, รายการคูปอง, ผลงานปลา และข้อมูลติดต่อที่ลูกค้าแจ้งกับเจ้าหน้าที่"],
      ["วัตถุประสงค์การใช้ข้อมูล", "ใช้เพื่อยืนยันตัวตนผ่าน LINE, ให้บริการเข้าบ่อ, ตรวจสอบเครดิตและแต้ม, จัดอันดับ, ยืนยันคูปอง/รางวัล, ป้องกันการทุจริต และปรับปรุงการให้บริการ"],
      ["การเข้าถึงข้อมูล", "ข้อมูลสำคัญเข้าถึงได้เฉพาะเจ้าหน้าที่ที่ได้รับสิทธิ์ในระบบหลังบ้าน และมีการบันทึกประวัติรายการเพื่อรองรับการตรวจสอบ"],
      ["การเก็บรักษาและความปลอดภัย", "ระบบใช้การยืนยันตัวตนผ่าน LINE และการแยกสิทธิ์ผู้ใช้งานหลังบ้าน ข้อมูลจะถูกเก็บเท่าที่จำเป็นต่อการให้บริการและการตรวจสอบ"],
      ["ช่องทางติดต่อ", `หากต้องการสอบถาม แก้ไข หรือขอลบข้อมูล กรุณาติดต่อ LINE ${siteContact.lineId} โทร ${siteContact.phone} หรืออีเมล ${siteContact.email}`],
    ],
  },
  en: {
    title: "Privacy Policy",
    intro: "Kiangna Fishing Lake protects customer information by handling customer transactions through the LINE account and role-based internal access.",
    sections: [
      ["Information we may collect", "LINE display name, LINE user ID, LINE profile image, entry QR history, credit/point records, coupons, catch submissions, and contact details shared with admin."],
      ["How we use information", "To verify LINE identity, provide entry service, manage credits and points, run rankings, validate coupons and rewards, prevent fraud, and improve operations."],
      ["Data access", "Important data is accessible only by authorized backend staff, with activity records kept for audit purposes."],
      ["Retention and security", "The system uses LINE identity verification and role-based staff access. Information is retained only as needed for service and audit."],
      ["Contact", `For questions, corrections, or deletion requests, contact the LINE account ${siteContact.lineId}, phone ${siteContact.phone}, or email ${siteContact.email}.`],
    ],
  },
} as const;

const terms = {
  th: {
    title: "ข้อกำหนดและเงื่อนไข",
    intro: "การใช้บริการเคียงนา Fishing Lake ถือว่าลูกค้ายอมรับข้อกำหนดการทำรายการผ่าน LINE และการตรวจสอบรายการตามขั้นตอน",
    sections: [
      ["การทำรายการ", "ลูกค้าต้องดำเนินรายการสำคัญผ่าน LINE เช่น QR เข้าบ่อ เติมเครดิต ส่งผลงานปลา ดูอันดับ คูปอง และติดต่อเจ้าหน้าที่"],
      ["เครดิตและแต้ม", "เครดิต แต้ม และรายการเติมเงินจะสมบูรณ์เมื่อได้รับการตรวจสอบจากเจ้าหน้าที่ รายการที่ผิดปกติอาจถูกระงับชั่วคราวเพื่อตรวจสอบ"],
      ["การส่งผลงานปลาและอันดับ", "ผลงานปลาต้องเป็นข้อมูลจริงและเป็นไปตามกติกาของกิจกรรม เจ้าหน้าที่มีสิทธิ์ตรวจสอบ แก้ไขสถานะ หรือปฏิเสธรายการที่ไม่ถูกต้อง"],
      ["คูปองและรางวัล", "คูปองมีเงื่อนไขตามที่กำหนดในแต่ละกิจกรรม ไม่สามารถแลกเป็นเงินสดได้ เว้นแต่มีประกาศเป็นลายลักษณ์อักษร"],
      ["ความปลอดภัยและการป้องกันทุจริต", "ห้ามสวมสิทธิ์ ปลอมแปลง QR ใช้บัญชีผู้อื่น หรือแก้ไขหลักฐาน หากพบความผิดปกติระบบสามารถระงับรายการและสิทธิ์การใช้งานได้"],
      ["การเปลี่ยนแปลงเงื่อนไข", "เคียงนา Fishing Lake อาจปรับปรุงเงื่อนไขตามความเหมาะสม โดยยึดข้อมูลและประกาศล่าสุดเป็นสำคัญ"],
    ],
  },
  en: {
    title: "Terms and Conditions",
    intro: "Using Kiangna Fishing Lake services means accepting the lake LINE transaction rules and verification process.",
    sections: [
      ["Transactions", "Important customer actions are handled through the LINE account, including entry QR, top-ups, catch submissions, ranking, coupons, and admin contact."],
      ["Credits and points", "Credits, points, and top-ups are completed after staff verification. Suspicious records may be held for review."],
      ["Catch submissions and ranking", "Catch records must be accurate and follow event rules. Staff may verify, update status, or reject invalid submissions."],
      ["Coupons and rewards", "Coupons follow each campaign’s conditions and cannot be exchanged for cash unless explicitly announced."],
      ["Security and fraud prevention", "Impersonation, QR forgery, account misuse, and evidence manipulation are prohibited. Suspicious activity may be suspended."],
      ["Changes", "Kiangna Fishing Lake may update these terms when appropriate. The latest published version applies."],
    ],
  },
} as const;

export function PolicyPage({ locale, type }: { locale: Locale; type: "privacy" | "terms" }) {
  const data = type === "privacy" ? privacy[locale] : terms[locale];
  const eyebrow = type === "privacy"
    ? locale === "th" ? "ความเป็นส่วนตัว" : "Privacy"
    : locale === "th" ? "ข้อกำหนด" : "Terms";
  return (
    <SiteChrome locale={locale} page={type}>
      <main className="site-content-page legal-page">
        <header className="site-page-head">
          <p className="site-eyebrow">{eyebrow}</p>
          <h1>{data.title}</h1>
          <p>{data.intro}</p>
        </header>
        <section className="legal-list">
          {data.sections.map(([title, detail]) => (
            <article key={title}>
              <h2>{title}</h2>
              <p>{detail}</p>
            </article>
          ))}
        </section>
      </main>
    </SiteChrome>
  );
}
