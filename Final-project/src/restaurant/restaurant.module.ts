import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  Restaurant, RestaurantSchema } from './Schema/restaurant.schema.js';
import { UserModule } from '../user/user.module.js';
import { RestaurantController } from './restaurant.controller.js';
import { RestaurantService } from './restaurant.service.js';

@Module({
    imports:[
        MongooseModule.forFeature([{name:Restaurant.name, schema:RestaurantSchema}]),
        UserModule
    ],
    controllers:[RestaurantController],
    providers:[RestaurantService],
    exports:[RestaurantService]

})
export class RestaurantModule {}
