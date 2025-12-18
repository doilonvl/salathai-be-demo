import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST!,
//   port: Number(process.env.SMTP_PORT || 465),
//   secure: String(process.env.SMTP_SECURE || "true") === "true",
//   auth: {
//     user: process.env.SMTP_USER!,
//     pass: process.env.SMTP_PASS!,
//   },
// });

// // optional: verify on boot (gợi ý)
// export async function verifyMailer() {
//   try {
//     await transporter.verify();
//     console.log("[MAILER] SMTP ready");
//   } catch (e: any) {
//     console.error("[MAILER] SMTP verify failed:", e?.message);
//   }
// }
const port = Number(process.env.SMTP_PORT ?? 587);
const secure =
  process.env.SMTP_SECURE != null
    ? process.env.SMTP_SECURE === "true"
    : port === 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port,
  secure,
  auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASS! },
  requireTLS: !secure,
  connectionTimeout: 10000,
  socketTimeout: 10000,
});
