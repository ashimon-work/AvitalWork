import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket;
  private managerNamespace = '/manager'; // Namespace for manager WebSocket

  constructor() {
    // Connect to the manager WebSocket namespace
    // TODO: Configure the URL appropriately for different environments
    this.socket = io(this.managerNamespace);

    this.socket.on('connect', () => {
      console.log('WebSocket connected to manager namespace');
      // TODO: Implement authentication/authorization after connection
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log(`WebSocket disconnected from manager namespace: ${reason}`);
      // TODO: Handle disconnection (e.g., attempt to reconnect)
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      // TODO: Handle WebSocket errors
    });
  }

  // Method to listen for a specific event
  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  // Method to emit a message (if needed)
  emit(eventName: string, data: any): void {
    this.socket.emit(eventName, data);
  }

  // Method to disconnect (if needed)
  disconnect(): void {
    this.socket.disconnect();
  }
}