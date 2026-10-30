import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Sends email through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email).
@Injectable()
export class MailService {
    constructor(private readonly config: ConfigService) { }

    get enabled(): boolean {
        return !!this.config.get<string>("RESEND_API_KEY")
    }

    private get supportEmail(): string {
        return this.config.get<string>("SUPPORT_EMAIL", "support@beepbite.net")
    }

    private get supportPage(): string {
        return `${this.config.get<string>("APP_URL", "http://localhost:4200")}/support`
    }

    async sendPasswordReset(to: string, name: string, link: string, minutes: number) {
        const first = escapeHtml(name.split(' ')[0] || 'there')
        const href = escapeHtml(link)

        await this.send(to, 'Reset your BeepBite password', `
<div style="background:#FFF0D4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1C1A17">
  <div style="max-width:480px;margin:0 auto;background:#FFF8EA;border:2px solid #1C1A17;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#F0492B">beepbite</p>
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.2">Reset your password</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.5">Hi ${first}, we got a request to reset your BeepBite password. Tap the button to pick a new one.</p>
    <a href="${href}" style="display:inline-block;background:#F0492B;color:#FFF8EA;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border:2px solid #1C1A17;border-radius:999px">Reset password</a>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#0F4C4A">This link works once and expires in ${minutes} minutes. If you didn't ask for it, ignore this email; your password stays the same.</p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.5;color:#0F4C4A">Need help? Visit <a href="${escapeHtml(this.supportPage)}" style="color:#0F4C4A;font-weight:700">BeepBite support</a> or write to <a href="mailto:${escapeHtml(this.supportEmail)}" style="color:#0F4C4A;font-weight:700">${escapeHtml(this.supportEmail)}</a>.</p>
  </div>
</div>`, `Hi ${name.split(' ')[0] || 'there'},

We got a request to reset your BeepBite password. Open this link to pick a new one:
${link}

This link works once and expires in ${minutes} minutes. If you didn't ask for it, ignore this email; your password stays the same.

Need help? Visit ${this.supportPage} or write to ${this.supportEmail}.`)
    }

    // A message from the support page, delivered to the support inbox. Replying answers the sender.
    async sendSupportRequest(request: { name: string, email: string, topic: string, message: string }) {
        const name = escapeHtml(request.name)
        const email = escapeHtml(request.email)
        const topic = escapeHtml(request.topic)
        const message = escapeHtml(request.message).replace(/\r?\n/g, '<br>')
        const subject = `Support: ${request.topic} (${request.name})`.replace(/\s+/g, ' ')

        await this.send(this.supportEmail, subject, `
<div style="background:#FFF0D4;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#1C1A17">
  <div style="max-width:560px;margin:0 auto;background:#FFF8EA;border:2px solid #1C1A17;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#F0492B">beepbite</p>
    <h1 style="margin:0 0 16px;font-size:22px;line-height:1.2">New support message</h1>
    <table style="border-collapse:collapse;font-size:15px;line-height:1.5;margin:0 0 20px">
      <tr><td style="padding:2px 16px 2px 0;color:#0F4C4A;font-weight:700">From</td><td>${name}</td></tr>
      <tr><td style="padding:2px 16px 2px 0;color:#0F4C4A;font-weight:700">Email</td><td><a href="mailto:${email}" style="color:#1C1A17">${email}</a></td></tr>
      <tr><td style="padding:2px 16px 2px 0;color:#0F4C4A;font-weight:700">Topic</td><td>${topic}</td></tr>
    </table>
    <div style="background:#FFFFFF;border:2px solid #1C1A17;border-radius:12px;padding:16px;font-size:15px;line-height:1.6">${message}</div>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.5;color:#0F4C4A">Reply to this email to answer ${name} directly.</p>
  </div>
</div>`, `New support message

From: ${request.name}
Email: ${request.email}
Topic: ${request.topic}

${request.message}

Reply to this email to answer ${request.name} directly.`, request.email)
    }

    private async send(to: string, subject: string, html: string, text: string, replyTo?: string) {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.config.getOrThrow<string>("RESEND_API_KEY")}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: this.config.get<string>("RESEND_FROM", "BeepBite <no-reply@beepbite.net>"),
                to: [to],
                subject,
                html,
                text,
                ...(replyTo && { reply_to: replyTo })
            })
        })

        if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`)
    }
}

function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
