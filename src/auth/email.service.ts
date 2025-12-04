import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Mailjet from 'node-mailjet';
import { EmailLogEntity, EmailType } from '../common/entities';
import { EmailRateLimiterService } from './email-rate-limiter.service';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private mailjet: Mailjet;
    private readonly isDevelopment: boolean;
    private readonly fromEmail: string;
    private readonly fromName: string;
    private readonly frontendUrl: string;

    constructor(
        private configService: ConfigService,
        @InjectRepository(EmailLogEntity)
        private emailLogRepository: Repository<EmailLogEntity>,
        private emailRateLimiter: EmailRateLimiterService,
    ) {
        this.isDevelopment = this.configService.get('NODE_ENV', 'development') === 'development';
        this.fromEmail = this.configService.get('MAILJET_FROM_EMAIL', 'noreply@feedlypet.com');
        this.fromName = this.configService.get('MAILJET_FROM_NAME', 'FeedlyPet');
        this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3001');

        const apiKey = this.configService.get('MAILJET_API_KEY');
        const secretKey = this.configService.get('MAILJET_SECRET_KEY');

        if (apiKey && secretKey) {
            this.mailjet = new Mailjet({
                apiKey,
                apiSecret: secretKey,
            });
        }
    }

    async sendVerificationEmail(email: string, token: string, name: string): Promise<void> {
        const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
        const subject = 'Email Verification - FeedlyPet';
        const htmlContent = this.getVerificationEmailTemplate(name, verificationUrl);
        const textContent = this.getVerificationEmailTextTemplate(name, verificationUrl);

        await this.sendEmail(
            email,
            subject,
            htmlContent,
            textContent,
            EmailType.EMAIL_VERIFICATION,
            null,
            { verificationUrl, token }
        );
    }

    async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        const subject = 'Password Reset - FeedlyPet';
        const htmlContent = this.getPasswordResetEmailTemplate(name, resetUrl);
        const textContent = this.getPasswordResetEmailTextTemplate(name, resetUrl);

        await this.sendEmail(
            email,
            subject,
            htmlContent,
            textContent,
            EmailType.PASSWORD_RESET,
            null,
            { resetUrl, token }
        );
    }

    async sendWelcomeEmail(email: string, name: string, userId?: string): Promise<void> {
        const subject = 'Welcome to FeedlyPet!';
        const htmlContent = this.getWelcomeEmailTemplate(name);
        const textContent = this.getWelcomeEmailTextTemplate(name);

        await this.sendEmail(
            email,
            subject,
            htmlContent,
            textContent,
            EmailType.WELCOME,
            userId || null
        );
    }

    async sendLowFoodLevelAlert(
        email: string,
        name: string,
        deviceName: string,
        foodLevel: number,
        userId?: string
    ): Promise<void> {
        const subject = `Low Food Alert - ${deviceName}`;
        const htmlContent = this.getLowFoodAlertTemplate(name, deviceName, foodLevel);
        const textContent = this.getLowFoodAlertTextTemplate(name, deviceName, foodLevel);

        await this.sendEmail(
            email,
            subject,
            htmlContent,
            textContent,
            EmailType.LOW_FOOD_ALERT,
            userId || null
        );
    }

    private async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
        textContent: string,
        emailType: EmailType,
        userId: string | null = null,
        debugData?: Record<string, any>,
    ): Promise<void> {
        const canSend = await this.emailRateLimiter.canSendEmail(to);
        if (!canSend) {
            const timeUntilNext = await this.emailRateLimiter.getTimeUntilNextEmail(to);
            const minutesUntilNext = timeUntilNext ? Math.ceil(timeUntilNext / 60000) : 60;

            const errorMessage = `Rate limit exceeded. Please try again in ${minutesUntilNext} minutes.`;

            await this.logEmail(to, subject, emailType, userId, false, errorMessage);

            throw new BadRequestException(errorMessage);
        }

        if (!this.mailjet) {
            const errorMessage = 'Email service is not configured';
            this.logger.error('Mailjet is not configured. Please set MAILJET_API_KEY and MAILJET_SECRET_KEY.');

            await this.logEmail(to, subject, emailType, userId, false, errorMessage);

            throw new Error(errorMessage);
        }

        try {
            const request = this.mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: this.fromEmail,
                            Name: this.fromName,
                        },
                        To: [
                            {
                                Email: to,
                            },
                        ],
                        Subject: subject,
                        HTMLPart: htmlContent,
                        TextPart: textContent,
                    },
                ],
            });

            await request;
            this.logger.log(`Email sent successfully to ${to}`);

            await this.logEmail(to, subject, emailType, userId, true, null);

            if (this.isDevelopment && debugData) {
                this.logger.log('Development mode - email details:');
                Object.entries(debugData).forEach(([key, value]) => {
                    this.logger.log(`${key}: ${value}`);
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to send email to ${to}:`, error);

            await this.logEmail(to, subject, emailType, userId, false, errorMessage);

            throw new Error('Failed to send email');
        }
    }

    private async logEmail(
        recipient: string,
        subject: string,
        emailType: EmailType,
        userId: string | null,
        success: boolean,
        errorMessage: string | null,
    ): Promise<void> {
        try {
            const emailLog = this.emailLogRepository.create({
                recipient,
                subject,
                emailType,
                userId,
                sentSuccessfully: success,
                errorMessage,
            });

            await this.emailLogRepository.save(emailLog);
        } catch (error) {
            this.logger.error('Failed to log email:', error);
        }
    }

    private getVerificationEmailTemplate(name: string, verificationUrl: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome, ${name}!</h2>
                <p>Thank you for registering with FeedlyPet!</p>
                <p>Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}"
                       style="background-color: #4CAF50; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Or copy this link to your browser:<br>
                    <a href="${verificationUrl}" style="color: #4CAF50;">${verificationUrl}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link is valid for 24 hours.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you did not register with FeedlyPet, please ignore this email.
                </p>
            </div>
        `;
    }

    private getPasswordResetEmailTemplate(name: string, resetUrl: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hello, ${name}!</h2>
                <p>You requested a password reset for your FeedlyPet account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #2196F3; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Or copy this link to your browser:<br>
                    <a href="${resetUrl}" style="color: #2196F3;">${resetUrl}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link is valid for 1 hour.
                </p>
                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you did not request a password reset, please ignore this email.
                </p>
            </div>
        `;
    }

    private getWelcomeEmailTemplate(name: string): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Welcome to FeedlyPet, ${name}!</h2>
                <p>Thank you for joining FeedlyPet! We're excited to help you take care of your pets with our smart feeding solution.</p>

                <h3 style="color: #555; margin-top: 30px;">Getting Started</h3>
                <ul style="color: #666; line-height: 1.8;">
                    <li>Set up your first device and connect it to your FeedlyPet account</li>
                    <li>Add your pets to the system</li>
                    <li>Create feeding schedules for your pets</li>
                    <li>Monitor food levels and feeding history</li>
                </ul>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${this.frontendUrl}"
                       style="background-color: #4CAF50; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        Go to Dashboard
                    </a>
                </div>

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    If you have any questions, feel free to contact our support team.
                </p>
            </div>
        `;
    }

    private getLowFoodAlertTemplate(name: string, deviceName: string, foodLevel: number): string {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF9800;">Low Food Alert</h2>
                <p>Hello ${name},</p>
                <p>Your FeedlyPet device <strong>${deviceName}</strong> is running low on food.</p>

                <div style="background-color: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #E65100; font-size: 18px;">
                        Current food level: <strong>${foodLevel}%</strong>
                    </p>
                </div>

                <p>Please refill the food container soon to ensure your pet doesn't miss any scheduled feedings.</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${this.frontendUrl}/devices"
                       style="background-color: #FF9800; color: white; padding: 12px 24px;
                              text-decoration: none; border-radius: 4px; display: inline-block;">
                        View Device Status
                    </a>
                </div>

                <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    You can adjust notification settings in your account preferences.
                </p>
            </div>
        `;
    }

    private getVerificationEmailTextTemplate(name: string, verificationUrl: string): string {
        return `
Welcome, ${name}!

Thank you for registering with FeedlyPet!

Please verify your email address by clicking the link below:
${verificationUrl}

This link is valid for 24 hours.

If you did not register with FeedlyPet, please ignore this email.
        `.trim();
    }

    private getPasswordResetEmailTextTemplate(name: string, resetUrl: string): string {
        return `
Hello, ${name}!

You requested a password reset for your FeedlyPet account.

Click the link below to reset your password:
${resetUrl}

This link is valid for 1 hour.

If you did not request a password reset, please ignore this email.
        `.trim();
    }

    private getWelcomeEmailTextTemplate(name: string): string {
        return `
Welcome to FeedlyPet, ${name}!

Thank you for joining FeedlyPet! We're excited to help you take care of your pets with our smart feeding solution.

Getting Started:
- Set up your first device and connect it to your FeedlyPet account
- Add your pets to the system
- Create feeding schedules for your pets
- Monitor food levels and feeding history

Visit your dashboard: ${this.frontendUrl}

If you have any questions, feel free to contact our support team.
        `.trim();
    }

    private getLowFoodAlertTextTemplate(name: string, deviceName: string, foodLevel: number): string {
        return `
Low Food Alert

Hello ${name},

Your FeedlyPet device "${deviceName}" is running low on food.

Current food level: ${foodLevel}%

Please refill the food container soon to ensure your pet doesn't miss any scheduled feedings.

View device status: ${this.frontendUrl}/devices

You can adjust notification settings in your account preferences.
        `.trim();
    }
}
