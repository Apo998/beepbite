import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schema/customer.schema.js';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';

@Module({
    imports: [MongooseModule.forFeature([{
        name: Customer.name,
        schema: CustomerSchema
    }])],

    controllers: [CustomerController],
    providers: [CustomerService],
    exports: [CustomerService]
})
export class CustomerModule { }
