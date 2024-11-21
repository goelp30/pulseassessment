import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../sharedServices/auth.service';
import { SubjectService } from '../../../sharedServices/subject.service'; 
import { Subject } from '../../models/subject';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
  
  subjects: Subject[] = [];

  constructor(private auth : AuthService, private subjectService: SubjectService) { }

  ngOnInit(): void {
    this.subjectService.listensToSubjectChange().subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    });
  }

  /**
   * 
   * @returns logout user
   */
  logout() {
    this.auth.logout();
  }


  /**
   * Add new subject
   */
  addSubject() {
    this.subjectService.createSubject(this.subjects.length + 1, (Math.random() + 1).toString(36).substring(7));
  }

  /**
   * get all subject
   */
  getSubject() {
    this.subjectService.getAllSubjectChange().subscribe((res) => {
      this.subjects = res as Subject[];
    })
  }
}
