import { Request, Response } from "express";
import { marqueeImageRepo } from "../repositories/marqueeImage.repo";
import { localizeDoc, localizeList } from "../i18n/localize";
import { normalizeLocale } from "../i18n/types";

function serialize(doc: any, locale?: string) {
  const plain = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const localized = localizeDoc(plain, normalizeLocale(locale), {
    fields: ["altText"],
    includeSlugI18n: false,
  });
  return {
    id: localized._id?.toString?.() ?? localized.id,
    imageUrl: localized.imageUrl,
    altText: (localized as any).altText,
    altText_i18n: (localized as any).altText_i18n,
    orderIndex: localized.orderIndex,
    isPinned: localized.isPinned,
    isActive: localized.isActive,
    createdAt: localized.createdAt,
    updatedAt: localized.updatedAt,
  };
}

function parseIsActiveQuery(value: any) {
  if (typeof value !== "string") return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

async function buildListResponse(opts: {
  locale?: string;
  includeInactive: boolean;
  isActive?: boolean;
  page: number;
  limit: number;
}) {
  const { locale, includeInactive, isActive, page, limit } = opts;
  const { items, total } = await marqueeImageRepo.list({
    includeInactive,
    isActive,
    page,
    limit,
  });

  const plainItems = items.map((d: any) =>
    d?.toObject ? d.toObject({ versionKey: false }) : d
  );

  const data = localizeList(plainItems, normalizeLocale(locale), {
    fields: ["altText"],
    includeSlugI18n: false,
  }).map((item) => ({
    id: (item as any)._id.toString(),
    imageUrl: item.imageUrl,
    altText: (item as any).altText,
    altText_i18n: (item as any).altText_i18n,
    orderIndex: item.orderIndex,
    isPinned: item.isPinned,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return { items: data, total, page, limit };
}

export const marqueeImageController = {
  list: async (req: Request, res: Response) => {
    try {
      const locale = (req.query.locale as string) || undefined;
      const includeInactive = req.query.includeInactive === "true";
      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;

      const result = await buildListResponse({
        locale,
        includeInactive,
        page,
        limit,
      });

      return res.json(result);
    } catch (err) {
      console.error("marqueeImage.list error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  adminList: async (req: Request, res: Response) => {
    try {
      const locale = (req.query.locale as string) || undefined;
      const isActive = parseIsActiveQuery(req.query.isActive);
      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 20;

      const result = await buildListResponse({
        locale,
        includeInactive: true,
        isActive,
        page,
        limit,
      });

      return res.json(result);
    } catch (err) {
      console.error("marqueeImage.adminList error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const locale = (req.query.locale as string) || undefined;
      const doc = await marqueeImageRepo.getById(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, locale));
    } catch (err) {
      console.error("marqueeImage.getById error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { imageUrl, altText_i18n, orderIndex, isActive, isPinned } =
        req.body || {};
      if (!imageUrl || orderIndex === undefined) {
        return res
          .status(400)
          .json({ message: "imageUrl and orderIndex are required" });
      }

      if (await marqueeImageRepo.existsWithOrderIndex(orderIndex)) {
        return res
          .status(400)
          .json({ message: "orderIndex already exists, choose another" });
      }

      if (isPinned && (await marqueeImageRepo.existsPinned())) {
        return res
          .status(400)
          .json({ message: "There is already a pinned image" });
      }

      const doc = await marqueeImageRepo.create({
        imageUrl,
        altText_i18n,
        orderIndex,
        isActive,
        isPinned: Boolean(isPinned),
      });
      return res.status(201).json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("marqueeImage.create error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { imageUrl, altText_i18n, orderIndex, isActive, isPinned } =
        req.body || {};

      if (
        orderIndex !== undefined &&
        (await marqueeImageRepo.existsWithOrderIndex(orderIndex, id))
      ) {
        return res
          .status(400)
          .json({ message: "orderIndex already exists, choose another" });
      }

      if (isPinned === true && (await marqueeImageRepo.existsPinned(id))) {
        return res
          .status(400)
          .json({ message: "There is already a pinned image" });
      }

      const doc = await marqueeImageRepo.update(id, {
        imageUrl,
        altText_i18n,
        orderIndex,
        isActive,
        isPinned,
      });
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("marqueeImage.update error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await marqueeImageRepo.delete(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("marqueeImage.delete error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
