import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (message) {
      <div 
        class="fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md transition-opacity duration-300"
        [class]="getNotificationClass()">
        {{ message }}
      </div>
    }
  `
})
export class NotificationComponent implements OnDestroy {
  message: string = '';
  type: string = 'info';
  private subscription: Subscription;
  private timeout: any;

  constructor(private notificationService: NotificationService) {
    this.subscription = this.notificationService.notifications$.subscribe(notification => {
      this.showNotification(notification.message, notification.type);
    });
  }

  private showNotification(message: string, type: string) {
    this.message = message;
    this.type = type;

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  getNotificationClass(): string {
    const baseClasses = 'text-white';
    switch (this.type) {
      case 'error':
        return `${baseClasses} bg-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-500`;
      case 'success':
        return `${baseClasses} bg-green-500`;
      default:
        return `${baseClasses} bg-blue-500`;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}