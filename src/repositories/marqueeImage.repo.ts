import MarqueeImage, { IMarqueeImage } from "../models/MarqueeImage";

export type MarqueeImageListOpts = {
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  isActive?: boolean;
};

export const marqueeImageRepo = {
  async create(data: Partial<IMarqueeImage>) {
    const doc = new MarqueeImage(data);
    return doc.save();
  },

  async update(id: string, data: Partial<IMarqueeImage>) {
    return MarqueeImage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string) {
    return MarqueeImage.findByIdAndDelete(id);
  },

  async getById(id: string) {
    return MarqueeImage.findById(id).lean();
  },

  async existsWithOrderIndex(orderIndex: number, excludeId?: string) {
    const filter: any = { orderIndex };
    if (excludeId) filter._id = { $ne: excludeId };
    return MarqueeImage.exists(filter);
  },

  async existsPinned(excludeId?: string) {
    const filter: any = { isPinned: true };
    if (excludeId) filter._id = { $ne: excludeId };
    return MarqueeImage.exists(filter);
  },

  async list(opts: MarqueeImageListOpts = {}) {
    const { includeInactive = false, page = 1, limit = 20, isActive } = opts;
    const filter: Record<string, any> = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;
    else if (!includeInactive) filter.isActive = true;

    const [items, total] = await Promise.all([
      MarqueeImage.find(filter)
        .sort({ orderIndex: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MarqueeImage.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
