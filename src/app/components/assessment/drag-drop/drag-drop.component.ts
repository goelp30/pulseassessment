import { CommonModule } from '@angular/common';
import { AssessmentList, SubjectCounts } from '../../../models/newassessment';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import Sortable from 'sortablejs';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import { NavigationStart, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AssessmentService } from '../services/assessmentServices/assessment.service';
@Component({
  selector: 'app-drag-drop',
  standalone: true,
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})

export class DragDropComponent implements AfterViewInit, OnInit {
  leftList: { subjectId: string, subjectName: string }[] = [];
  rightList: { subjectId: string, subjectName: string, warningTitle?: '' }[] = [];
  subjectList: { subjectId: string, subjectName: string }[] = [];
  updatedList: string[] = [];
  assessmentTitleWarning: string = '';
  assessmentList: AssessmentList[] = [];
  createdOn: string = '';
  savedFormData: any = null;
  isAutoEvaluated: boolean = true
  rightListForm!: FormGroup; // Form to handle right list inputs
  viewMode: 'internal' | 'external' = 'internal'; // Toggle view mode
  validationWarnings: string[] = []; // Warnings for Formvalidation
  assessmentTitle: string = ''; // Title for assessment
  subject_table = TableNames.Subject; // Firebase collection name for subjects
  assess_table = TableNames.Assessment;
  isModalVisible: boolean = false;
  eConfirmationVisible: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firebaseService: FireBaseService<Subject | AssessmentList | Assessment>,
    private toastr: ToastrService,
    private assessmentService: AssessmentService
  ) { }
  assessmentId: string = ''
  editFlag: boolean = false;
  handleBeforeUnload(event: BeforeUnloadEvent): string {
    // You can display a custom message here or just prevent the action
    const message = "You have unsaved changes! Are you sure you want to leave?";
    event.returnValue = message;  // Standard for most browsers
    return message;               // For some older browsers (like IE)
  }
  // clear ls when moving to another route
  ngOnInit(): void {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.assessmentService.assessmentId$.subscribe((assessmentId) => {
      if (assessmentId) {
        // If there's an assessmentId, load the edit data
        this.assessmentId = assessmentId;
        this.editFlag = true;
        this.getEditData(this.assessmentId, this.editFlag);
      } else {
        // If no assessmentId is provided, load data from sessionStorage
        this.editFlag = false;
        this.loadFromSessionStorage();
      }
    });
  
    this.initializeRightListForm();
    if (this.isBrowser()) {
      this.fetchLeftList();
    }
  
    this.subscribeToFormChanges();
    this.setupNavigationListener();
  }

  
  saveToSessionStorage(): void {
    if (this.isBrowser()) {
      sessionStorage.setItem('leftList', JSON.stringify(this.leftList));
      sessionStorage.setItem('rightList', JSON.stringify(this.rightList));
      sessionStorage.setItem('assessmentTitle', this.assessmentTitle);
      sessionStorage.setItem('viewMode', this.viewMode);
      sessionStorage.setItem('rightListForm', JSON.stringify(this.rightListForm.value));

    }
  }
  setupNavigationListener(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.clearSessionStorageOnNavigation();
      }
    });

    // Clear session storage and cache when the user leaves the page
    window.addEventListener('beforeunload', () => this.clearSessionStorage());
  }
   clearSessionStorageOnNavigation(): void {
    console.log('cleared');
    this.clearSessionStorage();
  }
  loadFromSessionStorage(): void {
    if (this.isBrowser()) {
      const leftList = sessionStorage.getItem('leftList');
      const rightList = sessionStorage.getItem('rightList');
      const assessmentTitle = sessionStorage.getItem('assessmentTitle');
      const viewMode = sessionStorage.getItem('viewMode');
      const rightListForm = sessionStorage.getItem('rightListForm');
  
      if (leftList) this.leftList = JSON.parse(leftList);
      if (rightList) this.rightList = JSON.parse(rightList);
      if (assessmentTitle) this.assessmentTitle = assessmentTitle;
      if (viewMode) this.viewMode = viewMode as 'internal' | 'external';
      if (rightListForm) {
        const formValue = JSON.parse(rightListForm);
        this.rightListForm.patchValue(formValue);
        if (formValue.rightListInputs) {
          this.rightListForm.setControl('rightListInputs', this.fb.array(formValue.rightListInputs));
        }
      }
    }
  }
  
  clearSessionStorage(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem('leftList');
      sessionStorage.removeItem('rightList');
      sessionStorage.removeItem('assessmentTitle');
      sessionStorage.removeItem('viewMode');
      sessionStorage.removeItem('rightListForm');
    }
  }
  toggleViewMode(mode: 'internal' | 'external'): void {
    this.viewMode = mode;
  }
  initializeRightListForm(): void {
    this.rightListForm = this.fb.group({
      createdOn: [this.getCurrentTimestamp()],
      inputText: [''],
      rightListInputs: this.fb.array([]),
    });
  }
  get rightListInputs(): FormArray {
    return this.rightListForm.get('rightListInputs') as FormArray;
  }


  isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
  calculateAutoEvaluated(subjects: any[]): boolean {
    let isAutoEvaluated = true;
    subjects.forEach(subject => {
      if (subject.descriptive > 0) {
        isAutoEvaluated = false; // If descriptive value is greater than 0, set to false
      }
    });
    return isAutoEvaluated;
  }

  addAssessment(): Promise<string> {
    
    return new Promise((resolve, reject) => {
      const uniqueId = crypto.randomUUID();
      const assessment: Assessment = {
        assessmentId: uniqueId,
        assessmentName: this.assessmentTitle,
        assessmentType: this.viewMode,
        dateCreated: Date.now(),
        dateUpdated: Date.now(),
        isDisabled: false,
        isautoEvaluated: this.isAutoEvaluated
      };

      this.firebaseService.create(this.assess_table + '/' + uniqueId, assessment)
        .then(() => {
          resolve(uniqueId);
        })
        .catch((error) => {
          reject('Failed to save assessment: ' + error);
        });
    });
  }

  closeModal(): void {
    this.isModalVisible = false;
    this.eConfirmationVisible = false;
  }
  checkAssessmentTitleUniqueness(title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getAllDataByFilter(this.assess_table, 'isDisabled', false).subscribe((assessments: any[]) => {
        const existingTitles = assessments.map((assessment) => assessment.assessmentName.toLowerCase());
        if (existingTitles.includes(title.toLowerCase())) {
          resolve(false);
        } else {
          resolve(true); // Title is unique
        }
      }, (error) => {
        reject('Failed to fetch assessment data for uniqueness check: ' + error);
      });
    });
  }
  resetRightListAndForm(): void {
    this.rightList = [];
    this.rightListForm.reset();
    this.initializeRightListForm();
    this.fetchLeftList(); // Reload subjects
  }
  // trying to
  fetchLeftList(): void {
    this.firebaseService.getAllDataByFilter(this.subject_table, 'isDisabled', false).subscribe((data: any[]) => {
      this.leftList = data
        .map(item => ({ subjectId: item.subjectId, subjectName: item.subjectName }))
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName)); // Sort subjects alphabetically

      this.subjectList = this.leftList
        .map(item => ({ subjectId: item.subjectId, subjectName: item.subjectName })) // Use subjectName for display in HTML
    });
  }
  getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
  mapRightListInputs(list: any[]): any {
    const subjects: any = {}; // Initialize an empty object to hold the subject data

    // Iterate over the form inputs and the left list to map data
    this.rightListInputs.value.forEach((input: any) => {
      // Find the corresponding subject from the list (the right list) based on subjectId
      const subject = list.find((item: any) => item.subjectId === input.item.subjectId);

      if (subject) {
        // Create an entry for each subject with ratings
        subjects[subject.subjectId] = {
          subjectId: subject.subjectId,        // Store the subjectId
          subjectName: subject.subjectName,    // Store the subjectName
          easy: input.easy,                     // Store the easy rating
          medium: input.medium,                 // Store the medium rating
          hard: input.hard,                     // Store the hard rating
          descriptive: input.descriptive        // Store the descriptive rating
        };
      }
    });

    return subjects; // Return the object containing subject data
  }

  onAssessmentTitleChange(): void {
    // Only validate the title when it changes
    this.validateAssessmentTitle();
  }

  questionCounts: { [subjectId: string]: { easyCount: number, mediumCount: number, hardCount: number, descriptiveCount: number } } = {};
  warningTitle: string = '';

  newValidationWarnings: {
    easy: string[];
    medium: string[];
    hard: string[];
    descriptive: string[];
  } = {
    easy: [],
    medium: [],
    hard: [],
    descriptive: []
  };
  enabledQuestions: any[] = []; // Store non-disabled questions
  // questionCounts: any = {}; // To store counts for each subjectId
  calculateQuestionCounts(subjectId: string): void {
    this.firebaseService.listensToChangeWithFilter('questions', 'subjectId', subjectId).subscribe((questions: any[]) => {
      // Initialize counters
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;
      let descriptiveCount = 0;
  
      // Count the questions based on their levels
      questions.forEach((question: any) => {
        if (question.questionLevel.toLowerCase() === 'easy') {
          easyCount++;
        } else if (question.questionLevel.toLowerCase() === 'medium') {
          mediumCount++;
        } else if (question.questionLevel.toLowerCase() === 'hard') {
          hardCount++;
        }else if (question.questionType.toLowerCase() === 'descriptive') {
          descriptiveCount++;
        }
        
      });
  
      // Store the counts in the object for later comparison
      this.questionCounts[subjectId] = {
        easyCount,
        mediumCount,
        hardCount,
        descriptiveCount
      };
    });
  }
  // fine
  disable = false;

  onInputChange(event: Event, index: number, controlName: string, subjectId: string): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
  
    // Fetch the counts for the particular subject and its question types
    this.getQuestionCountsForSubject(subjectId).then((availableCounts) => {
      let warningMessage = '';
  
      // Dynamically determine the key for the control name (easyCount, mediumCount, etc.)
      const countKey = `${controlName}Count` as keyof typeof availableCounts;
  
      if (availableCounts) {
        // Check if the input value exceeds the available count
        if (value > availableCounts[countKey]) {
          warningMessage = `The number of ${controlName.charAt(0).toUpperCase() + controlName.slice(1)} questions cannot exceed ${availableCounts[countKey]} for this subject.`;
        }
  
        // Check if the value exceeds 5 (the upper limit)
        if (value > 5) {
          warningMessage = `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} value cannot exceed 5!`;
          input.value = '5'; // Automatically reset to 5 if the value exceeds the limit
          value = 5; // Ensure the value is set to 5
        }
        // Check if the value is less than 0 (the lower limit)
        else if (value < 0) {
          warningMessage = `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} value cannot be less than 0!`;
          input.value = '0'; // Automatically reset to 0 if the value is less than 0
          value = 0; // Ensure the value is set to 0
        }
  
        // Set the warning message for the corresponding field (easy, medium, hard, descriptive)
        if (controlName === 'easy') {
          this.newValidationWarnings.easy[index] = warningMessage;
        } else if (controlName === 'medium') {
          this.newValidationWarnings.medium[index] = warningMessage;
        } else if (controlName === 'hard') {
          this.newValidationWarnings.hard[index] = warningMessage;
        } else if (controlName === 'descriptive') {
          this.newValidationWarnings.descriptive[index] = warningMessage;
        }
        
        // If there's any warning message, disable the save button
        this.updateSaveButtonStatus();
      }
  
      // Update the form control value
      this.rightListInputs.at(index).get(controlName)?.setValue(value);
    });
  }
  updateSaveButtonStatus(): void {
    // Check if any warnings exist across all subjects
    const hasWarnings = this.rightList.some((subject, index) => {
      return this.newValidationWarnings.easy[index] ||
             this.newValidationWarnings.medium[index] ||
             this.newValidationWarnings.hard[index] ||
             this.newValidationWarnings.descriptive[index];
    });
  
    this.disable = hasWarnings;
  }
    
  // New method to get counts for the subject's question types (easy, medium, hard, descriptive)
  async getQuestionCountsForSubject(subjectId: string): Promise<any> {
    // Create an object to store counts
    let counts = {
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      descriptiveCount: 0
    };
    // Use listensToChangeWithFilter to get the questions for each type
    await this.fetchQuestionCountByType(subjectId, 'Easy').then(count => counts.easyCount = count);
    await this.fetchQuestionCountByType(subjectId, 'Medium').then(count => counts.mediumCount = count);
    await this.fetchQuestionCountByType(subjectId, 'Hard').then(count => counts.hardCount = count);
    await this.fetchQuestionCountByType(subjectId, 'Descriptive').then(count => counts.descriptiveCount = count);
  
    return counts;
  }
  // Helper method to get the count of questions of a specific type for a subject
  fetchQuestionCountByType(subjectId: string, questionLevel: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.firebaseService.listensToChangeWithFilter('questions', 'subjectId', subjectId).subscribe((questions: any[]) => {
        // Filter and count the questions for the specific type
        const count = questions.filter(q => q.questionLevel === questionLevel || q.questionType === questionLevel).length;
        resolve(count);
      }, error => {
        console.error('Error fetching question data:', error);
        reject(error);
      });
    });
  }
  // Function to fetch question counts for each subject in the right list
  async fetchQuestionCountsForRightList(): Promise<void> {
    // Ensure that all counts are fetched before validation
    await Promise.all(
      this.rightList.map((subject) => this.calculateQuestionCounts(subject.subjectId))
    );
  }
  
  

  // Helper functions for warning messages
  addWarning(index: number, message: string): void {
    // Store warning message
    this.validationWarnings[index] = message;
  }

  removeWarning(index: number): void {
    // Reset warning message
    this.validationWarnings[index] = '';
  }

  validateAssessmentTitle(): void {
    if (this.assessmentTitle.trim().length === 0) {
      // Title cannot be empty or just spaces
      this.assessmentTitleWarning = "Assessment Title cannot be empty or just spaces.";
    } else if (this.assessmentTitle.length < 2) {
      // Title must have at least 2 characters
      this.assessmentTitleWarning = "Assessment Title must be at least 2 characters long.";
    } else {
      // Clear the warning if the title is valid
      this.assessmentTitleWarning = '';
    }
  }
  rightListWarning='';
  checkRightList(): boolean {
    // Check if the right list is empty
    const isRightListNotEmpty = this.rightList && this.rightList.length > 0;
    
    // Add a warning message if the right list is empty
    if (!isRightListNotEmpty) {
        this.rightListWarning = "Right list is empty";
    } else {
        this.rightListWarning = "";
    }

    return isRightListNotEmpty;
}

