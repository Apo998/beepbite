import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema.js';
import { CustomerModule } from '../customer/customer.module.js';
import { RestaurantModule } from '../restaurant/restaurant.module.js';
import { OrderController } from './order.controller.js';
import { OrderService } from './order.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { OrderGateway } from './order.gateway.js';

@Module({
    imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    CustomerModule,
    RestaurantModule,
    AuthModule
  ],
  controllers: [OrderController],
  providers: [OrderService,OrderGateway],
  exports: [OrderService],
})
export class OrderModule {}
