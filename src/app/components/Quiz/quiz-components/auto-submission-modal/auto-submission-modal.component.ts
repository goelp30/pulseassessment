import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auto-submission-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auto-submission-modal.component.html',
})
export class AutoSubmissionModalComponent {
  @Input() show = false;
  @Output() onOkClick = new EventEmitter<void>();

  handleOkClick() {
    this.onOkClick.emit();
  }
}
