import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';

export interface FeedingResultEvent {
  deviceId: string;
  deviceName: string;
  portionSize: number;
  success: boolean;
  errorMessage?: string;
  timestamp: string;
}

export interface FoodLevelEvent {
  deviceId: string;
  level: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string) ||
      (client.handshake.headers?.authorization as string)?.replace(
        'Bearer ',
        '',
      );

    if (!token) {
      this.logger.warn(`WS client ${client.id} rejected: no token`);
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      const userId: string = payload.sub;
      client.data.userId = userId;
      client.join(`user:${userId}`);
      this.logger.log(`WS client ${client.id} connected for user ${userId}`);
    } catch {
      this.logger.warn(`WS client ${client.id} rejected: invalid token`);
      client.disconnect();
    }
  }

  emitFeedingResult(userId: string, event: FeedingResultEvent) {
    this.server.to(`user:${userId}`).emit('feeding:result', event);
  }

  emitFoodLevel(userId: string, event: FoodLevelEvent) {
    this.server.to(`user:${userId}`).emit('food:level', event);
  }
}
