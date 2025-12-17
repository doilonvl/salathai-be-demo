import Product, { IProduct } from "../models/Product";
import { Types } from "mongoose";

export type ProductListOpts = {
  page?: number;
  limit?: number;
  categoryId?: string;
  isAvailable?: boolean;
  q?: string;
};

export const productRepo = {
  async create(data: Partial<IProduct>) {
    const doc = new Product(data);
    return doc.save();
  },

  async update(id: string, data: Partial<IProduct>) {
    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string) {
    return Product.findByIdAndDelete(id);
  },

  async getById(id: string) {
    return Product.findById(id).lean();
  },

  async list(opts: ProductListOpts = {}) {
    const { page = 1, limit = 20, categoryId, isAvailable, q } = opts;

    const filter: Record<string, any> = {};
    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = categoryId;
    }
    if (typeof isAvailable === "boolean") {
      filter.isAvailable = isAvailable;
    }
    if (q?.trim()) {
      filter.$text = { $search: q.trim() };
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ sortOrder: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },
};
