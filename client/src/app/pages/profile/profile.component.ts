import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.services';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    FormsModule,
    NgIf,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    MatSnackBarModule,
  ],
})
export class ProfileComponent implements OnInit {
  username = '';
  role = '';

  newPassword = '';
  confirmPassword = '';
  passwordMismatch = false;
  success = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.authService.getProfile().subscribe({
      next: (user: any) => {
        this.username = user.username;
        this.role = user.role;
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  saveChanges() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordMismatch = true;
      this.snackBar.open('Die Passwörter stimmen nicht überein.', 'Schließen', {
        duration: 3000,
        panelClass: ['snackbar-error'],
      });
      return;
    }

    this.passwordMismatch = false;

    this.authService.updatePassword(this.newPassword).subscribe({
      next: () => {
        this.snackBar.open('Passwort erfolgreich geändert!', 'OK', {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: () => {
        this.snackBar.open('Fehler beim Aktualisieren des Passworts.', 'Schließen', {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
      }
    });
  }
}
