import mongoose, { Document, Schema, Model } from "mongoose";

export type ReservationStatus = "new" | "emailed" | "confirmed" | "cancelled";

export interface IReservationRequest extends Document {
  fullName: string;
  phoneNumber: string;
  email?: string;
  guestCount: number;
  reservationDate: Date;
  reservationTime: string;
  note?: string;
  source: "website" | "phone" | "walk_in" | "other";
  status: ReservationStatus;
  emailedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationRequestSchema = new Schema<IReservationRequest>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 160 },
    phoneNumber: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, trim: true, lowercase: true, maxlength: 160 },
    guestCount: { type: Number, required: true, min: 1, max: 100 },
    reservationDate: { type: Date, required: true },
    reservationTime: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    note: { type: String, trim: true, maxlength: 1000 },
    source: {
      type: String,
      enum: ["website", "phone", "walk_in", "other"],
      default: "website",
    },
    status: {
      type: String,
      enum: ["new", "emailed", "confirmed", "cancelled"],
      default: "new",
    },
    emailedAt: { type: Date },
  },
  { timestamps: true }
);

ReservationRequestSchema.index({ reservationDate: 1 });
ReservationRequestSchema.index({ status: 1 });
ReservationRequestSchema.index({ createdAt: -1 });

const ReservationRequestModel: Model<IReservationRequest> =
  (mongoose.models.ReservationRequest as Model<IReservationRequest>) ||
  mongoose.model<IReservationRequest>(
    "ReservationRequest",
    ReservationRequestSchema
  );

export default ReservationRequestModel;
