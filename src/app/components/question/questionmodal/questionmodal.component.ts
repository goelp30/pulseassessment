import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
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
import { CommonModule, TitleCasePipe } from '@angular/common';
import { Question} from '../../../models/question';
import { Option } from '../../../models/question';
import { map } from 'rxjs';
import { ToastrModule, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-questionmodal',
  templateUrl: './questionmodal.component.html',
  styleUrls: ['./questionmodal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule,TitleCasePipe,ToastrModule],
})
export class QuestionmodalComponent implements OnInit {
  @Input() question: Question | null = null; // Input for editing mode
  @Output() closeModal = new EventEmitter<void>(); // output for close modal
 @Input() buttonLabel:string='add';
 @Input() isAddModal: boolean = true;

  assessmentForm: FormGroup;
  questionTypes = ['Single', 'Multi', 'Descriptive'];
  questionLevels = ['Easy', 'Medium', 'Hard'];
  subjectId: string = '';
  warningMessage: string = '';
  editingMode = false; // Determine whether editing or creating
  subjectName: string='';
  modalTitle: string=this.subjectName;
  temporaryDisabledOptions: Set<string> = new Set();


  constructor(
    private fb: FormBuilder,
    private firebaseService: FireBaseService<Question>,
    private subjectService: SubjectService,
    private toastr:ToastrService
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
      this.warningMessage = '';
      if (value === 'Descriptive') {
        // Only clear if the question type changes to Descriptive
        this.options.clear();
      }
    });
    
    
    
  }

  ngOnInit(): void {
    console.log('Editing Mode:', this.editingMode);
    console.log('Question Data:', this.question);
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
      this.editingMode = true; // Set to true if editing
      this.loadFormData();
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
      this.options.clear();
      this.firebaseService.getAllData('/options')
        .pipe(
          map((options: Option[]) => 
            options
              .filter((option) => option.questionId === this.question?.questionId && !option.isOptionDisabled)
              .sort((a, b) => a.createdOn - b.createdOn) // Assuming options have a 'createdOn' field that maintains order
          )
        )
        .subscribe({
          next: (filteredOptions: Option[]) => {
            // Only preserve options already dynamically loaded, don't clear manually added ones
            const existingOptionIds = new Set(this.options.controls.map(control => control.get('optionId')?.value));
  
            filteredOptions.forEach(option => {
              if (!existingOptionIds.has(option.optionId)) {
                this.options.push(
                  this.fb.group({
                    optionText: [option.optionText, Validators.required],
                    isCorrectOption: [option.isCorrectOption],
                    optionId: [option.optionId],
                    isOptionDisabled: [option.isOptionDisabled],
                  })
                );
              }
            });
          },
          error: (error) => {
            console.error('Failed to load options:', error);
          },
        });
    }
  }
  
  
  
  
  

  get options() {
    return this.assessmentForm.get('options') as FormArray;
  }

  createOptionGroup(): FormGroup {
    return this.fb.group({
      optionId: [crypto.randomUUID()],
      optionText: ['', Validators.required],
      isCorrectOption: [false],
      isOptionDisabled: [false], // Default to false
    });
  }
  
  
  addOption(): void {
    const activeOptionsCount = this.options.controls.filter(
      (control) => !control.get('isOptionDisabled')?.value
    ).length;
  
    if (activeOptionsCount < 6) {
      this.options.push(this.createOptionGroup());
      this.warningMessage = '';
    } else {
      this.warningMessage = 'Cannot add more than 6 options.';
    }
  }
  
  
  async removeOption(index: number): Promise<void> {
    const questionType = this.assessmentForm.get('questionType')?.value;
    const activeOptionsCount = this.options.controls.filter(
      (control) => !control.get('isOptionDisabled')?.value
    ).length; // Only count active options
  
    // Allow removal but show a warning if the condition isn't met
    if (questionType === 'Single' && activeOptionsCount <= 2) {
      this.warningMessage = 'A single-choice question must have at least 2 options.';
    } else if (questionType === 'Multi' && activeOptionsCount <= 3) {
      this.warningMessage = 'A multi-choice question must have at least 3 options.';
    } else {
      this.warningMessage = ''; // Clear any previous warning message
    }
  
    // Mark the option as disabled (soft-delete)
    const option = this.options.at(index) as FormGroup;
    if (option) {
      option.patchValue({ isOptionDisabled: true });
    } else {
      this.toastr.error('Invalid option index.', 'Error');
    }
  }
  




