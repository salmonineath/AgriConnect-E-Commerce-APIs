import { ProductModel } from "@/models/product-model";
import { ProductPayload } from "@/types/product-type";
import { tokenPaylodExtends } from "@/types/auth-type";
import { badRequestError, forbiddenError, notFoundError } from "@/utils/helper/error-helper";
import { categoryModel } from "@/models/category-model";

const findCategoryByName = async (name: string) => {
    const category = await categoryModel.findOne({ name });
    if (!category) {
        throw notFoundError("Category not found.");
    }
    return category;
};

const assertValidPriceAndStock = (price: unknown, stock: unknown) => {
    if (price !== undefined && (typeof price !== "number" || price < 0)) {
        throw badRequestError("Price must be a number of 0 or more.");
    }
    if (stock !== undefined && (!Number.isInteger(stock) || (stock as number) < 0)) {
        throw badRequestError("Stock must be a whole number of 0 or more.");
    }
};

// Farmers may only change their own products; admins may change any.
const findOwnedProduct = async (productId: string, user: tokenPaylodExtends) => {
    const product = await ProductModel.findById(productId);
    if (!product) {
        throw notFoundError("Product not found.");
    }

    const isAdmin = user.roles.includes("ADMIN");
    if (!isAdmin && product.user_id?.toString() !== user._id) {
        throw forbiddenError("You can only manage your own products.");
    }
    return product;
};

/**
 * 
 * Create Product
 * @param dataPayload 
 * @param userId - owner of the product (from the access token)
 * @returns 
 */
export const createProductService = async (dataPayload: ProductPayload, userId: string) => {
    const { product_name, product_des, price, stock, category, status } = dataPayload;
    if (!product_name?.trim() || !product_des?.trim() || !category || price === undefined) {
        throw badRequestError("product_name, product_des, price and category are required.");
    }
    assertValidPriceAndStock(price, stock);

    const foundCategory = await findCategoryByName(category);

    const newProduct = await ProductModel.create({
        product_name,
        product_des,
        price,
        stock: stock ?? 0,
        category: foundCategory._id,
        status: status || "Available",
        user_id: userId,
    });

    return newProduct;
};

/**
 * Get all product and get product by Id
 */
export const getAllProductService = async () => {
    return ProductModel.find().populate("category", "name").lean();
};

// get product by id
export const getProductByIdService = async (productId: string) => {
    const productData = await ProductModel.findById(productId).populate("category", "name").lean();

    if (!productData) {
        throw notFoundError("Product not found.");
    };

    return productData;
};

// update product by id
export const updateProductByIdService = async (
    productId: string,
    dataPayload: Partial<ProductPayload>,
    user: tokenPaylodExtends,
) => {
    const product = await findOwnedProduct(productId, user);
    const { product_name, product_des, price, stock, category, status } = dataPayload;
    assertValidPriceAndStock(price, stock);

    // Only these fields may be changed; owner (user_id) can never be reassigned
    if (product_name !== undefined) product.product_name = product_name;
    if (product_des !== undefined) product.product_des = product_des;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (status !== undefined) product.status = status;
    if (category !== undefined) product.category = (await findCategoryByName(category))._id;

    return product.save();
};

// delete product
export const deleteProductByIdService = async (productId: string, user: tokenPaylodExtends) => {
    const product = await findOwnedProduct(productId, user);
    await product.deleteOne();
    return product;
}
