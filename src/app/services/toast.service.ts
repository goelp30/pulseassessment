import { Injectable } from '@angular/core';
import Toastify from 'toastify-js';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private showToast(message: string, background: string) {
    Toastify({
      text: message,
      duration: 5000,
      gravity: "bottom",
      position: "right",
      className: "custom-toast",
      style: {
        background
      }
    }).showToast();
  }

  showSuccess(message: string) {
    this.showToast(message, "linear-gradient(to right, #22c55e, #16a34a)");
  }

  showWarning(message: string) {
    this.showToast(message, "linear-gradient(to right, #eab308, #f59e0b)");
  }

  showError(message: string) {
    this.showToast(message, "linear-gradient(to right, #ef4444, #dc2626)");
  }

  showInfo(message: string) {
    this.showToast(message, "linear-gradient(to right, #3b82f6, #2563eb)");
  }
}