import { Component, OnInit } from '@angular/core';
import { Subject } from '../../models/subject';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { TableNames } from '../../enums/TableName';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  subjects: Subject[] = [];
  constructor(private fireBaseService:FireBaseService<Subject>){

  }

  ngOnInit(): void {
    // Fetch subjects from the service
    this.fireBaseService.getAllData(TableNames.Subject).subscribe((res) => {
      this.subjects = res as Subject[];
      console.log(this.subjects);
    });

}
}
