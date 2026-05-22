import { Component, OnInit } from '@angular/core';

import {
  NotificationService,
  Notification
} from '../../../../core/services/notification.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss']
})

export class NotificationListComponent
implements OnInit {

  notifications: Notification[] = [];

  loading = true;

  constructor(
    private notificationService:
    NotificationService
  ) {}

  // =========================
  // INIT
  // =========================

  ngOnInit(): void {

    this.loadNotifications();
  }

  // =========================
  // LOAD NOTIFICATIONS
  // =========================

  loadNotifications() {

    this.notificationService
      .getNotifications()
      .subscribe(data => {

        this.notifications = data;

        this.loading = false;
      });
  }

  // =========================
  // MARK AS READ
  // =========================

  async markAsRead(id?: string) {

    if (!id) return;

    await this.notificationService
      .markAsRead(id);
  }

  // =========================
  // DELETE NOTIFICATION
  // =========================

  async deleteNotification(id?: string) {

    if (!id) return;

    await this.notificationService
      .deleteNotification(id);
  }
}