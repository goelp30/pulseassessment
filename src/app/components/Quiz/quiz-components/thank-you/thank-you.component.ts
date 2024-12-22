import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css'],
})
export class ThankYouComponent {
  constructor() {
    // Add Font Awesome CDN dynamically
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href =
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
  }
}
