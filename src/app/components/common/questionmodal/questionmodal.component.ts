import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { SubjectService } from '../../../../sharedServices/Subject.service';
import { CommonModule } from '@angular/common';
import { Question } from '../../../models/question';
import { Option } from '../../../models/question';

@Component({
  selector: 'app-questionmodal',
  templateUrl: './questionmodal.component.html',
  styleUrls: ['./questionmodal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
})
export class QuestionmodalComponent implements OnInit {
  @Input() question: Question | null = null;
  

  assessmentForm: FormGroup;
  questionTypes = ['Single', 'Multi', 'Descriptive'];
  questionLevels = ['Easy', 'Medium', 'Hard'];
  subjectId: string = '';
  warningMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private firebaseService: FireBaseService<Question>,
    private subjectService: SubjectService
  ) {
    this.assessmentForm = this.fb.group({
      subjectId: [null, Validators.required],
      questionText: ['', Validators.required],
      questionType: ['Single', Validators.required],
      questionLevel: ['Easy', Validators.required],
      questionWeightage: [1, [Validators.required, Validators.min(1)]],
      questionTime: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      questionMarks: [1, [Validators.required, Validators.min(1)]],
      difficulty: ['Low', Validators.required],
      options: this.fb.array([this.createOptionGroup()]),
    });

    this.assessmentForm.get('questionType')?.valueChanges.subscribe((value) => {
      if (value === 'Descriptive') {
        // Clear options and disable them when the question type is descriptive
        this.assessmentForm.setControl('options', this.fb.array([]));
      } else {
        // Ensure options array exists when question type is not descriptive
        this.assessmentForm.setControl('options', this.fb.array([this.createOptionGroup()]));
      }
    });
  }

  ngOnInit(): void {
    this.subjectId = this.subjectService.getSubjectId() ?? '';
    if (this.subjectId) {
      this.assessmentForm.patchValue({ subjectId: this.subjectId });
    } else {
      alert('No valid subjectId found!');
    }

    this.assessmentForm.get('questionLevel')?.valueChanges.subscribe((value) => {
      this.setDefaultTime(value);
    });
  }

  get options() {
    return this.assessmentForm.get('options') as FormArray;
  }

  createOptionGroup(): FormGroup {
    return this.fb.group({
      optionText: ['', Validators.required],
      isCorrectOption: [false],
    });
  }

  addOption(): void {
    if (this.options.length < 6) {
      this.options.push(this.createOptionGroup());
    } else {
      this.warningMessage = 'You cannot add more than 6 options!';
    }
  }

  removeOption(index: number): void {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    } else {
      this.warningMessage = 'At least two options must exist!';
    }
    
  }

  validateOptions(): boolean {
    const questionType = this.assessmentForm.get('questionType')?.value;
    if (questionType === 'Descriptive') {
      return true; // Skip option validation for Descriptive questions
    }
    const correctOptionsCount = this.options.controls.filter(
      (option) => option.get('isCorrectOption')?.value
    ).length;

    if (questionType === 'Single' && correctOptionsCount > 1) {
      alert('Only 1 option can be correct in Single type.');
      return false;
    }

    if (questionType === 'Multi') {
      if (correctOptionsCount < 2) {
      alert('At least 2 options must be correct for Multi type.');
      return false;
    }
    if (correctOptionsCount === this.options.length) {
      alert('In Multi type, all options cannot be correct.');
      return false;
    }
  }
    return true;
  }

  setDefaultTime(questionLevel: string): void {
    let defaultTime = 1; // Default to 1 minute

    if (questionLevel === 'Medium') {
      defaultTime = 2;
    } else if (questionLevel === 'Hard') {
      defaultTime = 3;
    }

    this.assessmentForm.patchValue({ questionTime: defaultTime });
  }

  async saveData() {
    console.log('Form Validity:', this.assessmentForm.valid);
    console.log('Form Value:', this.assessmentForm.value);

    if (this.assessmentForm.valid && this.validateOptions()) {
      try {
        const questionId = await this.addQuestion();
        if (this.assessmentForm.value.questionType !== 'Descriptive') {
          await this.storeOptions(questionId);
        }
        

        alert('Saved successfully!');
        
        this.assessmentForm.reset();
        this.options.clear();
        this.addOption();
      } catch (error) {
        alert(`Error saving: ${error}`);
      }
    } else {
      alert('Please fill out all required fields correctly.');
    }
  }

  async addQuestion(): Promise<string> {
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

    await this.firebaseService.create(`/questions/${questionId}`, questionData);
    return questionId;
  }

  async storeOptions(questionId: string): Promise<void> {
    const optionPromises = this.options.controls.map((optionControl) => {
      const optionData: Option = {
        subjectid: this.subjectId,
        questionId,
        optionId: crypto.randomUUID(),
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
      };

      return this.firebaseService.create(`/options/${optionData.optionId}`, optionData);
    });

    await Promise.all(optionPromises);
  }
}