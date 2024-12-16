import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthService } from '../sharedServices/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pulseassessment';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {
      console.log(authService.isLoggedIn.value);
      authService.isLoggedIn.subscribe((val) => this.isLoggedIn = val);
  }
}
