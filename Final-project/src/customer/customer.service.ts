import {  Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Customer } from './schema/customer.schema.js';
import { Model, Types } from 'mongoose';
import QRCode from 'qrcode';


@Injectable()
export class CustomerService {

    constructor(
        @InjectModel(Customer.name)
        private customerModel:Model<Customer>
    ){}

    async createCustomer(userId:string | Types.ObjectId){
        return await this.customerModel.create({userId})
    }

   async findByUserId(userId: string | Types.ObjectId) {
  return this.customerModel.findOne({ userId }).exec();
}

    async findByQrToken(qrToken:string){
        return await this.customerModel.findOne({qrToken})
    }

    // The customer's code for the counter: the token, a QR image of it, and the points balance.
    async getCode(userId: string | Types.ObjectId) {
        const customer = await this.findByUserId(userId)
        if (!customer) throw new NotFoundException('Customer not found')

        return {
            qrToken: customer.qrToken,
            qrCode: await QRCode.toDataURL(customer.qrToken, { margin: 1, width: 320 }),
            pointsBalance: customer.pointsBalance
        }
    }

    async addPoints(customerId: Types.ObjectId, points: number) {
        await this.customerModel.updateOne({ _id: customerId }, { $inc: { pointsBalance: points } })
    }



}
