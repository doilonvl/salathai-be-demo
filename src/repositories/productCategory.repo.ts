import ProductCategory, { IProductCategory } from "../models/ProductCategory";

export type ProductCategoryListOpts = {
  page?: number;
  limit?: number;
};

export const productCategoryRepo = {
  async create(data: Partial<IProductCategory>) {
    const doc = new ProductCategory(data);
    return doc.save();
  },

  async update(id: string, data: Partial<IProductCategory>) {
    return ProductCategory.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  },

  async delete(id: string) {
    return ProductCategory.findByIdAndDelete(id);
  },

  async getById(id: string) {
    return ProductCategory.findById(id).lean();
  },

  async getByKey(key: string) {
    return ProductCategory.findOne({ key: key.toLowerCase() }).lean();
  },

  async list(opts: ProductCategoryListOpts = {}) {
    const { page = 1, limit = 20 } = opts;

    const [items, total] = await Promise.all([
      ProductCategory.find()
        .sort({ sortOrder: 1, createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ProductCategory.countDocuments(),
    ]);

    return { items, total, page, limit };
  },
};
