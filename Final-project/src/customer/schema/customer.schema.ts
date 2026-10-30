import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import mongoose, { Types } from "mongoose";
import { HydratedDocument } from "mongoose";


@Schema()
export class Customer {
     @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: mongoose.Types.ObjectId

    @Prop({
        required: true,
        unique: true,
        default: () => randomUUID()
    })
    qrToken: string

    @Prop({
        required: true,
        default: 0,
        min: 0
    })
    pointsBalance: number

}

export type CustomerDocument = HydratedDocument<Customer>

export const CustomerSchema = SchemaFactory.createForClass(Customer)