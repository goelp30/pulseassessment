import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { FireBaseService } from '../../../sharedServices/FireBaseService';
import { SubjectService } from '../../../sharedServices/Subject.service';
import { CommonModule } from '@angular/common';
import { Question, Option } from '../../models/question';
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
      this.options.clear(); 
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
      this.firebaseService.getAllData('/options')
        .pipe(
          map((options: Option[]) => {
            // Filter options by questionId and deduplicate by optionId
            const filteredOptions = options.filter((option) => option.questionId === this.question?.questionId);
            return Array.from(new Map(filteredOptions.map((opt) => [opt.optionId, opt])).values());
          })
        )
        .subscribe({
          next: (uniqueOptions: Option[]) => {
            this.options.clear(); // Clear existing options
            uniqueOptions.forEach((option) => {
              this.options.push(
                this.fb.group({
                  optionText: [option.optionText, Validators.required],
                  isCorrectOption: [option.isCorrectOption],
                  optionId: [option.optionId],
                })
              );
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
      optionId: [crypto.randomUUID()], // Generate a unique ID
      optionText: ['', Validators.required],
      isCorrectOption: [false],
    });
  }
  
  addOption(): void {
    if (this.assessmentForm.value.questionType === 'Descriptive') {
        return; // Do nothing for Descriptive questions
    }

    if (this.options.length < 6) {
        this.options.push(this.createOptionGroup());
        this.warningMessage = '';
    } else {
        this.warningMessage = 'Cannot add more than 6 options.';
        alert(this.warningMessage);
    }
}


  
removeOption(index: number): void {
  const questionType = this.assessmentForm.get('questionType')?.value;

  // Validation: At least two options for Single and Multi types
  if ((questionType === 'Single' || questionType === 'Multi') && this.options.length <= 2) {
      alert('A question must have at least two options.');
      return;
  }

  // Additional validation for Multi-choice questions
  if (questionType === 'Multi' && this.options.length <= 3) {
      alert('Multi-choice questions must have at least 3 options.');
      return;
  }

  this.options.removeAt(index);

  // Clear warning if options are now below the limit
  if (this.options.length < 6) {
      this.warningMessage = '';
  }
}


toggleCorrectOption(index: number) {
  const option = this.options.at(index);
  option.patchValue({
    isCorrectOption: !option.get('isCorrectOption')?.value,
  });
}

  
  validateOptions(): boolean {
    const questionType = this.assessmentForm.get('questionType')?.value;
    const totalOptions = this.options.length;
    const correctOptionsCount = this.options.controls.filter(
        (option) => option.get('isCorrectOption')?.value
    ).length;

    if (totalOptions > 6) {
        alert('A question can have a maximum of 6 options.');
        return false;
    }

    if (questionType === 'Single') {
        // Single-choice validations
        if (correctOptionsCount !== 1) {
            alert('Single-choice questions must have one correct option.');
            return false;
        }
        if (correctOptionsCount > 1) {
            alert('Single-choice questions cannot have more than one correct option.');
            return false;
        }
        if (totalOptions < 2) {
          alert('Single-choice questions must have exactly 2 options.');
          return false;
        }
    } else if (questionType === 'Multi') {
        // Multi-choice validations
        if (totalOptions < 3) {
            alert('Multi-choice questions require at least 3 options.');
            return false;
        }
        if (correctOptionsCount < 2) {
            alert('Multi-choice questions must have at least 2 correct options.');
            return false;
        }
        if (correctOptionsCount === totalOptions) {
            alert('Cannot mark all options as correct in a multi-choice question.');
            return false;
        }
    }
    if (questionType === 'Descriptive') {
      return true;
  }

    return true;
}

validateCorrectOptions(formArray: FormArray): { [key: string]: any } | null {
  const hasCorrectOption = formArray.controls.some(
    (control) => control.get('isCorrectOption')?.value === true
  );
  return hasCorrectOption ? null : { noCorrectOption: true };
}
  
  

  

async saveData() {
  let alertShown = false; // Flag to prevent repeated alerts

  if (!this.assessmentForm.valid || !this.validateOptions()) {
    if (!alertShown) {
      alert('Please fix validation issues before saving.');
      alertShown = true; // Set the flag to true after showing the alert
    }
    return; // Exit the function early
  }

  // Reset the flag once the form is valid
  alertShown = false;

  try {
    if (this.editingMode) {
      await this.updateQuestion();
    } else {
      const questionId = await this.addQuestion();
      if (this.assessmentForm.value.questionType !== 'Descriptive') {
        await this.storeOptions(questionId);
      }
    }

    alert('Saved successfully!');

    // Reset the form but do not add a new option automatically
    this.assessmentForm.reset({
      subjectId: this.subjectId,
      questionType: 'Single',
      questionLevel: 'Easy',
      questionWeightage: 1,
      questionTime: 1,
      questionMarks: 1,
      difficulty: 'Low',
    });

    // Clear the options array entirely to start fresh
    this.options.clear();

    // Add a single initial option only if it is a new question
    if (!this.editingMode) {
      this.addOption();
    }
  } catch (error) {
    console.error('Error saving data:', error);
    alert(`Error: ${error}`);
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
  async updateOptions(): Promise<void> {
    // Map current options to their IDs
    const existingOptionIds = this.options.controls
      .map((control) => control.get('optionId')?.value)
      .filter((id) => id); // Filter out null or undefined IDs
  
    const optionPromises = this.options.controls.map((optionControl) => {
      const optionId = optionControl.get('optionId')?.value; // Use the existing option ID
      if (!optionId) {
        console.warn('Option ID missing for one of the options. Skipping update.');
        return Promise.resolve(); // Skip any option that doesn't have an ID
      }
  
      const optionData: Option = {
        optionId,
        questionId: this.question?.questionId || '',
        subjectid: this.subjectId,
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
      };
  
      return this.firebaseService.update(`/options/${optionId}`, optionData); // Only update
    });
  
    try {
      await Promise.all(optionPromises);
      console.log('Options updated successfully');
    } catch (error) {
      console.error('Failed to update options:', error);
      throw error;
    }
  }
  
  
  
  
  

  async storeOptions(questionId: string): Promise<void> {
    const optionPromises = this.options.controls.map((optionControl) => {
      const optionId = optionControl.get('optionId')?.value;
      if (!optionId) {
        console.warn('Option ID missing during store operation. Skipping.');
        return Promise.resolve();
      }
  
      const optionData: Option = {
        optionId,
        questionId,
        subjectid: this.subjectId,
        optionText: optionControl.get('optionText')?.value,
        isCorrectOption: optionControl.get('isCorrectOption')?.value,
      };
  
      return this.firebaseService.update(`/options/${optionId}`, optionData); // Use only update
    });
  
    try {
      await Promise.all(optionPromises);
      console.log('Options stored successfully');
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
