import { Request, Response } from "express";
import { marqueeSlideRepo } from "../repositories/marqueeSlide.repo";
import { localizeDoc, localizeList } from "../i18n/localize";
import { normalizeLocale } from "../i18n/types";

function serialize(doc: any, locale?: string) {
  const plain = doc.toObject ? doc.toObject({ versionKey: false }) : doc;
  const localized = localizeDoc(plain, normalizeLocale(locale), {
    fields: ["tag", "text"],
    includeSlugI18n: false,
  });

  return {
    id: localized._id?.toString?.() ?? localized.id,
    tag: (localized as any).tag,
    tag_i18n: (localized as any).tag_i18n,
    text: (localized as any).text,
    text_i18n: (localized as any).text_i18n,
    imageUrl: localized.imageUrl,
    orderIndex: localized.orderIndex,
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
  const { items, total } = await marqueeSlideRepo.list({
    includeInactive,
    isActive,
    page,
    limit,
  });

  const plainItems = items.map((d: any) =>
    d?.toObject ? d.toObject({ versionKey: false }) : d
  );

  const data = localizeList(plainItems, normalizeLocale(locale), {
    fields: ["tag", "text"],
    includeSlugI18n: false,
  }).map((item) => ({
    id: (item as any)._id.toString(),
    tag: (item as any).tag,
    tag_i18n: (item as any).tag_i18n,
    text: (item as any).text,
    text_i18n: (item as any).text_i18n,
    imageUrl: item.imageUrl,
    orderIndex: item.orderIndex,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return { items: data, total, page, limit };
}

export const marqueeSlideController = {
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
      console.error("marqueeSlide.list error", err);
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
      console.error("marqueeSlide.adminList error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const locale = (req.query.locale as string) || undefined;
      const doc = await marqueeSlideRepo.getById(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, locale));
    } catch (err) {
      console.error("marqueeSlide.getById error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const { tag_i18n, text_i18n, imageUrl, orderIndex, isActive } =
        req.body || {};

      if (!imageUrl || orderIndex === undefined) {
        return res
          .status(400)
          .json({ message: "imageUrl and orderIndex are required" });
      }

      if (await marqueeSlideRepo.existsWithOrderIndex(orderIndex)) {
        return res
          .status(400)
          .json({ message: "orderIndex already exists, choose another" });
      }

      const doc = await marqueeSlideRepo.create({
        tag_i18n,
        text_i18n,
        imageUrl,
        orderIndex,
        isActive,
      });
      return res.status(201).json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("marqueeSlide.create error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { tag_i18n, text_i18n, imageUrl, orderIndex, isActive } =
        req.body || {};

      if (
        orderIndex !== undefined &&
        (await marqueeSlideRepo.existsWithOrderIndex(orderIndex, id))
      ) {
        return res
          .status(400)
          .json({ message: "orderIndex already exists, choose another" });
      }

      const doc = await marqueeSlideRepo.update(id, {
        tag_i18n,
        text_i18n,
        imageUrl,
        orderIndex,
        isActive,
      });
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json(serialize(doc, req.query.locale as string));
    } catch (err) {
      console.error("marqueeSlide.update error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const doc = await marqueeSlideRepo.delete(id);
      if (!doc) return res.status(404).json({ message: "Not found" });
      return res.json({ message: "Deleted" });
    } catch (err) {
      console.error("marqueeSlide.delete error", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
