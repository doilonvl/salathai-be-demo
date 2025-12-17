import { transporter } from "../config/mailer";

function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendReservationEmail(payload: {
  fullName: string;
  phoneNumber: string;
  email?: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  note?: string;
  source?: string;
}) {
  const subject = `[Salathai] New reservation from ${payload.fullName}`;
  const fromName = process.env.MAIL_FROM_NAME || "Salathai Website";
  const fromAddr = process.env.MAIL_FROM_ADDR || process.env.SMTP_USER!;
  const toAdmin = process.env.MAIL_TO_ADDR || process.env.SMTP_USER!;

  const primary = "#0f766e";
  const textColor = "#0f172a";
  const muted = "#475569";
  const border = "#e2e8f0";
  const bg = "#f8fafc";

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${bg};font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial,sans-serif;">
  <div style="max-width:720px;margin:24px auto;padding:0 12px;">
    <div style="background:#fff;border:1px solid ${border};border-radius:12px;overflow:hidden;box-shadow:0 12px 24px rgba(15,23,42,0.06);">
      <div style="padding:20px 24px;border-bottom:1px solid ${border};background:linear-gradient(120deg,#ecfeff,#f8fafc);">
        <div style="font-size:18px;font-weight:700;color:${primary};">Salathai — Reservation</div>
        <div style="margin-top:4px;font-size:13px;color:${muted};">New reservation request from the website</div>
      </div>

      <div style="padding:20px 24px 4px;color:${textColor};">
        <p style="margin:0 0 16px;font-size:14px;color:${muted};">Below are the submitted details. Click Reply to contact the guest.</p>

        <table cellspacing="0" cellpadding="10" style="width:100%;border-collapse:collapse;border:1px solid ${border};border-radius:10px;overflow:hidden;background:#fff;">
          <tbody>
            <tr style="background:${bg};">
              <td style="width:160px;font-weight:600;color:${textColor};">Full name</td>
              <td style="color:${textColor};">${escapeHtml(
    payload.fullName
  )}</td>
            </tr>
            <tr>
              <td style="font-weight:600;color:${textColor};">Phone</td>
              <td style="color:${textColor};">${escapeHtml(
    payload.phoneNumber
  )}</td>
            </tr>
            ${
              payload.email
                ? `<tr style="background:${bg};">
              <td style="font-weight:600;color:${textColor};">Email</td>
              <td><a href="mailto:${escapeHtml(
                payload.email
              )}" style="color:${primary};text-decoration:none;">${escapeHtml(
                    payload.email
                  )}</a></td>
            </tr>`
                : ""
            }
            <tr>
              <td style="font-weight:600;color:${textColor};">Guests</td>
              <td style="color:${textColor};">${escapeHtml(
    String(payload.guestCount)
  )}</td>
            </tr>
            <tr style="background:${bg};">
              <td style="font-weight:600;color:${textColor};">Date</td>
              <td style="color:${textColor};">${escapeHtml(
    payload.reservationDate
  )}</td>
            </tr>
            <tr>
              <td style="font-weight:600;color:${textColor};">Time</td>
              <td style="color:${textColor};">${escapeHtml(
    payload.reservationTime
  )}</td>
            </tr>
            ${
              payload.source
                ? `<tr style="background:${bg};">
              <td style="font-weight:600;color:${textColor};">Source</td>
              <td style="color:${textColor};">${escapeHtml(payload.source)}</td>
            </tr>`
                : ""
            }
          </tbody>
        </table>

        ${
          payload.note
            ? `<div style="margin-top:18px;">
            <div style="font-weight:700;font-size:14px;color:${textColor}; margin-bottom:8px;">Note / Special request</div>
            <div style="white-space:pre-wrap;background:#fff;border:1px solid ${border};padding:12px 14px;border-radius:10px;color:${textColor};">
              ${escapeHtml(payload.note)}
            </div>
          </div>`
            : ""
        }
      </div>

      <div style="padding:14px 24px;border-top:1px solid ${border};background:#f8fafc;font-size:12px;color:${muted};">
        This email was sent automatically from the Salathai website. Click Reply to respond to the guest.
      </div>
    </div>
  </div>
</body></html>`;

  const text = `${subject}

Full name: ${payload.fullName}
Phone: ${payload.phoneNumber}
${payload.email ? `Email: ${payload.email}\n` : ""}Guests: ${payload.guestCount}
Date: ${payload.reservationDate}
Time: ${payload.reservationTime}
${payload.source ? `Source: ${payload.source}\n` : ""}
${payload.note ? `Note: ${payload.note}\n` : ""}
`;

  const mailOptions = {
    from: `"${fromName}" <${fromAddr}>`,
    to: toAdmin,
    replyTo: payload.email || undefined,
    subject,
    html,
    text,
  };

  return transporter.sendMail(mailOptions);
}
