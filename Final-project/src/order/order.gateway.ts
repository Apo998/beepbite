import { InjectModel } from '@nestjs/mongoose';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { Order, OrderDocument } from './schema/order.schema.js';
import { isValidObjectId, Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from '../customer/customer.service.js';
import { Status } from '../common/status.enum.js';
import { Role } from '../common/roles.enum.js';
import { RestaurantService } from '../restaurant/restaurant.service.js';


@WebSocketGateway()
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server

    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        private jwtService: JwtService,
        private customerService: CustomerService,
        private restaurantService: RestaurantService

    ) { }

    @SubscribeMessage('ping')
    ping(@MessageBody() body: { message?: string }) {
        return { event: 'pong', data: { received: body?.message ?? null } };
    }


    @SubscribeMessage('order.join')
    async joinOrder(
        @ConnectedSocket() client: Socket,
        @MessageBody() body: { orderId?: string }
    ) {
        if (!body?.orderId || !isValidObjectId(body.orderId)) {
            return { ok: false, error: 'Bad order ID' };
        }

        let userId: string

        try {
            const token =
                client.handshake.auth?.token ??
                client.handshake.headers.authorization?.split(' ')[1]

            const payload = await this.jwtService.verifyAsync(token)
            userId = payload.sub
        } catch {
            return { ok: false, error: "Unauthorized" }
        }

        const customer = await this.customerService.findByUserId(userId)
        if (!customer) return { ok: false, error: "Customer not found" }

        const order = await this.orderModel.findOne({ _id: body.orderId, customerId: customer._id })
        if (!order) return { ok: false, error: 'Order not found' };

        await client.join(`order:${body.orderId}`);
        return { ok: true };

    }

    notifyOrder(id: string, orderNumber: number, status: Status) {
        this.server
            .to(`order:${id}`)
            .emit('order.updated', { id, orderNumber, status });
    }

    private async tokenPayload(client: Socket): Promise<{ sub: string, role: Role } | null> {
        try {
            const token =
                client.handshake.auth?.token ??
                client.handshake.headers.authorization?.split(' ')[1]

            return await this.jwtService.verifyAsync(token)
        } catch {
            return null
        }
    }

    // A restaurant's screens hear about every new order and status change of that restaurant.
    @SubscribeMessage('restaurant.join')
    async joinRestaurant(@ConnectedSocket() client: Socket) {
        const payload = await this.tokenPayload(client)
        if (!payload || payload.role !== Role.restaurant) return { ok: false, error: "Unauthorized" }

        const restaurant = await this.restaurantService.findByUserId(payload.sub)
        if (!restaurant) return { ok: false, error: "Restaurant not found" }

        await client.join(`restaurant:${restaurant._id.toString()}`);
        return { ok: true };
    }

    // A customer's screens hear about new orders placed for them.
    @SubscribeMessage('customer.join')
    async joinCustomer(@ConnectedSocket() client: Socket) {
        const payload = await this.tokenPayload(client)
        if (!payload || payload.role !== Role.Customer) return { ok: false, error: "Unauthorized" }

        const customer = await this.customerService.findByUserId(payload.sub)
        if (!customer) return { ok: false, error: "Customer not found" }

        await client.join(`customer:${customer._id.toString()}`);
        return { ok: true };
    }

    notifyCreated(order: OrderDocument) {
        const data = order.toJSON()
        this.server.to(`restaurant:${order.restaurantId.toString()}`).emit('order.created', data);
        this.server.to(`customer:${order.customerId.toString()}`).emit('order.created', data);
    }

    notifyRestaurant(restaurantId: string, id: string, orderNumber: number, status: Status) {
        this.server
            .to(`restaurant:${restaurantId}`)
            .emit('order.updated', { id, orderNumber, status });
    }

    handleConnection(client: Socket) {
        console.log(`connected ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`connected ${client.id}`);
    }


}