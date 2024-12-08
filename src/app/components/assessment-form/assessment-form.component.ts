import { Component, OnChanges, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-assessment-form',
  standalone:true,
  imports:[ReactiveFormsModule,NgIf,NgFor],
  templateUrl: './assessment-form.component.html',
  styleUrls: ['./assessment-form.component.css'],
})
export class AssessmentFormComponent implements OnInit {
  assessmentForm: FormGroup;
  questionTypes = ['easy', 'medium', 'hard', 'descriptive'];
  optionTypes = ['single-select', 'multi-select'];
  correctOptions: number[] = [];
  subjectName = 'Assessment';
  subjects:any[]=[];
  subjectId:string=''
  
  constructor(private fb: FormBuilder, private firebaseService: FireBaseService<any>) {
    this.assessmentForm = this.fb.group({
      questionType: ['', Validators.required],
      optionType: [''],
      questionText: ['', Validators.required],
      options: this.fb.array([]),
      timer: [0, [Validators.required, Validators.min(1)]],
      maxMarks: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.assessmentForm.get('questionType')?.valueChanges.subscribe((type) => {
      if (type === 'descriptive') {
        this.options.clear();
        this.correctOptions = [];
      }
    });

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

  }

  get options(): FormArray {
    return this.assessmentForm.get('options') as FormArray;
  }

  addOption(): void {
    this.options.push(this.fb.control('', Validators.required));
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
    this.correctOptions = this.correctOptions.filter((i) => i !== index);
  }

  isCorrectOption(index: number): boolean {
    return this.correctOptions.includes(index);
  }

  toggleCorrectOption(index: number): void {
    if (this.assessmentForm.get('optionType')?.value === 'single-select') {
      this.correctOptions = [index];
    } else {
      const optionIndex = this.correctOptions.indexOf(index);
      if (optionIndex > -1) {
        this.correctOptions.splice(optionIndex, 1);
      } else {
        this.correctOptions.push(index);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.assessmentForm.valid) {
      const formData = this.assessmentForm.value;
      const questionId = Date.now().toString();
      const formattedData = {
        ...formData,
        correctOptions: this.correctOptions.map((i) => formData.options[i]),
      };

      console.log('Submitted Data:', formattedData);

      try {
       
        await this.firebaseService.create(`questions/${questionId}`, formattedData);
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      console.error('Form is invalid');
    }
  }
}
