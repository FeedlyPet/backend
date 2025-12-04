import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { EmailLogEntity } from '../common/entities';

@Injectable()
export class EmailRateLimiterService {
    private readonly logger = new Logger(EmailRateLimiterService.name);
    private readonly MAX_EMAILS_PER_HOUR = 3;
    private readonly RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

    constructor(
        @InjectRepository(EmailLogEntity)
        private emailLogRepository: Repository<EmailLogEntity>,
    ) {}

    async canSendEmail(recipient: string): Promise<boolean> {
        const oneHourAgo = new Date(Date.now() - this.RATE_LIMIT_WINDOW_MS);

        const recentEmailCount = await this.emailLogRepository.count({
            where: {
                recipient,
                sentAt: MoreThan(oneHourAgo),
                sentSuccessfully: true,
            },
        });

        const canSend = recentEmailCount < this.MAX_EMAILS_PER_HOUR;

        if (!canSend) {
            this.logger.warn(
                `Rate limit exceeded for ${recipient}. ` +
                `${recentEmailCount} emails sent in the last hour.`
            );
        }

        return canSend;
    }

    async getRemainingEmails(recipient: string): Promise<number> {
        const oneHourAgo = new Date(Date.now() - this.RATE_LIMIT_WINDOW_MS);

        const recentEmailCount = await this.emailLogRepository.count({
            where: {
                recipient,
                sentAt: MoreThan(oneHourAgo),
                sentSuccessfully: true,
            },
        });

        return Math.max(0, this.MAX_EMAILS_PER_HOUR - recentEmailCount);
    }

    async getTimeUntilNextEmail(recipient: string): Promise<number | null> {
        const oneHourAgo = new Date(Date.now() - this.RATE_LIMIT_WINDOW_MS);

        const oldestRecentEmail = await this.emailLogRepository.findOne({
            where: {
                recipient,
                sentAt: MoreThan(oneHourAgo),
                sentSuccessfully: true,
            },
            order: {
                sentAt: 'ASC',
            },
        });

        if (!oldestRecentEmail) {
            return null;
        }

        const timeUntilReset =
            new Date(oldestRecentEmail.sentAt).getTime() +
            this.RATE_LIMIT_WINDOW_MS -
            Date.now();

        return Math.max(0, timeUntilReset);
    }
}