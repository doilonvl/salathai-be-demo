import MarqueeSlide, { IMarqueeSlide } from "../models/MarqueeSlide";

export type MarqueeSlideListOpts = {
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  isActive?: boolean;
};

export const marqueeSlideRepo = {
  async create(data: Partial<IMarqueeSlide>) {
    const doc = new MarqueeSlide(data);
    return doc.save();
  },

  async update(id: string, data: Partial<IMarqueeSlide>) {
    return MarqueeSlide.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string) {
    return MarqueeSlide.findByIdAndDelete(id);
  },

  async getById(id: string) {
    return MarqueeSlide.findById(id).lean();
  },

  async existsWithOrderIndex(orderIndex: number, excludeId?: string) {
    const filter: any = { orderIndex };
    if (excludeId) filter._id = { $ne: excludeId };
    return MarqueeSlide.exists(filter);
  },

  async list(opts: MarqueeSlideListOpts = {}) {
    const {
      includeInactive = false,
      page = 1,
      limit = 20,
      isActive,
    } = opts;
    const filter: Record<string, any> = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;
    else if (!includeInactive) filter.isActive = true;

    const [items, total] = await Promise.all([
      MarqueeSlide.find(filter)
        .sort({ orderIndex: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MarqueeSlide.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
