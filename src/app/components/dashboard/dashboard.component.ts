import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../sharedServices/auth.service';
import { FireBaseService } from '../../../sharedServices/FireBaseService'; 
import { Subject } from '../../models/subject';
import { TableNames } from '../../enums/TableName';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
  
  subjects: Subject[] = [];

  constructor(private auth : AuthService, private fireBaseService: FireBaseService<Subject>) { }

  ngOnInit(): void {
    this.fireBaseService.listensToChange(TableNames.Subject).subscribe((res) => {
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
    let sub: Subject = {
      subjectId: this.subjects.length + 1,
      subjectName: (Math.random() + 1).toString(36).substring(7)
    }
    this.fireBaseService.create(TableNames.Subject + '/' + this.subjects.length + 1, sub);
  }

  /**
   * get all subject
   */
  getSubject() {
    this.fireBaseService.getAllData(TableNames.Subject).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    })
  }
}
