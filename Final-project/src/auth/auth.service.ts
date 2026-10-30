import { BadRequestException, Injectable, Logger, NotFoundException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service.js';
import { CustomerService } from '../customer/customer.service.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDTO } from './DTO/register.auth.dto.js';
import { Role } from '../common/roles.enum.js';
import { LoginDTO } from './DTO/login.auth.dto.js';
import { compare } from 'bcrypt';
import { MailService } from '../mail/mail.service.js';
import { ForgotPasswordDTO } from './DTO/forgot.password.dto.js';
import { ResetPasswordDTO } from './DTO/reset.password.dto.js';

const RESET_MINUTES = 30
// One reset email per address every 10 minutes, so the form can't be used to flood an inbox.
const RESET_COOLDOWN_MS = 10 * 60_000

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
    private readonly lastResetEmail = new Map<string, number>()

    constructor(
        private userService: UserService,
        private customerService: CustomerService,
        private jwtService: JwtService,
        private config: ConfigService,
        private mailService: MailService
    ) { }


    async register(dto: RegisterDTO) {
        const newUser = await this.userService.createUser({ ...dto, role: Role.Customer })


        try {
            await this.customerService.createCustomer(newUser._id)
        } catch (error) {
            await this.userService.remove(newUser._id);
            throw error;
        }
        return { message: "Registered successfully" }
    }

    async login(dto: LoginDTO) {
        const user = await this.userService.findByEmail(dto.email)
        if (!user) throw new UnauthorizedException("Invalid Email or password")

        const match = await compare(dto.password, user.password)

        if (!match) throw new UnauthorizedException("Invalid Email or password")

        const payload = {
            sub: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }

        const token=await this.jwtService.signAsync(payload)

        return{
            accessToken:token,
            user:{id:user.id,email:user.email,role:user.role}
        }
    }

    async me(userId: string) {
  const user = await this.userService.findById(userId);
  if (!user) throw new NotFoundException('User not found');
  return user;
}

    // Reset tokens are signed with JWT_SECRET plus the user's current password hash:
    // they can't be used as access tokens, and they stop working once the password changes.
    private resetSecret(passwordHash: string) {
        return this.config.getOrThrow<string>("JWT_SECRET") + passwordHash
    }

    async forgotPassword(dto: ForgotPasswordDTO) {
        if (!this.mailService.enabled) throw new ServiceUnavailableException("Password reset email isn't set up")

        const answer = { message: "If that email has an account, a reset link is on its way" }
        const email = dto.email.toLowerCase()

        const last = this.lastResetEmail.get(email) ?? 0
        if (Date.now() - last < RESET_COOLDOWN_MS) return answer

        const user = await this.userService.findByEmail(email)
        if (!user) return answer
        this.lastResetEmail.set(email, Date.now())

        const token = await this.jwtService.signAsync(
            { sub: user.id, purpose: 'password-reset' },
            { secret: this.resetSecret(user.password), expiresIn: `${RESET_MINUTES}m` }
        )
        const link = `${this.config.get<string>("APP_URL", "http://localhost:4200")}/reset-password?token=${encodeURIComponent(token)}`

        // Not awaited: the answer takes the same time whether or not the account exists.
        this.mailService.sendPasswordReset(user.email, user.name, link, RESET_MINUTES)
            .catch(error => this.logger.error(`Password reset email to ${user.email} failed: ${error.message}`))

        return answer
    }

    async resetPassword(dto: ResetPasswordDTO) {
        const invalid = new BadRequestException("This reset link is invalid or has expired")

        const claimed = this.jwtService.decode<{ sub?: string } | null>(dto.token)
        if (!claimed?.sub) throw invalid

        const user = await this.userService.findByIdWithPassword(claimed.sub).catch(() => null)
        if (!user) throw invalid

        try {
            const payload = await this.jwtService.verifyAsync(dto.token, { secret: this.resetSecret(user.password) })
            if (payload.purpose !== 'password-reset') throw invalid
        } catch {
            throw invalid
        }

        await this.userService.updatePassword(user._id, dto.password)
        return { message: "Password updated" }
    }



}

