import { Injectable } from '@angular/core';
import Toastify from 'toastify-js';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private showToast(message: string, background: string) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "bottom",
      position: "right",
      style: {
        background
      }
    }).showToast();
  }

  showSuccess(message: string) {
    this.showToast(message, "linear-gradient(to right, #00b09b, #96c93d)");
  }

  showWarning(message: string) {
    this.showToast(message, "linear-gradient(to right, #ffa35f, #ff7b00)");
  }

  showError(message: string) {
    this.showToast(message, "linear-gradient(to right, #ff5f6d, #ffc371)");
  }

  showInfo(message: string) {
    this.showToast(message, "linear-gradient(to right, #2193b0, #6dd5ed)");
  }
}

