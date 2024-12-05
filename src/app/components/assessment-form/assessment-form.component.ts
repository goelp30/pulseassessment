import { Component,OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-assessment-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './assessment-form.component.html',
  styleUrl: './assessment-form.component.html',
})
export class AssessmentFormComponent implements OnInit {
  assessmentForm: FormGroup;
  questionTypes = ['easy', 'medium', 'hard', 'descriptive'];
  optionTypes = ['single', 'multi'];
  subjects: any[] = [];
  questionCounter = 1; // Counter for unique question IDs

  subjectId: string = '';
  subjectName: string = '';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FireBaseService<any> // Adjust generic type if needed
  ) {
    this.assessmentForm = this.fb.group({
      questionType: ['', Validators.required],
      optionType: [''],
      questionText: ['', Validators.required],
      options: this.fb.array([]),
      correctOptions: [''],
      timer: [0, [Validators.required, Validators.min(1)]],
      maxMarks: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.firebaseService.getAllData('subject').subscribe(
      (data) => {
        this.subjects = data;
        console.log(this.subjects);
        this.subjects.map((sub) => {
          (this.subjectName = sub.subjectName),
            (this.subjectId = sub.subjectId);
        });
      },
      (error) => console.error('Error fetching assessments:', error)
    );

    // Ensure correctOptions are updated only if not descriptive
    this.assessmentForm.get('questionType')?.valueChanges.subscribe((type) => {
      if (type === 'descriptive') {
        this.assessmentForm.get('optionType')?.setValue('descriptive');
        this.assessmentForm.get('correctOptions')?.clearValidators();
        this.assessmentForm.get('correctOptions')?.setValue('');
        this.options.clear(); // Clear any existing options
      } else {
        this.assessmentForm
          .get('correctOptions')
          ?.setValidators(Validators.required);
        this.assessmentForm.get('correctOptions')?.updateValueAndValidity();
      }
    });
  }

  get options(): FormArray {
    return this.assessmentForm.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  createQuestions(): void {
    if (this.assessmentForm.valid) {
      const formData = this.assessmentForm.value;
      const questionId = Date.now().toString(); // Unique question ID

      const formattedData = {
        optionType: formData.optionType,
        questionLevel: formData.questionType,
        text: formData.questionText,
        options: formData.optionType !== 'descriptive' ? formData.options : [],
        correct:
          formData.optionType !== 'descriptive'
            ? formData.correctOptions
                .split(',')
                .map((item: string) => item.trim())
            : [], // No correct options for descriptive
        timer: formData.timer,
        max_marks: formData.maxMarks,
        createdOn: new Date().toISOString(),
        updatedOn: new Date().toISOString(),
        isDisabled: false,
      };
      console.log(formattedData);
      // Send data to the path organized by subject ID
      this.firebaseService
        .create(`questions/${this.subjectId}/${questionId}`, formattedData)
        .then(() => {
          console.log(
            'Question added successfully to subject:',
            this.subjectId
          );
        })
        .catch((error) => {
          console.error('Error adding question:', error);
        });
    } else {
      console.log('Form is invalid');
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.subjectId) {
      console.log('Subject ID is not available. Please try again later.');
      return;
    }

    if (this.assessmentForm.valid) {
      this.createQuestions(); // Call the method directly
    } else {
      console.log('Form is invalid');
    }
  }
}
