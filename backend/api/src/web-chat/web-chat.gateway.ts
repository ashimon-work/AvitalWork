import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: 'web-chat',
  path: '/api/socket.io',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class WebChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  private readonly logger = new Logger(WebChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebChatGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      // Store user ID in socket for later use if needed
      client.data.userId = payload.sub;
      
      // Join a room specific to this user
      client.join(`user-${payload.sub}`);
      
      this.logger.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      this.logger.error(`WebSocket connection error for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitMessage(userId: string, message: any) {
    this.server.to(`user-${userId}`).emit('message', message);
  }
}
