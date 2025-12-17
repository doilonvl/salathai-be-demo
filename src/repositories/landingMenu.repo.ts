import LandingMenuImage, {
  ILandingMenuImage,
} from "../models/LandingMenuImage";

export type LandingMenuListOpts = {
  includeInactive?: boolean;
  page?: number;
  limit?: number;
  isActive?: boolean;
};

export const landingMenuRepo = {
  async create(data: Partial<ILandingMenuImage>) {
    const doc = new LandingMenuImage(data);
    return doc.save();
  },

  async existsWithOrderIndex(orderIndex: number, excludeId?: string) {
    const filter: any = { orderIndex };
    if (excludeId) filter._id = { $ne: excludeId };
    return LandingMenuImage.exists(filter);
  },

  async update(id: string, data: Partial<ILandingMenuImage>) {
    return LandingMenuImage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string) {
    return LandingMenuImage.findByIdAndDelete(id);
  },

  async getById(id: string) {
    return LandingMenuImage.findById(id).lean();
  },

  async list(opts: LandingMenuListOpts = {}) {
    const { includeInactive = false, page = 1, limit = 20, isActive } = opts;
    const filter: Record<string, any> = {};
    if (typeof isActive === "boolean") filter.isActive = isActive;
    else if (!includeInactive) filter.isActive = true;

    const [items, total] = await Promise.all([
      LandingMenuImage.find(filter)
        .sort({ orderIndex: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      LandingMenuImage.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
