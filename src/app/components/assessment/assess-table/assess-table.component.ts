import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';

@Component({
  selector: 'app-assess-table',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './assess-table.component.html',
  styleUrls: ['./assess-table.component.css']
})
export class AssessTableComponent implements OnInit {
  assessments: Assessment[] = [];
  tableColumns: string[] = ['assessmentId', 'assessmentName','assessmentType'];  // Column names to be passed to TableComponent

  // Define column aliases for the table
  columnAliases: { [key: string]: string[] } = {
    assessmentId: ['Assessment ID'],
    assessmentName: ['Assessment Name'],
    assessmentType: ['Assessment Type']
  };
  

  // Define the tableName that can be used in the child component
  tableName: string = TableNames.Assessment;

  constructor(private auth: AuthService, private fireBaseService: FireBaseService<Assessment>) { }

  ngOnInit(): void {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
  }

  logout() {
    this.auth.logout();
  }

  addAssessment() {
    const uniqueId = crypto.randomUUID();
    const assess: Assessment = {
      assessmentId: uniqueId,
      assessmentName: (Math.random() + 1).toString(36).substring(7),
      assessmentType: 'internal',
      subjectId: '',
      subjectName: '',
      dateCreated: 0
    };
    this.fireBaseService.create(TableNames.Assessment + '/' + uniqueId, assess);
  }

  getAssessment() {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.assessments = res as Assessment[];
      console.log(this.assessments);
    });
  }
}
