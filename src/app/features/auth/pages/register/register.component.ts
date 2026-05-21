import { Component } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})

export class RegisterComponent {

  name = '';

  email = '';

  password = '';

  loading = false;

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // =========================
  // REGISTER
  // =========================

  async register() {

    try {

      this.loading = true;

      this.errorMessage = '';

      await this.authService.register(

        this.name,
        this.email,
        this.password
      );

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