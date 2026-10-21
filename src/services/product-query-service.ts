import { Types, SortOrder } from "mongoose";
import { ProductModel } from "@/models/product-model";
import { categoryModel } from "@/models/category-model";
import { badRequestError } from "@/utils/helper/error-helper";

const SORT_OPTIONS: Record<string, Record<string, SortOrder>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    name: { product_name: 1 },
};
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

type Query = Record<string, unknown>;

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const readString = (query: Query, key: string) => {
    const value = query[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const readNumber = (query: Query, key: string) => {
    const raw = readString(query, key);
    if (raw === undefined) return undefined;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
        throw badRequestError(`${key} must be a number of 0 or more`);
    }
    return value;
};

const readPositiveInt = (query: Query, key: string, fallback: number) => {
    const value = readNumber(query, key) ?? fallback;
    if (!Number.isInteger(value) || value < 1) {
        throw badRequestError(`${key} must be a whole number of 1 or more`);
    }
    return value;
};

// Category filter accepts a category id or a category name (case-insensitive)
const resolveCategoryId = async (category: string) => {
    if (Types.ObjectId.isValid(category)) return new Types.ObjectId(category);
    const found = await categoryModel.findOne({ name: { $regex: `^${escapeRegex(category)}$`, $options: "i" } });
    return found?._id ?? null;
};

const buildPriceFilter = (query: Query) => {
    const minPrice = readNumber(query, "minPrice");
    const maxPrice = readNumber(query, "maxPrice");
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        throw badRequestError("minPrice cannot be greater than maxPrice");
    }
    if (minPrice === undefined && maxPrice === undefined) return undefined;
    return { ...(minPrice !== undefined && { $gte: minPrice }), ...(maxPrice !== undefined && { $lte: maxPrice }) };
};

const buildSearchFilter = (query: Query) => {
    const search = readString(query, "search");
    if (!search) return undefined;
    const pattern = { $regex: escapeRegex(search.slice(0, MAX_SEARCH_LENGTH)), $options: "i" };
    return [{ product_name: pattern }, { product_des: pattern }];
};

const readStatus = (query: Query) => {
    const status = readString(query, "status");
    if (status && status !== "Available" && status !== "Unavailable") {
        throw badRequestError("status must be Available or Unavailable");
    }
    return status;
};

const readFarmerId = (query: Query) => {
    const farmer = readString(query, "farmer");
    if (!farmer) return undefined;
    if (!Types.ObjectId.isValid(farmer)) throw badRequestError("Invalid farmer id");
    return new Types.ObjectId(farmer);
};

const buildFilter = async (query: Query) => {
    const category = readString(query, "category");
    const filter: Record<string, unknown> = {
        $or: buildSearchFilter(query),
        // Unknown category → match nothing rather than ignoring the filter
        category: category ? ((await resolveCategoryId(category)) ?? new Types.ObjectId()) : undefined,
        price: buildPriceFilter(query),
        stock: readString(query, "inStock") === "true" ? { $gt: 0 } : undefined,
        status: readStatus(query),
        user_id: readFarmerId(query),
    };

    // Drop filters that were not asked for
    return Object.fromEntries(Object.entries(filter).filter(([, value]) => value !== undefined));
};

/**
 * List products with search, filters, sorting and pagination.
 * `forceFarmerId` limits results to one farmer (used for "my products").
 */
export const listProductsService = async (query: Query, forceFarmerId?: string) => {
    const filter = await buildFilter(query);
    if (forceFarmerId) {
        filter.user_id = new Types.ObjectId(forceFarmerId);
    }

    const sortKey = readString(query, "sort") ?? "newest";
    const sort = SORT_OPTIONS[sortKey];
    if (!sort) {
        throw badRequestError(`sort must be one of: ${Object.keys(SORT_OPTIONS).join(", ")}`);
    }

    const page = readPositiveInt(query, "page", 1);
    const limit = Math.min(readPositiveInt(query, "limit", DEFAULT_LIMIT), MAX_LIMIT);

    const [items, total] = await Promise.all([
        ProductModel.find(filter)
            .sort({ ...sort, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("category", "name")
            .populate("user_id", "full_name")
            .lean(),
        ProductModel.countDocuments(filter),
    ]);

    return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};
