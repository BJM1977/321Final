import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ChatService, ChatMessage, UserStatus } from '../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  standalone: true,
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatCardModule,
    MatButtonModule,
  ],
})
export class FeedComponent implements OnInit, OnDestroy {
  messages: ChatMessage[] = [];
  messageText = '';
  username = '';
  typingUsers: string[] = [];
  private subs: Subscription[] = [];

  constructor(private chat: ChatService) {}

  ngOnInit(): void {
    // Aktuellen Usernamen und alte Nachrichten laden
    this.username = this.chat.getUsername();
    this.chat.connect(this.username);
    this.subs.push(
      this.chat.onMessage().subscribe(msg => this.messages.push(msg))
    );
    this.subs.push(
      this.chat.onHistory().subscribe(history => (this.messages = history))
    );
    this.subs.push(
      this.chat.onTyping().subscribe((user: UserStatus) => {
        this.updateTyping(user);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.chat.disconnect();
  }

  sendMessage(): void {
    const text = this.messageText.trim();
    if (!text) return;
    this.chat.sendMessage({ username: this.username, text });
    this.messageText = '';
  }

  onKeypress(): void {
    this.chat.sendTyping({ username: this.username, typing: true });
    // Nach 1s ohne Tasten loslassen Typing-Status zurücksetzen
    setTimeout(() => this.chat.sendTyping({ username: this.username, typing: false }), 1000);
  }

  private updateTyping(status: UserStatus): void {
    const { username, typing } = status;
    this.typingUsers = this.typing
      ? Array.from(new Set([...this.typingUsers, username]))
      : this.typingUsers.filter(u => u !== username);
  }
}
