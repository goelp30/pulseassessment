import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css'; // Import Prism's default theme
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';


@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {
  @Input() question: any;
  @Input() options: any[]=[];
  @Input() userAnswer: any;
  @Input() answer: any;  // For Descriptive answers
  @Input() marks: number=0;
  @Input() assignedMarks: number=0;
  @Input() isDisabled: boolean = false;// Ensure this is defined as an Input
  @Output() marksChanged = new EventEmitter<any>();


onMarksChange(): void {
    this.question.assigned_marks = this.question.assignedMarks;
    this.marksChanged.emit(this.question); // Emit the question when marks change
  }

  
  // highlightSyntax(code: string): string {
  //   if (!code) {
  //     return ''; // Return empty if there is no input
  //   }
  
  //   // Highlight the code using PrismJS
  //   return Prism.highlight(code, Prism.languages['javascript'], 'javascript'); // Adjust the language as needed
  // }
  // highlightSyntax(code: string): string {
  //   const highlightedCode = Prism.highlight(
  //     code,
  //     Prism.languages['javascript'], // Change to your desired language
  //     'javascript'
  //   );
  //   return `<pre>${highlightedCode}</pre>`;
  // }
  // highlightSyntax(code: string): string {
  //   const highlightedCode = Prism.highlight(
  //     code,
  //     Prism.languages['javascript'], // Adjust language (e.g., javascript, python)
  //     'javascript'
  //   );
  //   return `<pre class="bg-gray-100 p-4 rounded-lg font-mono text-sm"><code>${highlightedCode}</code></pre>`;
  // }

  // highlightSyntax(code: string): string {
  //   const highlightedCode = Prism.highlight(
  //     code,
  //     Prism.languages['javascript'], // Adjust language as needed
  //     'javascript'
  //   );
  //   return `<pre class="bg-gray-100 p-4 rounded-lg font-mono text-sm"><code>${highlightedCode}</code></pre>`;
  // }

  highlightSyntax(code: string): string {
    const highlightedCode = Prism.highlight(
      code,
      Prism.languages['python'], // Use Python language syntax
      'python'
    );
    return `<pre class="bg-gray-100 p-4 rounded-lg font-mono text-sm"><code>${highlightedCode}</code></pre>`;
  }
}
