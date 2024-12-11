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
      options: this.fb.array([this.createOptionGroup()], Validators.required),
    });
  }

  ngOnInit(): void {
    this.subjectId = this.subjectService.getSubjectId() ?? '';
    if (this.subjectId) {
      this.assessmentForm.patchValue({ subjectId: this.subjectId });
    } else {
      alert('No valid subjectId found!');
    }
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
      alert('You cannot add more than 6 options!');
    }
  }

  removeOption(index: number): void {
    if (this.options.length > 1) {
      this.options.removeAt(index);
    } else {
      alert('At least one option must exist!');
    }
  }

  validateOptions(): boolean {
    const questionType = this.assessmentForm.get('questionType')?.value;
    const correctOptionsCount = this.options.controls.filter(
      (option) => option.get('isCorrectOption')?.value
    ).length;

    if (questionType === 'Single' && correctOptionsCount > 1) {
      alert('Only 1 option can be correct in Single type.');
      return false;
    }

    if (questionType === 'Multi' && correctOptionsCount < 2) {
      alert('At least 2 options must be correct for Multi type.');
      return false;
    }

    return true;
  }

  async saveData() {
    console.log('Form Validity:', this.assessmentForm.valid);
    console.log('Form Value:', this.assessmentForm.value);

    if (this.assessmentForm.valid && this.validateOptions()) {
      try {
        const questionId = await this.addQuestion();
        await this.storeOptions(questionId);

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
