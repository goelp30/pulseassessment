//loging correct in console
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
import { ToastrService} from 'ngx-toastr';
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
  rightList: { subjectId: string, subjectName: string }[] = [];
  subjectList: { subjectId: string, subjectName: string }[] = [];
  updatedList: string[] = [];
  assessmentTitleWarning: string = ''; 
  assessmentList: AssessmentList[] = [];
  createdOn: string = '';
  savedFormData: any = null;
  isAutoEvaluated:boolean=true
  rightListForm!: FormGroup; // Form to handle right list inputs
  viewMode: 'internal' | 'external' = 'internal'; // Toggle view mode
  validationWarnings: string[] = []; // Warnings for Formvalidation
  assessmentTitle: string = ''; // Title for assessment
  subject_table = TableNames.Subject; // Firebase collection name for subjects
  assess_table = TableNames.Assessment;
  isModalVisible: boolean=false;
  eConfirmationVisible: boolean=false;

  constructor(
    private fb: FormBuilder,
    private router: Router, 
    private firebaseService: FireBaseService<Subject | AssessmentList | Assessment>,
    private toastr: ToastrService,
    private assessmentService:AssessmentService
  ) { }
  assessmentId:string=''
  editFlag:boolean=false;

// clear ls when moving to another route
ngOnInit(): void {
  this.initializeRightListForm();
  if (this.isBrowser()) {
    this.loadFromLocalStorage();
    this.fetchLeftList();

    const savedData = localStorage.getItem('savedData');
    if (savedData) {
      this.savedFormData = JSON.parse(savedData);
    }
  }

  this.subscribeToFormChanges();
  this.router.events.subscribe((event) => {
    if (event instanceof NavigationStart) {
      this.clearLocalStorageOnNavigation();
    }
  });

  // Clear local storage and cache when the user leaves the page
  window.addEventListener('beforeunload', this.clearLocalStorage);

  this.assessmentService.assessmentId$.subscribe((assessmentId) => {
    if (assessmentId) {
      this.assessmentId = assessmentId;
      this.editFlag = true;
      this.getEditData(this.assessmentId, this.editFlag);
    }
  });
}

ngOnDestroy(): void {
  // Remove the event listener when the component is destroyed
  window.removeEventListener('beforeunload', this.clearLocalStorage);
}

clearLocalStorage(): void {
  localStorage.removeItem('leftList');
  localStorage.removeItem('rightList');
  localStorage.removeItem('rightListInputs');
  localStorage.removeItem('createdOn');
  localStorage.removeItem('inputText');
  localStorage.removeItem('savedData');
}

