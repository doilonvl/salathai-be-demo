import { Request, Response } from "express";
import { reservationRequestRepo } from "../repositories/reservationRequest.repo";
import { sendReservationEmail } from "../services/sendReservationEmail";

const HONEYPOT_FIELD = "website"; // simple bot trap

export const reservationRequestController = {
  async create(req: Request, res: Response) {
    try {
      if (
        req.body &&
        typeof req.body[HONEYPOT_FIELD] === "string" &&
        req.body[HONEYPOT_FIELD].trim() !== ""
      ) {
        return res.status(202).json({ message: "Accepted" });
      }

      const {
        fullName,
        phoneNumber,
        email,
        guestCount,
        reservationDate,
        reservationTime,
        note,
        source,
      } = req.body || {};

      if (
        !fullName ||
        !phoneNumber ||
        !guestCount ||
        !reservationDate ||
        !reservationTime
      ) {
        return res.status(400).json({
          message:
            "fullName, phoneNumber, guestCount, reservationDate, reservationTime are required",
        });
      }

      const doc = await reservationRequestRepo.create({
        fullName,
        phoneNumber,
        email,
        guestCount,
        reservationDate,
        reservationTime,
        note,
        source: source || "website",
      });

      const enforce =
        String(process.env.ENFORCE_MAIL_DELIVERY || "false") === "true";

      const sendMail = () =>
        sendReservationEmail({
          fullName: doc.fullName,
          phoneNumber: doc.phoneNumber,
          email: doc.email,
          guestCount: doc.guestCount,
          reservationDate: doc.reservationDate.toISOString().slice(0, 10),
          reservationTime: doc.reservationTime,
          note: doc.note,
          source: doc.source,
        });

      if (enforce) {
        await sendMail();
        doc.status = "emailed";
        doc.emailedAt = new Date();
        await doc.save();
      } else {
        sendMail().then(
          async () => {
            doc.status = "emailed";
            doc.emailedAt = new Date();
            await doc.save();
          },
          (e) => console.error("[MAIL] Reservation send failed:", e?.message)
        );
      }

      return res.status(201).json({
        message: "Submitted",
        id: doc._id.toString(),
        status: doc.status,
      });
    } catch (err: any) {
      console.error("reservation.create error", err);
      return res.status(400).json({ message: err?.message || "Bad Request" });
    }
  },

  async list(req: Request, res: Response) {
    const { page, limit, q, status, dateFrom, dateTo } = req.query as any;
    const result = await reservationRequestRepo.list({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      q: q ? String(q) : undefined,
      status: status ? (String(status) as any) : undefined,
      dateFrom: dateFrom ? String(dateFrom) : undefined,
      dateTo: dateTo ? String(dateTo) : undefined,
    });
    res.json(result);
  },

  async getOne(req: Request, res: Response) {
    const doc = await reservationRequestRepo.getById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  },

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: "status is required" });

    const doc = await reservationRequestRepo.update(id, { status });
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  },
};
