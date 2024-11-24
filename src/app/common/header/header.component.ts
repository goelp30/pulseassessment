import { Component } from '@angular/core';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { Subject } from '../../models/subject';
import { TableNames } from '../../enums/TableName';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  subjects: Subject[] = [];

  constructor(private fireBaseService: FireBaseService<Subject>){

  }
  ngOnInit(): void {
    this.fireBaseService.listensToChange(TableNames.Subject).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    });
  }
  addSubject() {
    const uniqueId = crypto.randomUUID();
    let sub: Subject = {
      subjectId: uniqueId,
      subjectName: (Math.random() + 1).toString(36).substring(7)
    }
    this.fireBaseService.create(TableNames.Subject + '/' + uniqueId, sub);
  }
  getSubject() {
    this.fireBaseService.getAllData(TableNames.Subject).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    })
  }

}
