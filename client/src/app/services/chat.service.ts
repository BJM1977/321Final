import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';

export interface ChatMessage {
  username: string;
  text: string;
  timestamp?: string;
}

export interface UserStatus {
  username: string;
  typing: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private socket!: Socket;
  private username = 'Gast_' + Math.floor(Math.random() * 1000);

  connect(name?: string): void {
    if (name) this.username = name;
    this.socket = io('http://localhost:3000'); // ggf. Docker/Backend-Adresse anpassen

    this.socket.emit('join', this.username);
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  getUsername(): string {
    return this.username;
  }

  sendMessage(message: { username: string; text: string }): void {
    this.socket.emit('chat:message', message);
  }

  onMessage(): Observable<ChatMessage> {
    return fromEvent(this.socket, 'chat:message');
  }

  onHistory(): Observable<ChatMessage[]> {
    return fromEvent(this.socket, 'chat:history');
  }

  sendTyping(status: UserStatus): void {
    this.socket.emit('chat:typing', status);
  }

  onTyping(): Observable<UserStatus> {
    return fromEvent(this.socket, 'chat:typing');
  }
}
