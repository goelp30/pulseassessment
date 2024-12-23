import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from "../../common/button/button.component";

@Component({
  selector: 'app-evaluation-header',
  standalone: true,
  imports: [FormsModule, CommonModule, ButtonComponent],
  templateUrl: './evaluation-header.component.html',
  styleUrl: './evaluation-header.component.css',
})
export class EvaluationHeaderComponent {
  @Input() assessmentName: string = '';
  @Input() userMarks: number = 0;
  @Input() totalMarks: number = 0;
  @Input() result?: string;
  @Output() backClick: EventEmitter<void> = new EventEmitter<void>();
//Back Button
  onBackClick() {
    this.backClick.emit();
  }
}
