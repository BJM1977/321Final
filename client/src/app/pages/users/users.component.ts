import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: any[] = []
  editMode = false
  createMode = false
  editedUser: any = null

  roles = ['User', 'Moderator', 'Admin']

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers()
  }

  loadUsers(): void {
    this.http
      .get<any[]>('http://localhost:3000/users', { withCredentials: true })
      .subscribe({
        next: (users) => (this.users = users),
        error: () => console.error('Fehler beim Laden der Benutzer'),
      })
  }

  startEdit(user: any): void {
    this.editedUser = { ...user }
    this.editMode = true
    this.createMode = false
  }

  startCreate(): void {
    this.editedUser = {
      username: '',
      password: '',
      role: 'User',
      active: true,
    }
    this.editMode = true
    this.createMode = true
  }

  saveUser(): void {
    const user = this.editedUser

    if (!user.username) {
      alert('Username darf nicht leer sein')
      return
    }

    const request = this.createMode
      ? this.http.post('http://localhost:3000/users', user, {
          withCredentials: true,
        })
      : this.http.put(`http://localhost:3000/users/${user.id}`, user, {
          withCredentials: true,
        })

    request.subscribe({
      next: () => {
        this.loadUsers()
        this.cancelEdit()
      },
      error: (err) => {
        console.error('Fehler beim Speichern:', err)
        alert('Fehler beim Speichern')
      },
    })
  }

  deleteUser(id: number): void {
    this.http
      .delete(`http://localhost:3000/users/${id}`, { withCredentials: true })
      .subscribe({
        next: () => this.loadUsers(),
        error: () => console.error('Fehler beim Löschen des Benutzers'),
      })
  }

  cancelEdit(): void {
    this.editMode = false
    this.editedUser = null
    this.createMode = false
  }
}