clearLocalStorageOnNavigation(): void {
  console.log('cleared');
  
  this.clearLocalStorage();
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

  
  subscribeToFormChanges(): void {
    this.rightListForm.valueChanges.subscribe((values) => {
    });
    this.rightListInputs.valueChanges.subscribe((inputs: any) => {
    });
  }
  saveToLocalStorage(): void {
    if (this.isBrowser()) {
      localStorage.setItem('leftList', JSON.stringify(this.leftList));
      localStorage.setItem('rightList', JSON.stringify(this.rightList));
      localStorage.setItem('rightListInputs', JSON.stringify(this.rightListInputs.value));
      localStorage.setItem('createdOn', this.rightListForm.value.createdOn);
      localStorage.setItem('inputText', this.rightListForm.value.inputText);
      if (this.savedFormData) {
        localStorage.setItem('savedData', JSON.stringify(this.savedFormData));
      }
    }
  }
  loadFromLocalStorage(): void {
    if (this.isBrowser()) {
      const leftList = localStorage.getItem('leftList');
      const rightList = localStorage.getItem('rightList');
      const rightListInputs = localStorage.getItem('rightListInputs');
      const createdOn = localStorage.getItem('createdOn');
      const inputText = localStorage.getItem('inputText');

      if (leftList) this.leftList = JSON.parse(leftList);
      if (rightList) this.rightList = JSON.parse(rightList);

      if (rightListInputs) {
        this.rightListForm.setControl(
          'rightListInputs',
          this.fb.array(
            JSON.parse(rightListInputs).map((entry: any) =>
              this.fb.group({
                item: [entry.subjectId],
                easy: [entry.easy, [Validators.min(0), Validators.max(5)]],
                medium: [entry.medium, [Validators.min(0), Validators.max(5)]],
                hard: [entry.hard, [Validators.min(0), Validators.max(5)]],
                descriptive: [entry.descriptive, [Validators.min(0), Validators.max(5)]],
              })
            )
          )
        );
      }
      if (createdOn) this.rightListForm.patchValue({ createdOn });
      if (inputText) this.rightListForm.patchValue({ inputText });
    }
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  calculateAutoEvaluated(subjects: any[]): boolean {
    let isAutoEvaluated = true;
    subjects.forEach(subject => {
      if (subject.descriptive > 0) {
        isAutoEvaluated = false; // If descriptive value is greater than 0, set to false
      }
    });
    
    return isAutoEvaluated;
    console.log("right list",this.rightList);
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
    this.saveToLocalStorage();
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
  onInputChange(event: Event, index: number, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (value > 5) {
      this.addWarning(index, `${controlName} value cannot exceed 5!`);
    } else if (value < 0) {
      input.value = '0';
      value = 0;
      this.addWarning(index, `${controlName} value cannot be less than 0!`);
    } else {
      this.removeWarning(index);
    }

    this.rightListInputs.at(index).get(controlName)?.setValue(value);
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
  addWarning(index: number, message: string): void {
    this.validationWarnings[index] = message;
  }

  removeWarning(index: number): void {
    this.validationWarnings[index] = '';
  }
  canSave(): boolean {
    // Check if the form is valid (including all nested fields like difficulty levels, etc.)
    const isFormValid = this.rightListForm.valid;

    // Check if the assessment title is valid (not empty or just spaces)
    const isAssessmentTitleValid = this.assessmentTitle.trim().length > 0;

    // Additional condition to check if the title is unique (based on warning)
    const isTitleUnique = !this.assessmentTitleWarning;

    // If any validation is not fulfilled, the save button should be disabled
    return isFormValid && isAssessmentTitleValid && isTitleUnique;
  }
  navigateToAssessments(){
    this.router.navigate(['/assessment-list']);
    this.clearLocalStorage();
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
        this.saveToLocalStorage();
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
        dateUpdated: Date.now(),          // Update the dateUpdated field
        subjects: subjects,              // Update with the new subject details
      };
  
      // Prepare the updated Assessment object
      const updatedAssessment: Assessment = {
        assessmentId: this.assessmentId,
        assessmentName: this.assessmentTitle,  // Update with the new title
        assessmentType: this.viewMode,    
        dateCreated:originalDateCreated,     // Use the same view mode
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
calculateQuestionCounts(subjectId: string): void {
  // Assuming `questions` is the array of question objects
  this.firebaseService.listensToChangeWithFilter('questions', 'subjectId', subjectId).subscribe((questions: any[]) => {
    // Initialize counters
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let descriptiveCount = 0;

    // Iterate through all the questions for this subject
    questions.forEach((question: any) => {
      // Check the question level and increment the appropriate counter
      if (question.questionLevel === 'Easy') {
        easyCount++;
      } else if (question.questionLevel === 'Medium') {
        mediumCount++;
      } else if (question.questionLevel === 'Hard') {
        hardCount++;
      }

      // Check if the question type is descriptive
      if (question.questionType === 'Descriptive') {
        descriptiveCount++;
      }
    });

    // Log the counts to the console
    console.log(`Subject ID: ${subjectId}`);
    console.log(`Easy Questions: ${easyCount}`);
    console.log(`Medium Questions: ${mediumCount}`);
    console.log(`Hard Questions: ${hardCount}`);
    console.log(`Descriptive Questions: ${descriptiveCount}`);
  });
}
fetchQuestionCountsForRightList(): void {
  this.rightList.forEach(subject => {
    // Call the method to calculate counts for each subject in the rightList
    this.calculateQuestionCounts(subject.subjectId);
  });
}
}