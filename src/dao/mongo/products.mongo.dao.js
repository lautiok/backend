import productModel from "./models/product.model.js";

export default class ProductsMongoDAO {
  static #instance;

  constructor() {}

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new ProductsMongoDAO();
    }
    return this.#instance;
  }

  async getProducts(queryParams) {
    try {
      const { limit, page, status, category, owner, sort } = queryParams;
      const filter = {};
      if (owner !== null) {
        filter.owner = owner;
      }
      if (status !== null) {
        filter.status = status;
      }
      if (category) {
        filter.category = category;
      }
      return await productModel.paginate(filter, {
        limit,
        page,
        sort,
        lean: true,
      });
    } catch (error) {
      throw error;
    }
  }

  async getProduct(filter) {
    try {
      return await productModel.findOne(filter).lean();
    } catch (error) {
      throw error;
    }
  }

  async createProduct(product) {
    try {
      return await productModel.create(product);
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      return await productModel.findByIdAndUpdate(id, product, { new: true });
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      return await productModel.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}
