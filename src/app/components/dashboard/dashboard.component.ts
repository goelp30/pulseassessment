import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from '../../models/subject';
import { AuthService } from '../../../sharedServices/auth.service';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { PageLabelService } from '../../../sharedServices/pagelabel.service';

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule, RouterOutlet], 
  templateUrl: './dashboard.component.html', 
})
export class DashboardComponent implements OnInit {
  currentPage: string = 'Manage Subjects';
  subjects: Subject[] = [];
  isMenuOpen: boolean = false; // To toggle popup menu
  userFirstName: string = '';

  navItems = [
    { label: 'Manage Subjects', route: '/subjects', icon: 'fas fa-book' },
    { label: 'Manage Assessment', route: '/assessment-list', icon: 'fas fa-clipboard-list' },
    { label: 'Generate Link', route: '/generatelink', icon: 'fas fas fa-link' },
    { label: 'Assessment Records', route: '/assessmentrecords', icon: 'fas fa-history' },
    { label: 'Evaluate Assessments ', route: '/evaluation', icon: 'fas fa-chart-line' },
  ];
  private routeLabelMap: { [key: string]: string } = {
    '/subjects': 'Manage Subjects',
    '/questions': 'Manage Questions', 
    '/generatelink': 'Generate Link',
    '/assessment-list': 'Manage Assessment',
    '/assessmentrecords': 'Assessment Records',
    '/evaluation': 'Evaluate Assessments'
  };

  constructor(
    private auth: AuthService, private router: Router,
    private pageLabelService: PageLabelService  
  ) { }

  ngOnInit(): void {
    this.userFirstName = sessionStorage.getItem('userFirstName') || '';

    // Subscribe to the currentPage observable
    this.pageLabelService.currentPage$.subscribe(label => {
      this.currentPage = label;
    });

    // Listen for route changes to update the label
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updatePageLabel(event.urlAfterRedirects);
      }
    });
  }
  updatePageLabel(url: string): void {
    const label = this.routeLabelMap[url] || 'Dashboard';  // Fallback to 'Dashboard'
    this.pageLabelService.updatePageLabel(label);  // Update the label through the service
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.auth.logout();
    this.isMenuOpen = false; // Close the menu after logout
  }

  setCurrentPage(page: any): void {
    this.pageLabelService.updatePageLabel(page.label);  // Update label when a page is clicked
    this.router.navigate([page.route]);
  }
}