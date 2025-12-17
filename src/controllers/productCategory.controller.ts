import { Request, Response } from "express";
import { productCategoryRepo } from "../repositories/productCategory.repo";
import { localizeDoc, localizeList } from "../i18n/localize";
import { normalizeLocale } from "../i18n/types";

function serialize(doc: any, locale?: string) {
  const plain = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const localized = localizeDoc(plain, normalizeLocale(locale), {
    fields: ["name", "description"],
    includeSlugI18n: false,
  });

  return {
    id: localized._id?.toString?.() ?? localized.id,
    key: localized.key,
    name: (localized as any).name,
    name_i18n: (localized as any).name_i18n,
    description: (localized as any).description,
    description_i18n: (localized as any).description_i18n,
    sortOrder: localized.sortOrder,
    createdAt: localized.createdAt,
    updatedAt: localized.updatedAt,
  };
}

export const productCategoryController = {
  list: async (req: Request, res: Response) => {
    try {
      const locale = (req.query.locale as string) || undefined;
      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;

      const { items, total } = await productCategoryRepo.list({
        page,
        limit,
      });

      const plainItems = items.map((d: any) =>
        d?.toObject ? d.toObject({ versionKey: false }) : d
      );

      const data = localizeList(
        plainItems,
        normalizeLocale(locale),
        { fields: ["name", "description"], includeSlugI18n: false }
      ).map((item) => ({
        id: (item as any)._id.toString(),
        key: item.key,
        name: (item as any).name,
        name_i18n: (item as any).name_i18n,
        description: (item as any).description,
        description_i18n: (item as any).description_i18n,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      return res.json({ items: data, total, page, limit });
    } catch (err) {
      console.error("productCategory.list error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const locale = (req.query.locale as string) || undefined;
      const doc = await productCategoryRepo.getById(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, locale));
    } catch (err) {
      console.error("productCategory.getById error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { key, name_i18n, description_i18n, sortOrder } = req.body || {};
      if (!key || !name_i18n || sortOrder === undefined) {
        return res.status(400).json({
          message: "key, name_i18n and sortOrder are required",
        });
      }

      const existing = await productCategoryRepo.getByKey(key);
      if (existing) {
        return res.status(400).json({ message: "key already exists" });
      }

      const doc = await productCategoryRepo.create({
        key,
        name_i18n,
        description_i18n,
        sortOrder,
      });
      return res.status(201).json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("productCategory.create error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { key, name_i18n, description_i18n, sortOrder } = req.body || {};

      if (key) {
        const existing = await productCategoryRepo.getByKey(key);
        if (existing && existing._id.toString() !== id) {
          return res.status(400).json({ message: "key already exists" });
        }
      }

      const doc = await productCategoryRepo.update(id, {
        key,
        name_i18n,
        description_i18n,
        sortOrder,
      });
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("productCategory.update error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await productCategoryRepo.delete(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("productCategory.delete error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
