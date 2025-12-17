import { Request, Response } from "express";
import { productRepo } from "../repositories/product.repo";
import { productCategoryRepo } from "../repositories/productCategory.repo";
import { localizeDoc, localizeList } from "../i18n/localize";
import { normalizeLocale } from "../i18n/types";
import { IProductVariant } from "../models/Product";

function localizeVariant(
  variant: IProductVariant & { _id?: any },
  locale: "vi" | "en"
) {
  const out: any = { ...variant };
  out.label =
    variant.label_i18n?.[locale] ??
    variant.label_i18n?.vi ??
    variant.label_i18n?.en ??
    "";
  out.note =
    variant.note_i18n?.[locale] ??
    variant.note_i18n?.vi ??
    variant.note_i18n?.en ??
    "";
  if (variant._id) out.id = variant._id.toString();
  return out;
}

function serialize(doc: any, locale?: string) {
  const loc = normalizeLocale(locale);
  const plain = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const localized = localizeDoc(plain, loc, {
    fields: ["name", "description", "imageAlt"],
    includeSlugI18n: false,
  });

  const variants = Array.isArray(localized.variants)
    ? localized.variants.map((v: any) => localizeVariant(v, loc))
    : [];

  return {
    id: localized._id?.toString?.() ?? localized.id,
    categoryId: localized.categoryId?.toString?.(),
    slug: localized.slug,
    name: (localized as any).name,
    name_i18n: (localized as any).name_i18n,
    description: (localized as any).description,
    description_i18n: (localized as any).description_i18n,
    imageUrl: localized.imageUrl,
    imageAlt: (localized as any).imageAlt,
    imageAlt_i18n: (localized as any).imageAlt_i18n,
    sortOrder: localized.sortOrder,
    isAvailable: localized.isAvailable,
    variants,
    isFavourite: localized.isFavourite,
    isMustTry: localized.isMustTry,
    isVegetarian: localized.isVegetarian,
    spicinessLevel: localized.spicinessLevel,
    tags: localized.tags,
    createdAt: localized.createdAt,
    updatedAt: localized.updatedAt,
  };
}

export const productController = {
  list: async (req: Request, res: Response) => {
    try {
      const locale = (req.query.locale as string) || undefined;
      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;
      const categoryId = (req.query.categoryId as string) || undefined;
      const isAvailable =
        typeof req.query.isAvailable === "string"
          ? req.query.isAvailable === "true"
          : undefined;
      const q = (req.query.q as string) || undefined;

      const { items, total } = await productRepo.list({
        page,
        limit,
        categoryId,
        isAvailable,
        q,
      });

      const plainItems = items.map((d: any) =>
        d?.toObject ? d.toObject({ versionKey: false }) : d
      );

      const data = localizeList(
        plainItems,
        normalizeLocale(locale),
        { fields: ["name", "description", "imageAlt"], includeSlugI18n: false }
      ).map((item) => serialize(item, locale));

      return res.json({ items: data, total, page, limit });
    } catch (err) {
      console.error("product.list error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const locale = (req.query.locale as string) || undefined;
      const doc = await productRepo.getById(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, locale));
    } catch (err) {
      console.error("product.getById error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const {
        categoryId,
        slug,
        name_i18n,
        description_i18n,
        imageUrl,
        imageAlt_i18n,
        sortOrder,
        isAvailable,
        variants,
        isFavourite,
        isMustTry,
        isVegetarian,
        spicinessLevel,
        tags,
      } = req.body || {};

      if (!name_i18n || sortOrder === undefined) {
        return res
          .status(400)
          .json({ message: "name_i18n and sortOrder are required" });
      }

      if (!Array.isArray(variants) || variants.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one variant is required" });
      }

      if (categoryId) {
        const cat = await productCategoryRepo.getById(categoryId);
        if (!cat) {
          return res.status(400).json({ message: "Invalid categoryId" });
        }
      }

      const doc = await productRepo.create({
        categoryId,
        slug,
        name_i18n,
        description_i18n,
        imageUrl,
        imageAlt_i18n,
        sortOrder,
        isAvailable,
        variants,
        isFavourite,
        isMustTry,
        isVegetarian,
        spicinessLevel,
        tags,
      });
      return res.status(201).json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("product.create error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        categoryId,
        slug,
        name_i18n,
        description_i18n,
        imageUrl,
        imageAlt_i18n,
        sortOrder,
        isAvailable,
        variants,
        isFavourite,
        isMustTry,
        isVegetarian,
        spicinessLevel,
        tags,
      } = req.body || {};

      if (categoryId) {
        const cat = await productCategoryRepo.getById(categoryId);
        if (!cat) {
          return res.status(400).json({ message: "Invalid categoryId" });
        }
      }

      if (variants && (!Array.isArray(variants) || variants.length === 0)) {
        return res
          .status(400)
          .json({ message: "At least one variant is required" });
      }

      const doc = await productRepo.update(id, {
        categoryId,
        slug,
        name_i18n,
        description_i18n,
        imageUrl,
        imageAlt_i18n,
        sortOrder,
        isAvailable,
        variants,
        isFavourite,
        isMustTry,
        isVegetarian,
        spicinessLevel,
        tags,
      });
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("product.update error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await productRepo.delete(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("product.delete error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
