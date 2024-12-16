import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  public isLoggedIn = new BehaviorSubject<boolean>(false);

  constructor(private fireauth : AngularFireAuth, private router : Router) {

  }

  /**
   * 
   * @param email login method
   * @param password 
   */
  login(email : string, password : string) {
    this.fireauth.signInWithEmailAndPassword(email,password).then( res => {
        this.isLoggedIn.next(true);
        this.router.navigate(['/subjects']);
    }, err => {
        alert(err.message);
        this.router.navigate(['/login']);
    })
  }

  /**
   * register method
   * @param email 
   * @param password 
   */
  register(email : string, password : string) {
    this.fireauth.createUserWithEmailAndPassword(email, password).then( res => {
      alert('Registration Successful');
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
      this.router.navigate(['/register']);
    })
  }

  /**
   * Sign out
   */
  logout() {
    this.fireauth.signOut().then( () => {
      this.isLoggedIn.next(false);
      this.router.navigate(['/login']);
    }, err => {
      alert(err.message);
    })
  }
}