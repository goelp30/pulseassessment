import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  show(message: string, type: Notification['type'] = 'info') {
    this.notificationSubject.next({ message, type });
  }
}