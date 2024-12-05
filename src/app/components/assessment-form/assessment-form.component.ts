import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
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
})
export class AssessmentFormComponent implements OnInit, OnChanges {
  assessmentForm: FormGroup;
  questionTypes = ['easy', 'medium', 'hard', 'descriptive'];
  optionTypes = ['single', 'multi'];
  subjects: any[] = [];
  questionCounter = 1; // Counter for unique question IDs

  subjectId: string = '';
  subjectName: string = '';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FireBaseService<any>
  ) {
    this.assessmentForm = this.fb.group({
      questionType: ['', Validators.required],
      optionType: [''],
      questionText: ['', Validators.required],
      options: this.fb.array([]),
      correctOptions: [''], // For storing correct answers
      timer: [0, [Validators.required, Validators.min(1)]],
      maxMarks: [1, [Validators.required, Validators.min(1)]], // User-defined max marks
    });

    // Listen to changes in questionType
    this.assessmentForm.get('questionType')?.valueChanges.subscribe((type) => {
      if (type === 'descriptive') {
        this.assessmentForm.get('optionType')?.setValue('descriptive');
        this.options.clear(); // Remove options for descriptive questions
      } else if (type === 'single') {
        this.assessmentForm.get('optionType')?.setValue('single');
      } else {
        this.assessmentForm.get('optionType')?.setValue('multi');
      }
    });
  }

  ngOnInit(): void {
    this.firebaseService.getAllData('subject').subscribe(
      (data) => {
        this.subjects = data;
        console.log(this.subjects);
        this.subjects.forEach((sub) => {
          this.subjectId = sub.subjectId;
          this.subjectName = sub.subjectName;
          this.createQuestions(this.subjectId, this.subjectName); // Process each subject
        });
      },
      (error) => console.error('Error fetching assessments:', error)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.createQuestions(this.subjectId, this.subjectName);
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

 

  // onSubmit(): any {
  //   if (this.assessmentForm.valid) {
  //     const formData = this.assessmentForm.value;
  //     const questionId = Date.now().toString(); // Ensure correct ID format
  //     const formattedData = {
  //       [this.subjectId]: {
  //         [formData.questionType]: {
  //           [questionId]: {
  //             type: formData.optionType || 'Descriptive',
  //             text: formData.questionText,
  //             options: this.options.length ? formData.options : [],
  //             correct: formData.correctOptions
  //               .split(',')
  //               .map((item: string) => item.trim()),
  //             timer: formData.timer,
  //             max_marks: formData.maxMarks,
  //             createdOn: new Date().toISOString(),
  //             updatedOn: new Date().toISOString(),
  //             isDisabled: false,
  //           },
  //         },
  //       },
  //     };
  //     console.log(formattedData);
  //     // return formattedData; // Return formatted data
  //   } else {
  //     console.log('Form is invalid');
  //     return null;
  //   }
  // }

  onSubmit(): any {
    if (this.assessmentForm.valid) {
      const formData = this.assessmentForm.value;
      const questionId = Date.now().toString();
      const formattedData = {
        [this.subjectId]: {
          [formData.questionType]: {
            [questionId]: {
              type: formData.optionType, // Use dynamically set value
              text: formData.questionText,
              options: formData.optionType !== 'descriptive' ? formData.options : [],
              correct: formData.correctOptions
                .split(',')
                .map((item: string) => item.trim()),
              timer: formData.timer,
              max_marks: formData.maxMarks,
              createdOn: new Date().toISOString(),
              updatedOn: new Date().toISOString(),
              isDisabled: false,
            },
          },
        },
      };
      console.log(formattedData);
    } else {
      console.log('Form is invalid');
      return null;
    }
  }
  
  createQuestions(subjectId: string, subjectName: string): void {
    const quizData = this.onSubmit(); // Get formatted data from onSubmit
    //   if (quizData) {
    //     // Ensure valid data
    //     console.log('id: ', subjectId, 'Name: ', subjectName);
    //     this.firebaseService
    //       .create(`questions/${subjectId}`, quizData)
    //       .then(() => {
    //         console.log('Quiz data added successfully!');
    //       })
    //       .catch((error) => {
    //         console.error('Error adding quiz data:', error);
    //       });
    //   } else {
    //     console.error('Invalid data. Quiz data not sent to Firebase.');
    //   }
    // }
  }
}
