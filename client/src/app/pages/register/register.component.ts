import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.services';


// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ]
})

export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = '';


  constructor(private authService: AuthService, private router: Router) {}

  onRegister(): void {
    this.error = '';
    this.success = '';

    // Validierung
    if (!this.username || !this.password || !this.confirmPassword) {
      this.error = 'Bitte fülle alle Felder aus.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Passwörter stimmen nicht überein.';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Passwort muss mindestens 8 Zeichen lang sein.';
      return;
    }

    // API-Call an Backend
    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.success = 'Registrierung erfolgreich!';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.error = err.error?.error || 'Registrierung fehlgeschlagen.';
      }
    });
  }
}
