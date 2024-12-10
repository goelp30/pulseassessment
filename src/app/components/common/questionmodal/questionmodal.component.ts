import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { SubjectService } from '../../../../sharedServices/Subject.service';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/question';
import { OptionFormat } from '../../../models/question';

@Component({
  selector: 'app-questionmodal',
  templateUrl: './questionmodal.component.html',
  styleUrls: ['./questionmodal.component.css'],
  standalone:true,
  imports:[ReactiveFormsModule,FormsModule,CommonModule]
})
export class QuestionmodalComponent implements OnInit {
  @Input() question: Question | null = null;
  assessmentForm: FormGroup;
  questionTypes = ['Single', 'Multi', 'Descriptive'];
  questionLevels = ['Easy', 'Medium', 'Hard'];
  subjectId: string = '';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FireBaseService<Question>,
    private subjectService: SubjectService
  ) {
    this.assessmentForm = this.fb.group({
      subjectId: [null, Validators.required],
      questionText: ['', Validators.required],
      questionType: ['', Validators.required],
      questionLevel: ['', Validators.required],
      questionWeightage: [1, [Validators.required, Validators.min(1)]],
      questionTime: [60, [Validators.required, Validators.min(1)]],
      options: this.fb.array([], Validators.required),
    });
  }

  ngOnInit(): void {
    this.subjectId = this.subjectService.getSubjectId() ?? '';
    this.assessmentForm.patchValue({ subjectId: this.subjectId });
  }

  get options() {
    return this.assessmentForm.get('options') as FormArray;
  }

  addOption(): void {
    const optionGroup = this.fb.group({
      optionText: ['', Validators.required],
      isCorrectOption: [false],
    });
    this.options.push(optionGroup);
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  addQuestion(): Promise<string> {
    return new Promise((resolve, reject) => {
      const questionId = crypto.randomUUID();
      const questionData: Question = {
        subjectId: this.subjectId,
        questionId,
        questionText: this.assessmentForm.value.questionText,
        questionType: this.assessmentForm.value.questionType,
        questionLevel: this.assessmentForm.value.questionLevel,
        questionWeightage: this.assessmentForm.value.questionWeightage,
        questionTime: this.assessmentForm.value.questionTime,
        createdOn: Date.now(),
        updatedOn: Date.now(),
        isQuesDisabled: false,
      };

      this.firebaseService.create(`questions/${questionId}`, questionData)
        .then(() => resolve(questionId))
        .catch((error) => reject(error));
    });
  }

  storeOptions(questionId: string): Promise<void> {
    const optionPromises = this.options.controls.map((optionControl) => {
      const optionData: OptionFormat = {
        optionId: crypto.randomUUID(),
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
      };
  
      // Save each option under its questionId
      return this.firebaseService.create(`options/${questionId}/${optionData.optionId}`, optionData);
    });
  
    return Promise.all(optionPromises).then(() => {}).catch((error) => Promise.reject(error));
  }
  

  saveData(): void {
    if (this.assessmentForm.valid) {
      this.addQuestion()
        .then((questionId) => this.storeOptions(questionId))
        .then(() => {
          alert('Question and options saved successfully!');
          this.assessmentForm.reset();
          this.options.clear();
          this.addOption(); // Add at least one default option field
        })
        .catch((error) => alert(`Error: ${error}`));
    } else {
      alert('Please fill in the form correctly.');
    }
  }
}
