import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant } from './Schema/restaurant.schema.js';
import { UserService } from '../user/user.service.js';
import { CreateRestaurantDto } from './DTO/restaurant.dto.js';
import { Role } from '../common/roles.enum.js';


@Injectable()
export class RestaurantService {
    constructor(
        @InjectModel(Restaurant.name) private restaurantModel: Model<Restaurant>,
        private userService: UserService
    ) { }

    async createRestaurant(dto: CreateRestaurantDto) {
        const restaurant = await this.userService.createUser({
            name: dto.name,
            email: dto.email,
            password: dto.password,
            role: Role.restaurant
        })

        try {
            return await this.restaurantModel.create({
                userId: restaurant._id,
                name: dto.name,
            })
        } catch (error) {
            await this.userService.remove(restaurant._id)
            throw error
        }
    }

    async findAll() {
        return this.restaurantModel.find()
    }

  async findByUserId(userId: string | Types.ObjectId) {
  return this.restaurantModel.findOne({ userId })
}

    async findById(id: string | Types.ObjectId) {
        const restaurant = await this.restaurantModel.findById(id)
        if (!restaurant) throw new NotFoundException('Restaurant not found')
        return restaurant
    }

    async findMine(userId: string | Types.ObjectId) {
        const restaurant = await this.findByUserId(userId)
        if (!restaurant) throw new NotFoundException('Restaurant not found')
        return restaurant
    }

    // Admin view: every restaurant with the sign-in email of its user.
    async findAllWithEmail() {
        const restaurants = await this.restaurantModel.find().populate<{ userId: any }>('userId', 'email').lean()
        return restaurants.map(r => ({
            ...r,
            userId: r.userId?._id ?? null,
            email: r.userId?.email ?? null
        }))
    }



}