canSave(): boolean { 
  // Check if the form is valid (including all nested fields like difficulty levels, etc.) 
  const isFormValid = this.rightListForm.valid;        
  
  // Check if the assessment title is valid (not empty or just spaces) 
  const isAssessmentTitleValid = this.assessmentTitle.trim().length > 0;        
  
  // Additional condition to check if the title is unique (based on warning) 
  const isTitleUnique = !this.assessmentTitleWarning;        
  
  // Check if the save button should be disabled (i.e., if there are any warnings) 
  const isAllSubjectsValid = !this.disable;
  
  // Call the new method to check if the right list is not empty
  const isRightListNotEmpty = this.checkRightList();
  
  // Return the final condition, including the check for right list and subject selection
  return isFormValid && isAssessmentTitleValid && isTitleUnique && isAllSubjectsValid && isRightListNotEmpty;
}

  onSave(): void {
    if (!this.canSave()) {
      // Show toast message with validation error
      this.showValidationErrorToast();
    } else {
      // Proceed with save logic
      this.saveFormData();
    }
  }
  showValidationErrorToast(): void {
    this.toastr.warning('Please fix the validation issues before saving.',' Validation Error');
  }
    
  navigateToAssessments() {
    this.router.navigate(['/assessment-list']);
  }
  getEditData(assessmentId: string, isEditing: boolean): void {
    if (this.assessmentId && this.editFlag) {
      console.log('We are editing');

      // Use getItemsByFields to fetch the assessment data based on assessmentId
      this.firebaseService.listensToChangeWithFilter(this.assess_table, 'assessmentId', this.assessmentId).subscribe((assessments: any[]) => {
        if (assessments && assessments.length > 0) {
          const assessment = assessments[0]; // Assuming assessmentId is unique, get the first match
          this.assessmentTitle = assessment.assessmentName; // Populate assessmentTitle
          this.viewMode = assessment.assessmentType; // Populate viewMode

          // Fetch associated subjects and their ratings from the 'assessmentList' table
          this.firebaseService.listensToChangeWithFilter(TableNames.AssessmentList, 'assessmentId', this.assessmentId).subscribe((assessmentLists: any[]) => {
            if (assessmentLists && assessmentLists.length > 0) {
              const assessmentList = assessmentLists[0]; // Assuming assessmentId is unique, get the first match
              const subjectsWithRatings = assessmentList.subjects; // subjects with ratings

              // Initialize two new lists to store subject IDs and subjects with ratings
              const subjectIds: string[] = [];
              const subjectDetailsWithRatings: any[] = [];

              // Iterate through the subjects to extract subjectId and ratings
              for (const subjectId in subjectsWithRatings) {
                if (subjectsWithRatings.hasOwnProperty(subjectId)) {
                  const subject = subjectsWithRatings[subjectId];
                  subjectIds.push(subject.subjectId); // Store subjectId
                  subjectDetailsWithRatings.push({
                    subjectId: subject.subjectId,
                    subjectName: subject.subjectName,
                    easy: subject.easy,
                    medium: subject.medium,
                    hard: subject.hard,
                    descriptive: subject.descriptive
                  }); // Store subject details with ratings
                }
              }

              // Now update rightList with subject names using subjectIds
              this.rightList = subjectIds.map((subjectId) => {
                const subject = this.subjectList.find(sub => sub.subjectId === subjectId);
                return {
                  subjectId: subject ? subject.subjectId : '',  // Get the correct subjectId
                  subjectName: subject ? subject.subjectName : '', // Get the correct subjectName
                };
              });

              // Update rightListInputs with ratings data using subjectDetailsWithRatings
              const rightListInputs = this.fb.array(
                subjectDetailsWithRatings.map(subject =>
                  this.fb.group({
                    item: [subject],
                    easy: [subject.easy, [Validators.min(0), Validators.max(5)]],
                    medium: [subject.medium, [Validators.min(0), Validators.max(5)]],
                    hard: [subject.hard, [Validators.min(0), Validators.max(5)]],
                    descriptive: [subject.descriptive, [Validators.min(0), Validators.max(5)]],
                  })
                )
              );

              // Update the form control for rightListInputs
              this.rightListForm.setControl('rightListInputs', rightListInputs);

            } else {
              console.error('No matching assessmentList found for the given assessmentId');
            }
          }, (error) => {
            console.error('Error fetching assessmentList data:', error);
          });

        } else {
          console.error('Assessment not found in Firebase');
        }
      }, (error) => {
        console.error('Error fetching assessment data:', error);
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      const updateLists = () => {
        const leftListDom = Array.from(
          document.getElementById('sortable-left')!.querySelectorAll('li span:first-child')
        ).map((el) => el.textContent || '');

        const rightListDom = Array.from(
          document.getElementById('sortable-right')!.querySelectorAll('li span:first-child')
        ).map((el) => el.textContent || '');

        this.leftList = leftListDom.map((item) => {
          const subject = this.subjectList.find((sub) => sub.subjectName === item);
          return {
            subjectId: subject ? subject.subjectId : '', // Get the correct subjectId
            subjectName: item
          };
        });
        this.rightList = rightListDom.map((item) => {
          const subject = this.subjectList.find((sub) => sub.subjectName === item);
          return {
            subjectId: subject ? subject.subjectId : '', // Get the correct subjectId
            subjectName: item
          };
        });
        this.updateRightListForm(this.rightList);
        this.saveToSessionStorage();
      };
      const options = {
        group: 'shared',
        animation: 150,
        dragClass: 'bg-gray-200',
        onEnd: updateLists,
      };

      new Sortable(document.getElementById('sortable-left')!, options);
      new Sortable(document.getElementById('sortable-right')!, options);
    }
  }
  ngOnDestroy(): void {
    // Remove the event listener when the component is destroyed
    window.removeEventListener('beforeunload', this.clearSessionStorage);
      // Cleanup the beforeunload event listener when the component is destroyed
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
  subscribeToFormChanges(): void {
    this.rightListForm.valueChanges.subscribe(() => {
      this.saveToSessionStorage();
    });
  }
  updateRightListForm(newRightList: any[]): void {
    const updatedInputs = this.fb.array(
      newRightList.map((subject) => {
        // Find the corresponding subject in rightListInputs (existing subject ratings from the form)
        const existingSubjectInput = this.rightListInputs.controls.find((control) => {
          const subjectControl = control.value; // Get the form control value
          return subjectControl.item.subjectId === subject.subjectId; // Match by subjectId
        });
        const easy = existingSubjectInput ? existingSubjectInput.value.easy : 0;
        const medium = existingSubjectInput ? existingSubjectInput.value.medium : 0;
        const hard = existingSubjectInput ? existingSubjectInput.value.hard : 0;
        const descriptive = existingSubjectInput ? existingSubjectInput.value.descriptive : 0;
        return this.fb.group({
          item: [subject], // The subject is passed as is.
          easy: [easy, [Validators.min(0), Validators.max(5)]],
          medium: [medium, [Validators.min(0), Validators.max(5)]],
          hard: [hard, [Validators.min(0), Validators.max(5)]],
          descriptive: [descriptive, [Validators.min(0), Validators.max(5)]],
        });
      })
    );
    this.rightListForm.setControl('rightListInputs', updatedInputs);
  }
  saveFormData(): void {
    this.fetchQuestionCountsForRightList();
    const hasDescriptiveGreaterThanZero = this.rightListInputs.controls.some((group) => {
      return group.get('descriptive')?.value > 0;
    });
    this.isAutoEvaluated = !hasDescriptiveGreaterThanZero;
    if (this.assessmentTitle.trim().length === 0) {
      this.assessmentTitleWarning = "Assessment Title cannot be empty or just spaces.";
      return;
    }

    // If editing, skip title uniqueness check and proceed directly to save/update
    if (this.editFlag) {
      // Update existing assessment and associated subjects
      this.updateAssessment();
    } else {
      // Check if the title is unique when creating a new assessment
      this.checkAssessmentTitleUniqueness(this.assessmentTitle).then((isUnique) => {
        if (!isUnique) {
          this.assessmentTitleWarning = 'This assessment title already exists. Please choose a unique title.';
          return;
        }
        this.addAssessment().then((assessmentId: string) => {
          if (this.rightListForm.valid) {
            const subjects = this.mapRightListInputs(this.rightList);

            const updatedAssessmentList: AssessmentList = {
              assessmentId,
              dateCreated: Date.now(),
              dateUpdated: Date.now(),
              isDisable:false,
              subjects: subjects,
            };

            // Save or update assessmentList
            this.firebaseService.create('assessmentList/' + assessmentId, updatedAssessmentList)
              .then(() => {
                this.assessmentList.unshift(updatedAssessmentList); // Update the list of assessments
                this.toastr.success('Assessment Created', 'Created');
                this.resetRightListAndForm();  // Reset the form and right list
                this.assessmentTitle = ''; // Clear the title

              })
              .catch((error) => {
                console.error('Error saving data:', error);
                this.toastr.error('Failed to save data. Please try again.');
              });
          } else {
            this.toastr.warning('Please fill in the form correctly.');
          }
        }).catch((error) => {
          this.toastr.error('Failed to create assessment. ' + error);
        });
      });
    }
  }

  updateAssessment(): void {
    // Ensure the assessmentId is available for updating
    if (this.assessmentId) {
      // Step 1: Map the subjects and ratings from the form (right list)
      const subjects = this.mapRightListInputs(this.rightList);

      // Get the original assessment details (before update) to keep the dateCreated
      const originalAssessment = this.assessmentList.find((assessment) => assessment.assessmentId === this.assessmentId);
      const originalDateCreated = originalAssessment ? originalAssessment.dateCreated : Date.now();  // fallback to Date.now() if not found
      // Prepare the updated AssessmentList object
      const updatedAssessmentList: AssessmentList = {
        assessmentId: this.assessmentId,
        dateCreated: originalDateCreated,  // Keep the original dateCreated value
        dateUpdated: Date.now(),   
        isDisable:false,       // Update the dateUpdated field
        subjects: subjects,              // Update with the new subject details
      };
      // Prepare the updated Assessment object
      const updatedAssessment: Assessment = {
        assessmentId: this.assessmentId,
        assessmentName: this.assessmentTitle,  // Update with the new title
        assessmentType: this.viewMode,
        dateCreated: originalDateCreated,     // Use the same view mode
        dateUpdated: Date.now(),               // Update the dateUpdated field
        isDisabled: false,                     // Ensure the assessment is not disabled
        isautoEvaluated: this.isAutoEvaluated, // Keep the same auto evaluation status
      };

      // Step 2: Update the Assessment document
      this.firebaseService.update('assessment/' + this.assessmentId, updatedAssessment)
        .then(() => {
          // Successfully updated the Assessment, now update the AssessmentList
          this.firebaseService.update('assessmentList/' + this.assessmentId, updatedAssessmentList)
            .then(() => {
              // Both documents updated successfully
              this.assessmentList = this.assessmentList.map((assessment) => {
                if (assessment.assessmentId === this.assessmentId) {
                  return updatedAssessmentList; // Replace the old AssessmentList with the updated one
                }
                return assessment;
              });

              this.toastr.success('Assessment and Assessment List Updated successfully', 'Updated');
              this.resetRightListAndForm();  // Reset the form and right list
              this.assessmentTitle = '';     // Clear the title field
              this.navigateToAssessments();  // Navigate to the assessments page
              console.log(this.updateAssessment, updatedAssessmentList);
            })
            .catch((error) => {
              console.error('Error updating AssessmentList:', error);
              this.toastr.error('Failed to update AssessmentList. Please try again.');
            });
        })
        .catch((error) => {
          console.error('Error updating Assessment:', error);
          this.toastr.error('Failed to update Assessment. Please try again.');
        });
    }
  }


  saveAssessmentAndSubjects(): void {
    // Save the assessment and subject data
    this.addAssessment().then((assessmentId: string) => {
      if (this.rightListForm.valid) {
        const subjects = this.mapRightListInputs(this.rightList);
        const assessmentList: AssessmentList = {
          assessmentId,
          dateCreated: Date.now(),
          dateUpdated: Date.now(),
          isDisable:false,
          subjects: subjects,
        };

        // Save the assessment list
        this.firebaseService.create('assessmentList/' + assessmentId, assessmentList)
          .then(() => {
            this.assessmentList.unshift(assessmentList);
            this.fetchLeftList();
            this.toastr.success('Assessment Created successfully', 'Created');
            this.resetRightListAndForm();
            this.assessmentTitle = '';  // Reset the title
          })
          .catch((error) => {
            console.error('Error saving data:', error);
            this.toastr.error('Failed to save data. Please try again.');
          });
      } else {
        this.toastr.warning('Please fill in the form correctly.');
      }
    }).catch((error) => {
      this.toastr.error('Failed to create assessment. ' + error);
    });
  }
  resetPage(): void {
    // Reset lists
    this.rightList = [];
    this.subjectList = [];
    this.updatedList = [];

    // Reset form values
    this.rightListForm.reset();
    this.setRightListFormControls([]);

    // Reset other variables
    this.assessmentTitle = '';
    this.viewMode = 'internal';  // or 'external', depending on your default state

    // Optionally, clear session storage (if you want to reset session data as well)
    this.clearSessionStorage();

    // Optionally, reload any other necessary data or state after reset (if required)
    console.log('Page has been reset!');
  }
  setRightListFormControls(controls: any[]): void {
    const rightListInputs = this.rightListForm.get('rightListInputs') as FormArray;
    while (rightListInputs.length) {
      rightListInputs.removeAt(0);
    }
    controls.forEach(control => {
      rightListInputs.push(this.fb.control(control));
    });
  }
}