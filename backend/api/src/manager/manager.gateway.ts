import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  namespace: '/manager', // Namespace for manager-specific WebSocket connections
  cors: {
    origin: '*', // TODO: Configure CORS appropriately for production
  },
})
export class ManagerGateway {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ManagerGateway.name);

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Manager client connected: ${client.id}`);
    // TODO: Implement authentication/authorization for WebSocket connections
    // Associate client with a store based on authentication
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Manager client disconnected: ${client.id}`);
    // TODO: Clean up any resources associated with the client
  }

  @SubscribeMessage('message') // Example message handler
  handleMessage(@MessageBody() data: string, @ConnectedSocket() client: Socket): string {
    this.logger.log(`Message from client ${client.id}: ${data}`);
    // Example: Echo message back to the client
    client.emit('message', `Server received: ${data}`);
    return data; // This is sent back to the client as an acknowledgment
  }

  // TODO: Implement methods to emit real-time updates
  // e.g., emitNewOrder(storeId: string, order: any)
  // e.g., emitLowStockAlert(storeId: string, alert: any)
}