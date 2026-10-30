import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { UserModule } from './user/user.module.js';
import { DatabaseModule } from './database/database.module.js';
import { CustomerController } from './customer/customer.controller.js';
import { CustomerService } from './customer/customer.service.js';
import { CustomerModule } from './customer/customer.module.js';
import { OrderController } from './order/order.controller.js';
import { OrderService } from './order/order.service.js';
import { OrderModule } from './order/order.module.js';
import { RestaurantController } from './restaurant/restaurant.controller.js';
import { RestaurantService } from './restaurant/restaurant.service.js';
import { RestaurantModule } from './restaurant/restaurant.module.js';
import { SupportModule } from './support/support.module.js';
import Joi from 'joi';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().default(3000),
        ADMIN_NAME: Joi.string().default('Admin'),
        ADMIN_EMAIL: Joi.string().email({ tlds: { allow: false } }).optional(),
        ADMIN_PASSWORD: Joi.string().min(8).optional(),
        RESEND_API_KEY: Joi.string().optional(),
        RESEND_FROM: Joi.string().default('BeepBite <no-reply@beepbite.net>'),
        APP_URL: Joi.string().uri().default('http://localhost:4200'),
        SUPPORT_EMAIL: Joi.string().email({ tlds: { allow: false } }).default('support@beepbite.net'),
      }),
    }),
    AuthModule,
    UserModule,
    DatabaseModule,
    CustomerModule,
    OrderModule,
    RestaurantModule,
    SupportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }