import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  messages: any[] = [];
  messageText: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Abonniere den Nachrichten-Stream
    this.chatService.messages$.subscribe(msgs => {
      this.messages = msgs;
    });

    // Lade vorhandene Nachrichten vom Server
    this.chatService.fetchHistory();
  }

  sendMessage(): void {
    const text = this.messageText.trim();
    if (text) {
      this.chatService.sendMessage(text);
      this.messageText = '';
    }
  }
}
