import { Component, OnInit } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';

import { UserManagementService } from '../../../../core/services/user-management.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  name = '';

  email = '';

  password = '';

  confirmPassword = '';

  loading = false;

  checkingBootstrap = true;

  registrationClosed = false;

  isBootstrap = false;

  errorMessage = '';

  constructor(
    private authService: AuthService,
    private userManagement: UserManagementService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {

    try {
      const hasSuperAdmin = await this.userManagement.hasSuperAdmin();
      this.registrationClosed = hasSuperAdmin;
      this.isBootstrap = !hasSuperAdmin;
    } catch {
      this.errorMessage = 'Unable to verify setup. Check your connection and try again.';
      this.registrationClosed = false;
      this.isBootstrap = true;
    } finally {
      this.checkingBootstrap = false;
    }
  }

  async register(): Promise<void> {

    if (this.registrationClosed) {
      this.errorMessage = 'Public registration is closed. Contact your Super Admin for an account.';
      return;
    }

    if (!this.name || !this.email || !this.password) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    try {
      this.loading = true;
      this.errorMessage = '';

      await this.authService.register(this.name, this.email, this.password);
      this.router.navigate(['/dashboard']);

    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'permission-denied' || error?.message?.includes('permission')) {
        this.errorMessage = 'Registration blocked by Firestore rules. Deploy the latest firestore.rules and try again.';
      } else {
        this.errorMessage = error.message || 'Registration failed';
      }
    } finally {
      this.loading = false;
    }
  }
}
