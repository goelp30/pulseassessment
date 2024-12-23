import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from "../../common/button/button.component";
import { SentenceCasePipe } from "../service/sentence-case.pipe";

@Component({
  selector: 'app-evaluation-header',
  standalone: true,
  imports: [FormsModule, CommonModule, ButtonComponent, SentenceCasePipe],
  templateUrl: './evaluation-header.component.html',
  styleUrl: './evaluation-header.component.css',
})
export class EvaluationHeaderComponent {
  @Input() assessmentName: string = '';
  @Input() userMarks: number = 0;
  @Input() totalMarks: number = 0;
  @Input() result?: string;
  @Output() backClick: EventEmitter<void> = new EventEmitter<void>();
  onBackClick() {
    this.backClick.emit();
  }
}
