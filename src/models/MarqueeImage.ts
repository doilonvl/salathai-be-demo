import mongoose, { Document, Schema, Model } from "mongoose";
import { LocalizedStringSchema } from "./Common";
import type { LocalizedString } from "../i18n/types";

export interface IMarqueeImage extends Document {
  imageUrl: string;
  altText_i18n?: LocalizedString;
  orderIndex: number;
  isPinned: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeImageSchema = new Schema<IMarqueeImage>(
  {
    imageUrl: { type: String, required: true, trim: true },
    altText_i18n: { type: LocalizedStringSchema, default: undefined },
    orderIndex: { type: Number, required: true, min: 0 },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MarqueeImageSchema.index({ orderIndex: 1 });
MarqueeImageSchema.index(
  { isPinned: 1 },
  { unique: true, partialFilterExpression: { isPinned: true } }
);
MarqueeImageSchema.index({ isActive: 1 });
MarqueeImageSchema.index({
  "altText_i18n.vi": "text",
  "altText_i18n.en": "text",
});

const MarqueeImageModel: Model<IMarqueeImage> =
  (mongoose.models.MarqueeImage as Model<IMarqueeImage>) ||
  mongoose.model<IMarqueeImage>("MarqueeImage", MarqueeImageSchema);

export default MarqueeImageModel;
