import mongoose, {
  Document,
  Schema,
  Model,
  Types,
  CallbackWithoutResultAndOptionalError,
} from "mongoose";
import { LocalizedString, DEFAULT_LOCALE } from "../i18n/types";
import { LocalizedStringSchema } from "./Common";

export interface IProductVariant {
  variantId: string;
  label_i18n?: LocalizedString;
  price: number;
  currency: string;
  note_i18n?: LocalizedString;
  isDefault?: boolean;
}

export interface IProduct extends Document {
  categoryId?: Types.ObjectId;
  slug: string;
  name_i18n: LocalizedString;
  description_i18n?: LocalizedString;
  imageUrl?: string;
  imageAlt_i18n?: LocalizedString;
  sortOrder: number;
  isAvailable: boolean;

  variants: IProductVariant[];

  isFavourite: boolean;
  isMustTry: boolean;
  isVegetarian: boolean;
  spicinessLevel?: number; // 0-3
  tags?: string[];

  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    variantId: { type: String, required: true, trim: true, maxlength: 120 },
    label_i18n: { type: LocalizedStringSchema, default: undefined },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "VND", trim: true, maxlength: 10 },
    note_i18n: { type: LocalizedStringSchema, default: undefined },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    name_i18n: { type: LocalizedStringSchema, required: true },
    description_i18n: { type: LocalizedStringSchema, default: undefined },
    imageUrl: { type: String, trim: true },
    imageAlt_i18n: { type: LocalizedStringSchema, default: undefined },
    sortOrder: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },

    variants: { type: [ProductVariantSchema], default: [] },

    isFavourite: { type: Boolean, default: false },
    isMustTry: { type: Boolean, default: false },
    isVegetarian: { type: Boolean, default: false },
    spicinessLevel: { type: Number, min: 0, max: 3 },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const slugify = (text: string) =>
  text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function ensureUniqueSlug(doc: any) {
  const ProductModel = doc.constructor;

  const nameEn = doc.name_i18n?.en;
  const nameDefault = doc.name_i18n?.[DEFAULT_LOCALE];
  const nameVi = doc.name_i18n?.vi;

  const baseInput = doc.slug || nameEn || nameDefault || nameVi || "product";
  const base = slugify(baseInput);
  let candidate = base || "product";
  let i = 2;

  while (
    await ProductModel.exists({
      slug: candidate,
      _id: { $ne: doc._id },
    })
  ) {
    candidate = `${base}-${i++}`;
  }

  doc.slug = candidate;
}

ProductSchema.pre("validate", function (
  this: IProduct,
  next: CallbackWithoutResultAndOptionalError
) {
  const doc: any = this;

  if (!doc.slug) {
    const nameEn = doc.name_i18n?.en;
    const nameDefault = doc.name_i18n?.[DEFAULT_LOCALE];
    const nameVi = doc.name_i18n?.vi;
    const baseInput = nameEn || nameDefault || nameVi || "product";
    doc.slug = slugify(baseInput);
  } else {
    doc.slug = slugify(doc.slug);
  }

  next();
} as any);

ProductSchema.pre("save", async function (
  this: IProduct,
  next: CallbackWithoutResultAndOptionalError
) {
  try {
    const doc: any = this;
    if (doc.isNew || doc.isModified("slug")) {
      await ensureUniqueSlug(doc);
    }
    next();
  } catch (err) {
    next(err as any);
  }
} as any);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1, sortOrder: 1 });
ProductSchema.index({ isAvailable: 1, categoryId: 1, sortOrder: 1 });
ProductSchema.index({
  "name_i18n.vi": "text",
  "name_i18n.en": "text",
  "description_i18n.vi": "text",
  "description_i18n.en": "text",
  "imageAlt_i18n.vi": "text",
  "imageAlt_i18n.en": "text",
  tags: "text",
});

const ProductModel: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
