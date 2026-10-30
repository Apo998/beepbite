import { HttpException, HttpStatus, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { MailService } from '../mail/mail.service.js';
import { SupportDTO, SupportTopic } from './DTO/support.dto.js';

const TOPICS: Record<SupportTopic, string> = {
    account: 'Account & sign in',
    orders: 'Orders & pickup',
    points: 'Points',
    restaurants: 'Restaurant partners',
    other: 'Something else'
}
// One message per address per minute, so the form can't be used to flood the support inbox.
const COOLDOWN_MS = 60_000

@Injectable()
export class SupportService {
    private readonly logger = new Logger(SupportService.name)
    private readonly lastMessage = new Map<string, number>()

    constructor(private readonly mailService: MailService) { }

    async contact(dto: SupportDTO) {
        if (!this.mailService.enabled) throw new ServiceUnavailableException("The support form isn't set up")

        const email = dto.email.toLowerCase()
        const now = Date.now()
        if (now - (this.lastMessage.get(email) ?? 0) < COOLDOWN_MS) {
            throw new HttpException("You just sent us a message. Wait a minute before sending another", HttpStatus.TOO_MANY_REQUESTS)
        }
        for (const [key, at] of this.lastMessage) if (now - at >= COOLDOWN_MS) this.lastMessage.delete(key)
        this.lastMessage.set(email, now)

        try {
            await this.mailService.sendSupportRequest({ name: dto.name.trim(), email, topic: TOPICS[dto.topic], message: dto.message.trim() })
        } catch (error) {
            this.lastMessage.delete(email)
            this.logger.error(`Support message from ${email} failed: ${(error as Error).message}`)
            throw new ServiceUnavailableException("We couldn't send your message right now")
        }

        return { message: "Message sent" }
    }
}