toggleCorrectOption(index: number) {
  const option = this.options.at(index);
  option.patchValue({
    isCorrectOption: !option.get('isCorrectOption')?.value,
  });
}

  
validateOptions(): boolean {
  const activeOptionsCount = this.options.controls.filter(
    (control) => !control.get('isOptionDisabled')?.value
  ).length;

  const correctOptionsCount = this.options.controls.filter(
    (control) => control.get('isCorrectOption')?.value && !control.get('isOptionDisabled')?.value
  ).length;

  const questionType = this.assessmentForm.get('questionType')?.value;

  if (questionType === 'Single') {
    if (activeOptionsCount < 2 || correctOptionsCount !== 1) {
      this.warningMessage = 'Single-choice questions must have at least 2 options and exactly one correct option.';
      return false;
    }
  } else if (questionType === 'Multi') {
    if (activeOptionsCount < 3 || correctOptionsCount < 2 || correctOptionsCount === activeOptionsCount) {
      this.warningMessage = 'Multi-choice questions must have at least 3 options and 2 correct options, but not all options can be correct.';
      return false;
    }
  }

  return true;
}

get isSaveDisabled(): boolean {
  const questionType = this.assessmentForm.get('questionType')?.value;
  const activeOptionsCount = this.options.controls.filter(
    (control) => !control.get('isOptionDisabled')?.value
  ).length;

  const correctOptionsCount = this.options.controls.filter(
    (control) => control.get('isCorrectOption')?.value && !control.get('isOptionDisabled')?.value
  ).length;

  // Base check for form validity
  if (!this.assessmentForm.valid) {
    return true; // Form is invalid
  }

  // Validation for Single-choice questions
  if (questionType === 'Single') {
    if (activeOptionsCount < 2 || correctOptionsCount !== 1) {
      return true; // Single-choice must have at least 2 options and exactly 1 correct option
    }
  }

  // Validation for Multi-choice questions
  if (questionType === 'Multi') {
    if (
      activeOptionsCount < 3 || // At least 3 options
      correctOptionsCount < 2 || // At least 2 correct options
      correctOptionsCount === activeOptionsCount // Not all options can be correct
    ) {
      return true;
    }
  }

  // No restrictions for Descriptive questions
  return false; // All conditions passed
}




validateCorrectOptions(formArray: FormArray): { [key: string]: any } | null {
  const hasCorrectOption = formArray.controls.some(
    (control) => control.get('isCorrectOption')?.value === true
  );
  return hasCorrectOption ? null : { noCorrectOption: true };
}
  
  

  

async saveData() {
  console.log('Form Validity:', this.assessmentForm.valid);
  console.log('Form Value:', this.assessmentForm.value);

  if (this.assessmentForm.valid && this.validateOptions()) {
    try {
      if (this.isAddModal) {
        const questionId = await this.addQuestion();
        console.log(`Question ${questionId} added successfully.`);
      } else {
        await this.updateQuestion();
        console.log(`Question ${this.question?.questionId} updated successfully.`);
      }

      // Reset the form and modal
      this.closeModal.emit();
      this.assessmentForm.reset();
      this.options.clear();
      this.addOption();
    } catch (error) {
      console.error('Error saving data:', error);
    }
  } else {
    console.warn('Validation failed. Please check the form fields.');
  }
}


