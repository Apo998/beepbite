import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { HydratedDocument } from "mongoose";
import { Role } from "../../common/roles.enum.js";

@Schema({
    timestamps: true
})
export class User {
    @Prop({
        required: true,
        trim: true,
    })
    name: string

    @Prop({
        required: true,
        trim: true,
    })
    email: string

    @Prop({
        required: true,
        trim: true,
        select: false
    })
    password: string

    @Prop({
        required: true,
        enum: Role,
        default: Role.Customer
    })
    role: Role
}

export type UserDocument = HydratedDocument<User>

export const userSchema = SchemaFactory.createForClass(User)