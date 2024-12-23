import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div
        class="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center"
      >
        <div class="mb-6">
          <svg
            class="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
        <p class="text-gray-600 mb-8">
          Your quiz has been submitted successfully. We appreciate your
          participation.
        </p>
        <button
          (click)="goToHome()"
          class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          Back to Home
        </button>
      </div>
    </div>
  `,
})
export class ThankYouComponent {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']);
  }
}
