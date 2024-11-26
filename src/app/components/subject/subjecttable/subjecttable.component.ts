// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-subjecttable',
//   standalone: true,
//   imports: [],
//   templateUrl: './subjecttable.component.html',
//   styleUrl: './subjecttable.component.css'
// })
// export class SubjecttableComponent {

// }
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../sharedServices/auth.service';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import { TableNames } from '../../../enums/TableName';
import { TableComponent } from '../../common/table/table.component';

@Component({
  selector: 'app-subjecttable',
    standalone: true,
    imports: [TableComponent],
    templateUrl: './subjecttable.component.html',
    styleUrl: './subjecttable.component.css'
})
export class SubjectTableComponent implements OnInit {
  subjects: Subject[] = [];
  tableColumns: string[] = ['subjectId', 'subjectName'];  // Column names to be passed to TableComponent

  // Define column aliases for the table
  columnAliases: { [key: string]: string[] } = {
    subjectId: ['Subject Id'],
    subjecttName: ['Subject Name'],
  };
  

  // Define the tableName that can be used in the child component
  tableName: string = TableNames.Subject;

  constructor(private auth: AuthService, private fireBaseService: FireBaseService<Subject>) { }

  ngOnInit(): void {
    this.fireBaseService.getAllData(this.tableName).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    });
  }
}
