import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service.js';
import { Role } from '../common/roles.enum.js';

@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
    constructor(
        private readonly userService: UserService,
        private readonly config: ConfigService
    ) { }

    // Creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD, once. Does nothing if they are not set.
    async onApplicationBootstrap() {
        const email = this.config.get<string>("ADMIN_EMAIL")
        const password = this.config.get<string>("ADMIN_PASSWORD")
        if (!email || !password) return

        if (await this.userService.findByEmail(email)) return

        await this.userService.createUser({
            name: this.config.get<string>("ADMIN_NAME", "Admin"),
            email,
            password,
            role: Role.Admin
        })
        console.log(`Admin account created for ${email.toLowerCase()}`)
    }
}
