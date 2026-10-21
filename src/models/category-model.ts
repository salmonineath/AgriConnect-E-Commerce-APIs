import mongoose, { Types, Schema, Document } from "mongoose";
import { ICategory } from "@/types/category-type";

export interface ICategoryModel extends ICategory, Document {
    _id: Types.ObjectId;
    user_id: Types.ObjectId;
}

const categorySchema = new Schema<ICategoryModel>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        des: { type: String, trim: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    }, 
    { timestamps: true }
)

export const categoryModel = mongoose.model<ICategoryModel>("Category", categorySchema)