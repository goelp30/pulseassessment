import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from '../../models/subject';
import { AuthService } from '../../../sharedServices/auth.service';
import { Router, RouterOutlet } from '@angular/router';
import { FireBaseService } from '../../../sharedServices/FireBaseService';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Indicates that this component is standalone
  imports: [CommonModule, RouterOutlet], // Modules imported for this component
  templateUrl: './dashboard.component.html', // Path to HTML file
})
export class DashboardComponent {
  currentPage: string = 'Manage Subjects';
  subjects: Subject[] = [];
  isMenuOpen: boolean = false; // To toggle popup menu

  navItems = [
    { label: 'Manage Subjects', route: '/subjects', icon: 'fas fa-plus' },
    { label: 'Generate Link', route: '/generatelink', icon: 'fas fa-question-circle' },
    { label: 'Manage Assessment', route: '/assessment-list', icon: 'fas fa-question-circle' },
  ];

  constructor(
    private auth: AuthService, private router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.isMenuOpen = false; // Close the menu after logout
  }

  setCurrentPage(page: any): void {
    this.currentPage = page.label;
    this.router.navigate([page.route]);
  }
}
