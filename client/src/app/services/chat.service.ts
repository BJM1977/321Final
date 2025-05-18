import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private username: string = '';

  messages$ = new BehaviorSubject<any[]>([]);

  constructor() {
    this.socket = io('http://localhost:3000');

    this.socket.on('chat:message', (msg) => {
      const updated = [...this.messages$.value, msg];
      this.messages$.next(updated);
    });

    this.join();
  }

  fetchHistory(): void {
    fetch('http://localhost:3000/messages')
      .then(res => res.json())
      .then(data => this.messages$.next(data))
      .catch(err => console.error('Fehler beim Laden der Nachrichten:', err));
  }

  join(): void {
    this.socket.emit('join', this.username);
  }

  setUsername(name: string): void {
    this.username = name;
    this.socket.emit('chat:rename', name);
  }

  getUsername(): string {
    return this.username;
  }

  sendMessage(text: string): void {
    this.socket.emit('chat:message', {
      username: this.username,
      text,
    });
  }
}
