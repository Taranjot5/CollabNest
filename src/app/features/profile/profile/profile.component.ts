import { Component, OnInit } from '@angular/core';

import { AuthService } from '../../../core/services/auth.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',

  templateUrl: './profile.component.html',

  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent
  implements OnInit {

  isEditing = false;
  uid = '';

  loading = true;

  saving = false;

  name = '';

  email = '';

  bio = '';

  department = '';

  designation = '';

  constructor(
    private route: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {


    this.authService
      .getCurrentUser()
      .subscribe(user => {

        if (!user) {

          this.loading = false;

          return;
        }

        this.uid = user.uid;

        this.loadProfile();
      });


  }

  editProfile() {

    this.isEditing = true;
  }

  cancelEdit() {

    this.isEditing = false;

    this.loadProfile();
  }

  loadProfile() {


    this.authService
      .getUserById(this.uid)
      .subscribe((user: any) => {

        if (!user) {

          this.loading = false;

          return;
        }

        this.name =
          user.name || '';

        this.email =
          user.email || '';

        this.bio =
          user.bio || '';

        this.department =
          user.department || '';

        this.designation =
          user.designation || '';

        this.loading = false;
      });


  }

  async saveProfile() {


    try {

      this.saving = true;

      await this.authService
        .updateProfile(

          this.uid,

          {

            name:
              this.name,

            bio:
              this.bio,

            department:
              this.department,

            designation:
              this.designation
          }
        );

      this.isEditing = false;

      alert(
        'Profile updated successfully'
      );

    } catch (error) {

      console.error(
        'Profile update failed',
        error
      );

      alert(
        'Failed to update profile'
      );

    } finally {

      this.saving = false;
    }

    this.route.navigate(['/workspace']);

  }
}
