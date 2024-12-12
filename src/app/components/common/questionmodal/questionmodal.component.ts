import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
import { Question, Option } from '../../../models/question';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-questionmodal',
  templateUrl: './questionmodal.component.html',
  styleUrls: ['./questionmodal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
})
export class QuestionmodalComponent implements OnInit {
  @Input() question: Question | null = null; // Input for editing mode

  assessmentForm: FormGroup;
  questionTypes = ['Single', 'Multi', 'Descriptive'];
  questionLevels = ['Easy', 'Medium', 'Hard'];
  subjectId: string = '';
  warningMessage: string = '';
  editingMode = false; // Determine whether editing or creating
  subjectName: string='';
  modalTitle: string=this.subjectName;

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
        this.options.clear();
      } else if (this.options.length === 0) {
        this.options.push(this.createOptionGroup());
      } else {
        // Ensure options match the selected question type
        while (this.options.length < 2) {
          this.options.push(this.createOptionGroup());
        }
        if (value === 'Multi' && this.options.length < 3) {
          while (this.options.length < 3) {
            this.options.push(this.createOptionGroup());
          }
        }
      }
    });
    
  }

  ngOnInit(): void {
    const savedSubjectId = localStorage.getItem('subjectId');
    const savedSubjectName = localStorage.getItem('subjectName');
  
    if (savedSubjectId && savedSubjectName) {
      this.subjectId = savedSubjectId;
      this.subjectName = savedSubjectName;
  
      // Patch both subjectId and subjectName to the form
      this.assessmentForm.patchValue({ 
        subjectId: this.subjectId, 
        subjectName: this.subjectName 
     
      });
    }
  
    this.assessmentForm.get('questionLevel')?.valueChanges.subscribe((value) => {
      this.setDefaultTime(value);
    });
  
    if (this.question) {
      this.editingMode = true;
      this.loadFormData();
      console.log(this.modalTitle)
    }
  }
  
  loadFormData(): void {
    if (this.question) {
      this.assessmentForm.patchValue({
        subjectId: this.question.subjectId,
        questionText: this.question.questionText,
        questionType: this.question.questionType,
        questionLevel: this.question.questionLevel,
        questionWeightage: this.question.questionWeightage,
        questionTime: this.question.questionTime,
      });

      this.loadOptions();
    }
  }

  loadOptions(): void {
    if (this.question?.questionId) {
      (this.firebaseService.getAllData('/options') as Observable<Option[]>)
        .pipe(
          map((options: Option[]) => {
            // Filter options by matching questionId
            const filteredOptions = options.filter(option => option.questionId === this.question?.questionId);
  
            // Deduplicate by optionId
            const uniqueOptions = filteredOptions.reduce((acc, option) => {
              if (!acc.some(existingOption => existingOption.optionId === option.optionId)) {
                acc.push(option);
              }
              return acc;
            }, [] as Option[]);
  
            return uniqueOptions;
          })
        )
        .subscribe({
          next: (uniqueOptions: Option[]) => {
            this.options.clear(); // Clear the existing options form array
            uniqueOptions.forEach(option => {
              this.options.push(
                this.fb.group({
                  optionText: [option.optionText, Validators.required],
                  isCorrectOption: [option.isCorrectOption],
                  optionId: [option.optionId] // Retain optionId for future updates
                })
              );
            });
          },
          error: (error) => {
            console.error('Failed to load options:', error);
          }
        });
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
      this.warningMessage = '';
    } else {
      this.warningMessage = 'You cannot add more than 6 options!';
    }
  }

  removeOption(index: number): void {
    const questionType = this.assessmentForm.get('questionType')?.value;
    if (questionType === 'Multi' && this.options.length <= 3) {
      this.warningMessage = 'Multi type questions require at least 3 options!';
      return;
    }
    if (this.options.length > 1) {
      this.options.removeAt(index);
      this.warningMessage = '';
    } else {
      this.warningMessage = 'At least two options must exist!';
    }
  }
  
  

  validateOptions(): boolean {
    const questionType = this.assessmentForm.get('questionType')?.value;
    const totalOptions = this.options.length;
    const correctOptionsCount = this.options.controls.filter(
      (option) => option.get('isCorrectOption')?.value
    ).length;
  
    if (questionType === 'Multi') {
      if (totalOptions < 3) {
        alert('Multi type questions require at least 3 options.');
        return false;
      }
      if (correctOptionsCount < 2 || correctOptionsCount === totalOptions) {
        alert('Multi type questions must have at least 2 correct options and cannot have all options marked as correct.');
        return false;
      }
    }
  
    return true;
  }
  

  async saveData() {
    if (this.assessmentForm.valid && this.validateOptions()) {
      try {
        if (this.editingMode) {
          await this.updateQuestion();
        } else {
          const questionId = await this.addQuestion();
          await this.storeOptions(questionId);
        }

        alert('Saved successfully!');
        
        this.assessmentForm.reset({
          subjectId: this.subjectId,
          questionType: 'Single',
          questionLevel: 'Easy',
          questionWeightage: 1,
          questionTime: 1,
          questionMarks: 1,
          difficulty: 'Low',
        });
        this.options.clear();
        this.addOption();
      } catch (error) {
        alert(`Error: ${error}`);
      }
    } else {
      alert('Please fill out all required fields correctly.');
    }
  }
  async addQuestion(): Promise<string> {
    const questionId = crypto.randomUUID(); // Generate unique question ID
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
  
    try {
      // Send data to Firebase
      await this.firebaseService.create(`/questions/${questionId}`, questionData);
      return questionId; // Return the generated ID
    } catch (error) {
      console.error('Error creating new question:', error);
      throw error;
    }
  }
  

  async updateQuestion() {
    const updatedData: Question = {
      subjectId: this.assessmentForm.value.subjectId,
      questionId: this.question!.questionId,
      questionText: this.assessmentForm.value.questionText,
      questionType: this.assessmentForm.value.questionType,
      questionLevel: this.assessmentForm.value.questionLevel,
      questionWeightage: this.assessmentForm.value.questionWeightage,
      questionTime: this.assessmentForm.value.questionTime,
      createdOn: this.question?.createdOn || Date.now(),
      updatedOn: Date.now(),
      isQuesDisabled: false,
    };

    await this.firebaseService.update(`/questions/${this.question!.questionId}`, updatedData);
    await this.updateOptions();
   console.log(this.options)
  }
  async updateOptions() {
    const optionPromises = this.options.controls.map((optionControl) => {
      const optionId = optionControl.get('optionId')?.value; // Get the existing option ID directly from the form control
  
      const optionData: Option = {
        optionId: optionId || crypto.randomUUID(), // Use existing ID or generate a new one if missing
        questionId: this.question?.questionId || '', // Link the option to the current question
        subjectid: this.subjectId,
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
      };
  
      // Update existing option or create a new one if needed
      return this.firebaseService.create(`/options/${optionData.optionId}`, optionData);
    });
  
    try {
      await Promise.all(optionPromises); // Wait for all options to be updated
      console.log('Options updated successfully');
    } catch (error) {
      console.error('Failed to update options:', error);
      throw error;
    }
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

  setDefaultTime(questionLevel: string): void {
    const time = questionLevel === 'Medium' ? 2 : questionLevel === 'Hard' ? 3 : 1;
    this.assessmentForm.patchValue({ questionTime: time });
  }
}
