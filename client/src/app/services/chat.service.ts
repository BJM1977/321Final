import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private socket: Socket;
  private username = 'Gast';

  messages$ = new BehaviorSubject<any[]>([]);
  typingUsers$ = new BehaviorSubject<Set<string>>(new Set());

  constructor() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true,
    });

    // Alle bisherigen Nachrichten beim Start laden
    fetch('http://localhost:3000/messages', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(messages => this.messages$.next(messages))
      .catch(err => console.error('Fehler beim Laden der Nachrichten:', err));

    // Neue eingehende Nachrichten
    this.socket.on('chat:message', (msg) => {
      const updated = [...this.messages$.value, msg];
      this.messages$.next(updated);
    });

    // Tippende Benutzer
    this.socket.on('chat:typing', ({ username, typing }) => {
      const users = new Set(this.typingUsers$.value);
      typing ? users.add(username) : users.delete(username);
      this.typingUsers$.next(users);
    });

    // Beim Server anmelden
    this.join();
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

  typing(isTyping: boolean): void {
    this.socket.emit('chat:typing', {
      username: this.username,
      typing: isTyping,
    });
  }
}
