import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import { TableNames } from '../../../enums/TableName';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports:[NgClass]
})
export class HeaderComponent {
  @Input() title: string = '';  // Title for the header
  @Input() subtitle: string = '';  // Subtitle for additional information
  @Input() buttonLabel: string = 'Add Subjects';  // Label for the button
  @Input() buttonClasses: string = '';  // CSS classes for the button
  @Output() addSubjectEvent = new EventEmitter<void>();  // Event emitter for adding a subject

  constructor(private fireBaseService: FireBaseService<Subject>) {}

  ngOnInit(): void {
    // Your existing code to load subjects (optional)
    this.fireBaseService.listensToChange(TableNames.Subject).subscribe((res) => {
      console.log(res);
    });
  }

  onAddSubjectClick() {
    this.addSubjectEvent.emit();  // Emit event to trigger subject addition
  }``
}
