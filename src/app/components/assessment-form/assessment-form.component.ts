import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-assessment-form',
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.css']
})
export class AssessmentFormComponent implements OnInit {
  assessmentForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.assessmentForm = this.fb.group({
      easy: this.createQuestionGroup('single', 1),
      medium: this.createQuestionGroup('multi', 3),
      hard: this.createQuestionGroup('multi', 5),
      descriptive: this.fb.group({
        text: ['', Validators.required],
        max_marks: [10, Validators.required]
      })
    });
  }

  createQuestionGroup(type: string, maxMarks: number): FormGroup {
    return this.fb.group({
      type: [type, Validators.required],
      text: ['', Validators.required],
      options: this.fb.array([], Validators.required),
      correct: this.fb.array([], Validators.required),
      max_marks: [maxMarks, Validators.required]
    });
  }

  getOptions(groupName: string): FormArray {
    return this.assessmentForm.get(`${groupName}.options`) as FormArray;
  }

  addOption(groupName: string): void {
    this.getOptions(groupName).push(new FormControl('', Validators.required));
  }

  onSubmit(): void {
    if (this.assessmentForm.valid) {
      console.log('Form Data:', this.assessmentForm.value);
    }
  }
}
