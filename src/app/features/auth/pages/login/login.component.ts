import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;

  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loginForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ]
    });
  }

  async onLogin() {

    if (this.loginForm.invalid) return;

    this.loading = true;

    try {

      const { email, password } =
        this.loginForm.value;

      await this.authService.login(
        email,
        password
      );

      this.router.navigate(['/workspace']);

    } catch (error: any) {

      this.errorMessage = error.message;

    } finally {

      this.loading = false;
    }
  }

  async loginWithGoogle() {

    try {

      await this.authService.googleLogin();

      this.router.navigate(['/workspace']);

    } catch (error: any) {

      this.errorMessage = error.message;
    }
  }
}