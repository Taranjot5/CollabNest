import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { NotificationsRoutingModule } from './notifications-routing.module';

import { NotificationListComponent } from './pages/notification-list/notification-list.component';

import { MatCardModule } from '@angular/material/card';

import { MatButtonModule } from '@angular/material/button';

import { MatIconModule } from '@angular/material/icon';

@NgModule({

  declarations: [

    NotificationListComponent
  ],

  imports: [

    CommonModule,

    FormsModule,

    NotificationsRoutingModule,

    MatCardModule,

    MatButtonModule,

    MatIconModule
  ]
})

export class NotificationsModule {}