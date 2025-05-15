import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatInput, MatLabel } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Comment {
  id: number;
  username: string;
  content: string;
}

interface Post {
  id: number;
  username: string;
  content: string;
  liked: boolean;
  disliked: boolean;
  likeCount: number;
  dislikeCount: number;
  showCommentBox: boolean;
  commentText: string;
  comments: Comment[];
}

@Component({
  selector: 'app-feed',
  standalone: true,
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormField,
    MatInput,
    MatLabel,
    MatSnackBarModule,
  ],
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];
  newPostContent = '';
  isAdmin = false;
  loggedInUsername = '';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/auth/me', { withCredentials: true }).subscribe({
      next: user => {
        this.isAdmin = user.role === 'Admin' || user.role === 'Moderator';
        this.loggedInUsername = user.username;
      },
      error: () => {
        this.isAdmin = false;
        this.loggedInUsername = '';
      }
    });

    this.loadPosts();
  }

  loadPosts(): void {
    this.http.get<any[]>('http://localhost:3000/post', { withCredentials: true }).subscribe({
      next: posts => {
        this.posts = posts.map(post => ({
          ...post,
          liked: false,
          disliked: false,
          likeCount: 0,
          dislikeCount: 0,
          showCommentBox: false,
          commentText: '',
          comments: []
        }));
        this.posts.forEach(post => this.loadPostExtras(post));
      },
      error: err => {
        console.error('Fehler beim Laden der Posts:', err);
      }
    });
  }

  createPost(): void {
    if (!this.loggedInUsername) {
      this.snackBar.open('Du musst eingeloggt sein, um einen Beitrag zu posten.', 'OK', {
        duration: 3000
      });
      return;
    }

    if (!this.newPostContent.trim()) return;

    this.http.post<any>('http://localhost:3000/post', {
      content: this.newPostContent
    }, { withCredentials: true }).subscribe({
      next: newPost => {
        const newPostObject: Post = {
          ...newPost,
          liked: false,
          disliked: false,
          likeCount: 0,
          dislikeCount: 0,
          showCommentBox: false,
          commentText: '',
          comments: []
        };
        this.posts.unshift(newPostObject);
        this.newPostContent = '';
      },
      error: err => {
        console.error('Fehler beim Erstellen des Beitrags:', err);
      }
    });
  }

  deletePost(post: Post): void {
    this.http.delete(`http://localhost:3000/post/${post.id}`, { withCredentials: true }).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== post.id);
      },
      error: () => console.error('Fehler beim Löschen des Beitrags')
    });
  }

  deleteComment(commentId: number, post: Post): void {
    this.http.delete(`http://localhost:3000/comment/${commentId}`, { withCredentials: true }).subscribe({
      next: () => this.loadPostExtras(post),
      error: () => console.error('Fehler beim Löschen des Kommentars')
    });
  }

  loadPostExtras(post: Post): void {
    this.http.get<any>(`http://localhost:3000/post/${post.id}/like`, { withCredentials: true }).subscribe({
      next: status => {
        post.liked = status.liked && status.type === 'Like';
        post.disliked = status.liked && status.type === 'Dislike';
      },
      error: () => {
        post.liked = false;
        post.disliked = false;
      }
    });

    this.http.get<any>(`http://localhost:3000/post/${post.id}/like-counts`).subscribe({
      next: counts => {
        post.likeCount = counts.likes;
        post.dislikeCount = counts.dislikes;
      },
      error: () => {
        post.likeCount = 0;
        post.dislikeCount = 0;
      }
    });

    this.http.get<any[]>(`http://localhost:3000/post/${post.id}/comments`).subscribe({
      next: comments => {
        post.comments = comments.map(c => ({
          id: c.id,
          username: c.username,
          content: c.content
        }));
      },
      error: () => {
        post.comments = [];
      }
    });
  }

  toggleLike(post: Post): void {
    if (!this.loggedInUsername) {
      this.snackBar.open('Du musst eingeloggt sein, um Beiträge zu liken.', 'OK', { duration: 3000 });
      return;
    }

    if (post.liked) {
      this.http.delete(`http://localhost:3000/post/${post.id}/like`, { withCredentials: true }).subscribe({
        next: () => {
          post.liked = false;
          this.loadPostExtras(post);
        },
        error: () => console.error('Fehler beim Entfernen des Likes')
      });
    } else {
      this.http.post(`http://localhost:3000/post/${post.id}/like`, {
        type: 'Like'
      }, { withCredentials: true }).subscribe({
        next: () => {
          post.liked = true;
          post.disliked = false;
          this.loadPostExtras(post);
        },
        error: () => console.error('Fehler beim Liken')
      });
    }
  }

  toggleDislike(post: Post): void {
    if (!this.loggedInUsername) {
      this.snackBar.open('Du musst eingeloggt sein, um Beiträge zu disliken.', 'OK', { duration: 3000 });
      return;
    }

    if (post.disliked) {
      this.http.delete(`http://localhost:3000/post/${post.id}/like`, { withCredentials: true }).subscribe({
        next: () => {
          post.disliked = false;
          this.loadPostExtras(post);
        },
        error: () => console.error('Fehler beim Entfernen des Dislikes')
      });
    } else {
      this.http.post(`http://localhost:3000/post/${post.id}/like`, {
        type: 'Dislike'
      }, { withCredentials: true }).subscribe({
        next: () => {
          post.disliked = true;
          post.liked = false;
          this.loadPostExtras(post);
        },
        error: () => console.error('Fehler beim Disliken')
      });
    }
  }

  toggleComment(post: Post): void {
    post.showCommentBox = !post.showCommentBox;
  }

  submitComment(post: Post): void {
    if (!this.loggedInUsername) {
      this.snackBar.open('Du musst eingeloggt sein, um zu kommentieren.', 'OK', { duration: 3000 });
      return;
    }

    if (!post.commentText.trim()) return;

    this.http.post(`http://localhost:3000/comment`, {
      content: post.commentText,
      post_id: post.id
    }, { withCredentials: true }).subscribe({
      next: () => {
        this.loadPostExtras(post);
        post.commentText = '';
      },
      error: () => {
        console.error('Fehler beim Speichern des Kommentars');
      }
    });
  }
}
