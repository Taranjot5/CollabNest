import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/compat/auth';

import { take } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';

import { RolePermissionService } from '../../../../core/services/role-permission.service';

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
    private rolePermission: RolePermissionService,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {

    const reason = this.route.snapshot.queryParamMap.get('reason');

    if (reason === 'deactivated') {
      this.errorMessage = 'Your account has been deactivated. Contact your administrator.';
    }

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

      const user = await this.afAuth.currentUser;

      if (user) {
        const profile = await this.authService
          .getUserById(user.uid)
          .pipe(take(1))
          .toPromise();

        if (!this.rolePermission.isActive(profile)) {
          await this.authService.logout();
          this.errorMessage = 'Your account has been deactivated. Contact your administrator.';
          return;
        }
      }

      this.router.navigate(['/dashboard']);

    } catch (error: any) {

      this.errorMessage = error.message;

    } finally {

      this.loading = false;
    }
  }

  async loginWithGoogle() {

    try {

      await this.authService.googleLogin();

      const user = await this.afAuth.currentUser;

      if (user) {
        const profile = await this.authService
          .getUserById(user.uid)
          .pipe(take(1))
          .toPromise();

        if (!this.rolePermission.isActive(profile)) {
          await this.authService.logout();
          this.errorMessage = 'Your account has been deactivated. Contact your administrator.';
          return;
        }
      }

      this.router.navigate(['/dashboard']);

    } catch (error: any) {

      this.errorMessage = error.message;
    }
  }
}