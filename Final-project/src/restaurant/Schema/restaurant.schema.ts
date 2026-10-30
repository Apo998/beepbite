import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

@Schema({
    timestamps:true
})
export class Restaurant{
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;


}

export type RestaurantDocument = HydratedDocument<Restaurant>;
export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);