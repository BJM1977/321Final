import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  public loggedIn = new BehaviorSubject<boolean>(false);
  public username = new BehaviorSubject<string>('');
  public role = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/login`, { username, password }, {
        withCredentials: true
      }).subscribe({
        next: () => {
          // Wenn Login erfolgreich, Profil holen
          this.getProfile().subscribe({
            next: (user: any) => {
              this.loggedIn.next(true);
              this.username.next(user.username);
              this.role.next(user.role);
              observer.next(user);
              observer.complete();
            },
            error: err => {
              observer.error(err);
            }
          });
        },
        error: err => {
          observer.error(err);
        }
      });
    });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, { username, email, password });
  }

  getProfile() {
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true
    });
  }

  updatePassword(newPassword: string) {
    return this.http.put(`${this.apiUrl}/profile`, { password: newPassword }, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/logout`, {}, {
        withCredentials: true
      }).subscribe({
        next: (res) => {
          // Zustand zurücksetzen
          this.loggedIn.next(false);
          this.username.next('');
          this.role.next('');
          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }
}
