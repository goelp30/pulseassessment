import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../sharedServices/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  email : string = '';
  password : string = '';

  constructor(private auth : AuthService, private router: Router) {
    auth.isLoggedIn.subscribe((val) => val === true ? this.router.navigate(['/subjects']) : this.router.navigate(['/login']));
  }

  /**
   *
   * @returns To login and redirect to dashboard
   */
  login() {
    if(this.email == '') {
      alert('Please enter email');
      return;
    }

    if(this.password == '') {
      alert('Please enter password');
      return;
    }

    this.auth.login(this.email,this.password);
    this.email = '';
    this.password = '';
  }
}