async saveQuestion(): Promise<void> {
  try {
    if (this.isAddModal) {
      // Add new question logic
      const questionId = await this.addQuestion();
      if (this.assessmentForm.value.questionType !== 'Descriptive') {
        await this.storeOptions(questionId);
      }
      console.log(`Question ${questionId} added successfully`);
    } else {
      // Update existing question logic
      await this.updateQuestion();
      console.log(`Question ${this.question?.questionId} updated successfully`);
    }
    // Emit event to close modal and reset the form
    this.closeModal.emit();
    this.assessmentForm.reset();
    this.options.clear();
    this.addOption();
  } catch (error) {
    console.error('Failed to save question:', error);
    this.toastr.error('Failed to save question. Please try again.', 'Error');
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
       await this.storeOptions(questionId);
      this.toastr.success("Question Added Successfully")
      return questionId; // Return the generated ID
    } catch (error) {
      console.error('Error creating new question:', error);
      throw error;
    }
  }
  

  async updateQuestion() {
    if (!this.question?.questionId) {
      console.error('Question ID is missing. Cannot perform update.');
      return;
    }
  
    const updatedData: Question = {
      subjectId: this.assessmentForm.value.subjectId,
      questionId: this.question.questionId, // Use the existing question ID
      questionText: this.assessmentForm.value.questionText,
      questionType: this.assessmentForm.value.questionType,
      questionLevel: this.assessmentForm.value.questionLevel,
      questionWeightage: this.assessmentForm.value.questionWeightage,
      questionTime: this.assessmentForm.value.questionTime,
      createdOn: this.question.createdOn, // Retain the original creation date
      updatedOn: Date.now(), // Update the last modified timestamp
      isQuesDisabled: false,
    };
  
    try {
      // Update the question data in Firebase
      await this.firebaseService.update(`/questions/${this.question.questionId}`, updatedData);
      // Update options associated with this question
      await this.updateOptions();
      this.toastr.info("Question Updated Successfully")
      console.log('Question and options updated successfully');
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  }
  async updateOptions(): Promise<void> {
    const updatePromises = this.options.controls.map((optionControl) => {
      const optionId = optionControl.get('optionId')?.value;
  
      if (!optionId) {
        console.warn('Option ID missing during update operation. Skipping.');
        return Promise.resolve();
      }
  
      const optionData: Option = {
        optionId,
        questionId: this.question?.questionId || '',
        subjectId: this.subjectId,
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
        isOptionDisabled: optionControl.get('isOptionDisabled')?.value,
        createdOn:Date.now(),
        updatedOn:Date.now()
      };
  
      // Save updated or removed option to Firebase
      return this.firebaseService.update(`/options/${optionId}`, optionData);
    });
  
    try {
      await Promise.all(updatePromises);
      console.log('Options updated successfully.');
    } catch (error) {
      console.error('Failed to update options:', error);
      throw error;
    }
  }
  
  
  
  
  
  
  
  

  async storeOptions(questionId: string): Promise<void> {
    const activeOptions = this.options.controls.filter(
      (control) => !control.get('isOptionDisabled')?.value
    );
  
    const optionPromises = activeOptions.map((optionControl) => {
      const optionData: Option = {
        optionId: optionControl.get('optionId')?.value || crypto.randomUUID(),
        questionId,
        subjectId: this.subjectId,
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
        isOptionDisabled: false, // Always set as active on save
        createdOn: Date.now(), // Store creation timestamp to maintain order
        updatedOn:Date.now()
      };
  
      return this.firebaseService.create(`/options/${optionData.optionId}`, optionData);
    });
  
    try {
      await Promise.all(optionPromises);
    } catch (error) {
      console.error('Failed to store options:', error);
      throw error;
    }
  }
  
  
  
  
  
  

  setDefaultTime(questionLevel: string): void {
    const time = questionLevel === 'Medium' ? 2 : questionLevel === 'Hard' ? 3 : 1;
    this.assessmentForm.patchValue({ questionTime: time });
  }
}