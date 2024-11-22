import { Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { Subject } from '../../models/subject';
import { TableNames } from '../../enums/TableName';
import * as bootstrap from 'bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  templateUrl: './assessment-list.component.html',
  styleUrls: ['./assessment-list.component.css'],
  imports: [CommonModule , FormsModule]
})
export class AssessmentListComponent implements OnInit {
  subjects: Subject[] = [];
  selectedSubject: Subject = { subjectId: '', subjectName: '' };
  isEditing: boolean = false;

  constructor(private fireBaseService: FireBaseService<Subject>) {}

  ngOnInit(): void {
    this.getSubjects();
  }

  getSubjects() {
    this.fireBaseService.getAllData(TableNames.Subject).subscribe((res) => {
      this.subjects = res as Subject[];
    });
  }

  editSubject(subject: Subject) {
    this.selectedSubject = { ...subject };
    this.isEditing = true;

    // Open the modal programmatically
    const modalElement = document.getElementById('subjectModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  saveSubject() {
    if (this.isEditing) {
      this.fireBaseService.update(
        `${TableNames.Subject}/${this.selectedSubject.subjectId}`,
        this.selectedSubject
      );
    } else {
      const uniqueId = crypto.randomUUID();
      this.selectedSubject.subjectId = uniqueId;
      this.fireBaseService.create(
        `${TableNames.Subject}/${uniqueId}`,
        this.selectedSubject
      );
    }
    this.getSubjects();
    this.isEditing = false;
    this.selectedSubject = { subjectId: '', subjectName: '' };
  }
}
