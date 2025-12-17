import mongoose, { Document, Schema, Model } from "mongoose";
import { LocalizedStringSchema } from "./Common";
import type { LocalizedString } from "../i18n/types";

export interface IMarqueeSlide extends Document {
  orderIndex: number;
  tag_i18n?: LocalizedString;
  text_i18n?: LocalizedString;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarqueeSlideSchema = new Schema<IMarqueeSlide>(
  {
    orderIndex: { type: Number, required: true, min: 0 },
    tag_i18n: { type: LocalizedStringSchema, default: undefined },
    text_i18n: { type: LocalizedStringSchema, default: undefined },
    imageUrl: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MarqueeSlideSchema.index({ orderIndex: 1 });
MarqueeSlideSchema.index({ isActive: 1 });
MarqueeSlideSchema.index({
  "tag_i18n.vi": "text",
  "tag_i18n.en": "text",
  "text_i18n.vi": "text",
  "text_i18n.en": "text",
});
MarqueeSlideSchema.index(
  { orderIndex: 1 },
  { unique: true, name: "unique_marquee_slide_order_index" }
);

const MarqueeSlideModel: Model<IMarqueeSlide> =
  (mongoose.models.MarqueeSlide as Model<IMarqueeSlide>) ||
  mongoose.model<IMarqueeSlide>("MarqueeSlide", MarqueeSlideSchema);

export default MarqueeSlideModel;
