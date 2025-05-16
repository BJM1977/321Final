import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {
  messageText = '';
  username = '';
  typingUsers: string[] = [];
  messages: any[] = [];

  private subscriptions: Subscription[] = [];

  constructor(public chat: ChatService) {}

  ngOnInit(): void {
    this.username = this.chat.getUsername();

    this.subscriptions.push(
      this.chat.messages$.subscribe(msgs => this.messages = msgs),
      this.chat.typingUsers$.subscribe(users => {
        this.typingUsers = Array.from(users).filter(u => u !== this.username);
      })
    );
  }

  sendMessage(): void {
    if (this.messageText.trim()) {
      this.chat.sendMessage(this.messageText);
      this.messageText = '';
      this.chat.typing(false);
    }
  }

  onTyping(): void {
    this.chat.typing(this.messageText.length > 0);
  }

  rename(): void {
    this.chat.setUsername(this.username);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }
}
