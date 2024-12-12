import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from '../../models/subject';
import { TableNames } from '../../enums/TableName';
import { AuthService } from '../../../sharedServices/auth.service';
import { FireBaseService } from '../../../sharedServices/FireBaseService';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Indicates that this component is standalone
  imports: [CommonModule], // Modules imported for this component
  templateUrl: './dashboard.component.html', // Path to HTML file
  // styleUrls: ['./dashboard.component.css'], // Path to CSS file
})
export class DashboardComponent implements OnInit {
  currentPage: string = 'dashboard';
  subjects: Subject[] = [];
  isMenuOpen: boolean = false; // To toggle popup menu

  navItems = [
    { label: 'Dashboard', route: 'dashboard', icon: 'fas fa-home' },
    { label: 'Add Subject', route: 'add-subject', icon: 'fas fa-plus' },
    { label: 'Get Subjects', route: 'get-subjects', icon: 'fas fa-list' },
    { label: 'Assessment List', route: 'assessment-list', icon: 'fas fa-tasks' },
    { label: 'Quiz Home', route: 'quiz-home', icon: 'fas fa-question-circle' },
  ];

  constructor(
    private auth: AuthService,
    private fireBaseService: FireBaseService<Subject>
  ) {}

  ngOnInit(): void {
    this.getSubject();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.isMenuOpen = false; // Close the menu after logout
  }

  setCurrentPage(page: string): void {
    this.currentPage = page;
    if (page === 'get-subjects') {
      this.getSubject();
    }
  }

  addSubject(): void {
    const uniqueId = crypto.randomUUID();
    const sub: Partial<Subject>  = {
      subjectId: uniqueId,
      subjectName: (Math.random() + 1).toString(36).substring(7),
    };
    this.fireBaseService
      .create(TableNames.Subject + '/' + uniqueId, sub)
      .then(() => {
        this.getSubject(); // Refresh the subject list after adding
      });
  }

  getSubject(): void {
    this.fireBaseService
      .getAllData(TableNames.Subject)
      .subscribe((res) => {
        this.subjects = res as Subject[];
      });
  }
}
