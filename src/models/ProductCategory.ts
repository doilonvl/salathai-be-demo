import mongoose, { Document, Schema, Model } from "mongoose";
import { LocalizedStringSchema } from "./Common";

export interface IProductCategory extends Document {
  key: string;
  name_i18n: { vi?: string; en?: string };
  description_i18n?: { vi?: string; en?: string };
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductCategorySchema = new Schema<IProductCategory>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },
    name_i18n: {
      type: LocalizedStringSchema,
      required: true,
    },
    description_i18n: {
      type: LocalizedStringSchema,
      default: undefined,
    },
    sortOrder: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

ProductCategorySchema.index({ sortOrder: 1 });
ProductCategorySchema.index({
  "name_i18n.vi": "text",
  "name_i18n.en": "text",
  "description_i18n.vi": "text",
  "description_i18n.en": "text",
});

const ProductCategoryModel: Model<IProductCategory> =
  (mongoose.models.ProductCategory as Model<IProductCategory>) ||
  mongoose.model<IProductCategory>("ProductCategory", ProductCategorySchema);

export default ProductCategoryModel;
