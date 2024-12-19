import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from '../../models/subject';
import { AuthService } from '../../../sharedServices/auth.service';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Indicates that this component is standalone
  imports: [CommonModule, RouterOutlet], // Modules imported for this component
  templateUrl: './dashboard.component.html', // Path to HTML file
})
export class DashboardComponent implements OnInit {
  currentPage: string = 'Manage Subjects';
  subjects: Subject[] = [];
  isMenuOpen: boolean = false; // To toggle popup menu
  userFirstName: string = '';

  navItems = [
    { label: 'Manage Subjects', route: '/subjects', icon: 'fas fa-plus' },
    { label: 'Generate Link', route: '/generatelink', icon: 'fas fa-question-circle' },
    { label: 'Manage Assessment', route: '/assessment-list', icon: 'fas fa-question-circle' },
    { label: 'Assessment Records', route: '/assessmentrecords', icon: 'fas fa-question-circle' },
    { label: 'Evaluation dashboard ', route: '/evaluation', icon: 'fas fa-question-circle' },
  ];

  constructor(
    private auth: AuthService, private router: Router
  ) { }

  ngOnInit(): void {
    this.userFirstName = sessionStorage.getItem('userFirstName') || '';
  }

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