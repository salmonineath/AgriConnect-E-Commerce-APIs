import mongoose, {Types, Schema, Document} from "mongoose";
import { IRole } from "@/types/role-type";

export interface IRoleModel extends IRole, Document {
    _id: Types.ObjectId,
    // name: string,
    // des: string,
}

const roleSchema = new Schema<IRoleModel>(
    {
        name: { type: String, required: true },
        des: { type: String },
    },
    { timestamps: true }
)

export const rolesModel = mongoose.model<IRoleModel>("Role", roleSchema)