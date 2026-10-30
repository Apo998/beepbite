import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schema/order.schema.js';
import { CustomerService } from '../customer/customer.service.js';
import { RestaurantService } from '../restaurant/restaurant.service.js';
import { CreateOrderDTO } from './DTO/order.dto.js';
import { Status } from '../common/status.enum.js';
import { OrderGateway } from './order.gateway.js';
import { UpdateStatusDto } from './DTO/update.status.dto.js';

// Points a customer earns for every order they pick up (status COMPLETED).
const POINTS_PER_PICKUP = 15



@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly customerService: CustomerService,
    private readonly restaurantService: RestaurantService,
    private orderGateway: OrderGateway
  ) { }


  async createOrder(dto: CreateOrderDTO, restaurantUserId: string) {
    try {
      const customer = await this.customerService.findByQrToken(dto.qrToken);
      if (!customer) throw new NotFoundException('Customer not found');

      const restaurant = await this.restaurantService.findByUserId(restaurantUserId);
      if (!restaurant) throw new NotFoundException('Restaurant not found')

      const orderId = await this.nextOrderNumber(restaurant._id)
      console.log('orderId:', orderId)

      const order = await this.orderModel.create({
        customerId: customer._id,
        restaurantId: restaurant._id,
        orderId,
        amountPaid: dto.amountPaid,
        status: Status.preparing,
        createdAt: new Date(),
      })

      this.orderGateway.notifyCreated(order)

      return order
    } catch (error) {
      console.log('CREATE ORDER FAILED:', error)
      throw error;
    }


  }

  async findOrders(userId: string) {

    const customer = await this.customerService.findByUserId(userId);
    if (!customer) throw new NotFoundException('Customer not found');

    return this.orderModel
      .find({ customerId: customer._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findRestaurantOrders(restaurantUserId: string) {
    const restaurant = await this.restaurantService.findByUserId(restaurantUserId)
    if (!restaurant) throw new NotFoundException('Restaurant not found')

    return this.orderModel
      .find({ restaurantId: restaurant._id })
      .sort({ createdAt: -1 })
      .exec()
  }

  async findReadyOrders(userId: string) {
    const customer = await this.customerService.findByUserId(userId)
    if (!customer) throw new NotFoundException()

    return await this.orderModel.find({
      customerId: customer._id,
      status: Status.ready
    }).sort({ createdAt: -1 })
  }



  private async nextOrderNumber(restaurantId: Types.ObjectId): Promise<number> {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const todayCount = await this.orderModel.countDocuments({
      restaurantId,
      createdAt: { $gte: startOfDay },
    })

    return todayCount + 1
  }

  async updateStatus(id: string, dto: UpdateStatusDto, restaurantUserId: string) {
    const restaurant = await this.restaurantService.findByUserId(restaurantUserId)
    if (!restaurant) throw new NotFoundException('Restaurant not found')

    const before = await this.orderModel.findOne({ _id: id, restaurantId: restaurant._id })
    if (!before) throw new NotFoundException('Order not found')

    const order = await this.orderModel.findOneAndUpdate(
      { _id: id, restaurantId: restaurant._id },
      { status: dto.status },
      { new: true }
    )

    if (!order) throw new NotFoundException('Order not found')

    // Picking up adds points; moving an order back out of COMPLETED takes them off again.
    const wasPickedUp = before.status === Status.completed
    const isPickedUp = order.status === Status.completed
    if (wasPickedUp !== isPickedUp) {
      await this.customerService.addPoints(order.customerId, isPickedUp ? POINTS_PER_PICKUP : -POINTS_PER_PICKUP)
    }

    this.orderGateway.notifyOrder(order._id.toString(), order.orderId, order.status)
    this.orderGateway.notifyRestaurant(order.restaurantId.toString(), order._id.toString(), order.orderId, order.status)

    return order
  }
}
