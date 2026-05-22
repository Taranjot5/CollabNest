import { Component } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {

  // =========================
  // FORM FIELDS
  // =========================

  name = '';

  email = '';

  password = '';

  // =========================
  // UI STATES
  // =========================

  loading = false;

  errorMessage = '';

  // =========================
  // CONSTRUCTOR
  // =========================

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register() {

    // VALIDATION

    if (
      !this.name ||
      !this.email ||
      !this.password
    ) {

      this.errorMessage =
        'Please fill all fields';

      return;
    }

    try {

      this.loading = true;

      this.errorMessage = '';

      // FIREBASE REGISTER

      await this.authService.register(

        this.name,

        this.email,

        this.password
      );

      // REDIRECT

      this.router.navigate([
        '/workspace'
      ]);

    } catch (error: any) {

      this.errorMessage =
        error.message;

    } finally {

      this.loading = false;
    }
  }
}