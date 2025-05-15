import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.services';
import { Router, RouterModule } from '@angular/router'
import { MatToolbarModule } from '@angular/material/toolbar'
import { CommonModule } from '@angular/common';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [
    CommonModule,
    NgIf,
    MatButtonModule,
    RouterModule,
    MatToolbarModule,
  ],
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        this.authService.loggedIn.next(true);
        this.authService.username.next(user.username);
        this.authService.role.next(user.role);
      },
      error: () => {
        this.authService.loggedIn.next(false);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

