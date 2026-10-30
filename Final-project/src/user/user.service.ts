import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema.js';
import { Model, Types } from 'mongoose';
import { CreateUserDTO } from './DTO/create.user.dto.js';
import * as bcrypt from 'bcrypt';
import { string } from 'joi';
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>
    ) { }

    async createUser(dto: CreateUserDTO) {
        const email = dto.email.toLowerCase()

        const exists = await this.userModel.exists({ email })

        if (exists) throw new ConflictException("Email already exists")

        const hashedPassword = await bcrypt.hash(dto.password, 12)

        return await this.userModel.create({
            ...dto,
            email,
            password: hashedPassword
        })
    }


    async findByEmail(email: string) {
        return await this.userModel.findOne({ email: email.toLowerCase() }).select('+password')

    }

    async findById(id: string | Types.ObjectId) {
      return  await this.userModel.findById(id)
    }

    async findByIdWithPassword(id: string | Types.ObjectId) {
        return await this.userModel.findById(id).select('+password')
    }

    async updatePassword(id: string | Types.ObjectId, password: string) {
        const hashedPassword = await bcrypt.hash(password, 12)
        await this.userModel.updateOne({ _id: id }, { password: hashedPassword })
    }

    async remove(id: string | Types.ObjectId): Promise<void> {
    await this.userModel.deleteOne({ _id: id }).exec();
  }
}
