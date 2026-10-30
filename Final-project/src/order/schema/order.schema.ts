import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Mongoose, Types } from "mongoose";
import { Status } from "../../common/status.enum.js";

@Schema({ timestamps: true })
export class Order {
    @Prop({
        required:true,
        trim:true,
        type:mongoose.Types.ObjectId,
        ref:'Customer'
    })
    customerId:mongoose.Types.ObjectId

    @Prop({
        required:true,
        trim:true,
         type:mongoose.Types.ObjectId,
        ref:'Restaurant'
    })
    restaurantId:mongoose.Types.ObjectId

     @Prop({
        required:true,
     })
     orderId:number

     @Prop({
        required:true,
        min:1
     })
     amountPaid:number

     @Prop({
        required:true,
     })
     status:Status

     @Prop({
  required: true,
  trim: true
})
createdAt: Date

}

export type OrderDocument=HydratedDocument<Order>
export const OrderSchema=SchemaFactory.createForClass(Order)