import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mailjet from 'node-mailjet';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private mailjet: Mailjet;
    private readonly isDevelopment: boolean;
    private readonly fromEmail: string;
    private readonly fromName: string;
    private readonly frontendUrl: string;

    constructor(private configService: ConfigService) {
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

        await this.sendEmail(email, subject, htmlContent, { verificationUrl, token });
    }

    async sendPasswordResetEmail(email: string, token: string, name: string): Promise<void> {
        const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
        const subject = 'Password Reset - FeedlyPet';
        const htmlContent = this.getPasswordResetEmailTemplate(name, resetUrl);

        await this.sendEmail(email, subject, htmlContent, { resetUrl, token });
    }

    private async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
        debugData?: Record<string, any>,
    ): Promise<void> {
        if (!this.mailjet) {
            this.logger.error('Mailjet is not configured. Please set MAILJET_API_KEY and MAILJET_SECRET_KEY.');
            throw new Error('Email service is not configured');
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
                    },
                ],
            });

            await request;
            this.logger.log(`Email sent successfully to ${to}`);

            if (this.isDevelopment && debugData) {
                this.logger.log('Development mode - email details:');
                Object.entries(debugData).forEach(([key, value]) => {
                    this.logger.log(`${key}: ${value}`);
                });
            }
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error);
            throw new Error('Failed to send email');
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
}
