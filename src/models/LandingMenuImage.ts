import mongoose, { Document, Schema, Model } from "mongoose";
import { LocalizedStringSchema } from "./Common";
import type { LocalizedString } from "../i18n/types";

export interface ILandingMenuImage extends Document {
  imageUrl: string;
  altText_i18n?: LocalizedString;
  orderIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LandingMenuImageSchema = new Schema<ILandingMenuImage>(
  {
    imageUrl: { type: String, required: true, trim: true },
    altText_i18n: { type: LocalizedStringSchema, default: undefined },
    orderIndex: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LandingMenuImageSchema.index({ isActive: 1 });
LandingMenuImageSchema.index({
  "altText_i18n.vi": "text",
  "altText_i18n.en": "text",
});
LandingMenuImageSchema.index(
  { orderIndex: 1 },
  { unique: true, name: "unique_order_index" }
);

const LandingMenuImageModel: Model<ILandingMenuImage> =
  (mongoose.models.LandingMenuImage as Model<ILandingMenuImage>) ||
  mongoose.model<ILandingMenuImage>("LandingMenuImage", LandingMenuImageSchema);

export default LandingMenuImageModel;
