import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { AssessmentList, SubjectCounts } from '../../../models/newassessment';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import Sortable from 'sortablejs';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import { NavigationStart, Router } from '@angular/router';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { AssessmentService } from '../services/assessmentServices/assessment.service';
@Component({
  selector: 'app-drag-drop',
  standalone: true,
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [DatePipe],
})
export class DragDropComponent implements AfterViewInit, OnInit {
  leftList: { subjectId: string, subjectName: string }[] = [];
  rightList: { subjectId: string, subjectName: string }[] = [];
  subjectList: { subjectId: string, subjectName: string }[] = [];
  updatedList: string[] = [];
 
  createdOn: string = '';
  savedFormData: any = null;
  rightListForm!: FormGroup; // Form to handle right list inputs
  private appVersion = '1.0.0'; // App version for local storage management
  viewMode: 'internal' | 'external' = 'internal'; // Toggle view mode
  validationWarnings: string[] = []; // Warnings for Fvalidation
  assessmentTitle: string = ''; // Title for assessment
  tableName = TableNames.Subject; // Firebase collection name for subjects
  assess_table = TableNames.Assessment;
  isModalVisible: boolean=false;
  eConfirmationVisible: boolean=false;

  constructor(
    private fb: FormBuilder,
    private router: Router, // Inject Router service
    private firebaseService: FireBaseService<Subject | AssessmentList | Assessment>,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private assessmentService:AssessmentService
  ) { }
  assessmentId:string=''
  editFlag:boolean=false;
  ngOnInit(): void {
    this.initializeRightListForm(); // Initialize form
    if (this.isBrowser()) {
      // this.checkVersionAndResetData(); // Clear local storage if version mismatch
      this.loadFromLocalStorage(); // Load lists from local storage
      this.fetchLeftList(); // Fetch subjects from Firebase

      const savedData = localStorage.getItem('savedData'); // Load saved data
      if (savedData) {
        this.savedFormData = JSON.parse(savedData);
      }
    }

    // Subscribe to value changes for right list inputs (difficulty levels)
    this.subscribeToFormChanges();

    // Listen for route changes and clear local storage when navigating to a new route
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.clearLocalStorageOnNavigation();  // Clear local storage on route change
      }
    });
    // for edit
    this.assessmentService.assessmentId$.subscribe((assessmentId) => {
      if (assessmentId) {
        this.assessmentId = assessmentId;
        console.log(this.assessmentId)
        // this.fetchAssessmentDetails();
      }
    });
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

        this.leftList = leftListDom.map((item) => ({ subjectId: this.subjectList.find((sub) => sub.subjectName === leftListDom[0])?.subjectId || '', subjectName: item }));
        this.rightList = rightListDom.map((item) => ({ subjectId: this.subjectList.find((sub) => sub.subjectName === leftListDom[0])?.subjectId || '', subjectName: item }));
        this.updateRightListForm(this.rightList); // Update right list form
        // this.rightList = rightListDom;

        this.saveToLocalStorage(); // Persist data
      };

      const options = {
        group: 'shared',
        animation: 150,
        dragClass: 'bg-gray-200',
        onEnd: updateLists, // Update lists on drag end
      };

      new Sortable(document.getElementById('sortable-left')!, options);
      new Sortable(document.getElementById('sortable-right')!, options);
    }
  }

  // Method to clear local storage when navigating to another route
  clearLocalStorageOnNavigation(): void {
    // Clear all local storage data, or only the data you need
    localStorage.removeItem('leftList');
    localStorage.removeItem('rightList');
    localStorage.removeItem('rightListInputs');
    localStorage.removeItem('createdOn');
    localStorage.removeItem('inputText');
    localStorage.removeItem('savedData');
    localStorage.removeItem('appVersion'); // Clear the version as well
  }

  toggleViewMode(mode: 'internal' | 'external'): void {
    this.viewMode = mode; // Toggle view mode
  }

  initializeRightListForm(): void {
    this.rightListForm = this.fb.group({
      createdOn: [this.getCurrentTimestamp()],
      inputText: [''],
      rightListInputs: this.fb.array([]), // Dynamic form array for right list inputs
    });
  }

  get rightListInputs(): FormArray {
    return this.rightListForm.get('rightListInputs') as FormArray;
  }

  updateRightListForm(newRightList: Subject[]): void {
    const updatedInputs = this.fb.array(
      newRightList.map((subject) =>  // Use subjectId directly
        this.fb.group({
          item: [subject],  // Store subjectId here, not the name
          easy: [0, [Validators.min(0), Validators.max(5)]], // Difficulty levels
          medium: [0, [Validators.min(0), Validators.max(5)]],
          hard: [0, [Validators.min(0), Validators.max(5)]],
          descriptive: [0, [Validators.min(0), Validators.max(5)]],
        })
      )
    );
    this.rightListForm.setControl('rightListInputs', updatedInputs);  
    console.log("updated",updatedInputs);
    
  }
  
  subscribeToFormChanges(): void {
    this.rightListForm.valueChanges.subscribe((values) => {
    });
    // Listen to changes in specific fields like difficulty levels
    this.rightListInputs.valueChanges.subscribe((inputs: any) => {
    });
  }
  saveToLocalStorage(): void {
    if (this.isBrowser()) {
      localStorage.setItem('appVersion', this.appVersion);
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

  checkVersionAndResetData(): void {
    const savedVersion = localStorage.getItem('appVersion');
    if (savedVersion !== this.appVersion) {
      localStorage.clear(); // Reset storage if app version changes
      this.leftList = [];
      this.rightList = [];
      this.initializeRightListForm();
    }
  }


  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  calculateAutoEvaluated(subjects: any[]): boolean {
    // Check if any subject has a 'descriptive' value greater than 0
    let isAutoEvaluated = true; // Default to true
    subjects.forEach(subject => {
      console.log(`Subject: ${subject.item}, Descriptive Value: ${subject.descriptive}`); // Log subject and its descriptive value
      if (subject.descriptive > 0) {
        isAutoEvaluated = false; // If descriptive value is greater than 0, set to false
      }
    });
    
    return isAutoEvaluated;
    console.log("right list",this.rightList);
  }
  isAutoEvaluated:boolean=true
    // isAutoEvaluated = this.calculateAutoEvaluated(this.rightList);
    
  // Updated addAssessment to return a Promise with the generated assessmentId
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
  saveFormData(): void {
    const hasDescriptiveGreaterThanZero = this.rightListInputs.controls.some((group) => {
      // Check if any subject has descriptive score greater than 0
      return group.get('descriptive')?.value > 0;
    });

    // Set autoevaluated to false if any 'descriptive' value is greater than 0
    this.isAutoEvaluated = !hasDescriptiveGreaterThanZero;
    if (this.assessmentTitle.trim().length === 0) {
      this.assessmentTitleWarning = "Assessment Title cannot be empty or just spaces.";
      return;
    }
    this.checkAssessmentTitleUniqueness(this.assessmentTitle).then((isUnique) => {
      if (!isUnique) {
        this.assessmentTitleWarning = 'This assessment title already exists. Please choose a unique title.';
        return;
      }

      this.addAssessment().then((assessmentId: string) => {
        if (this.rightListForm.valid) {
          const assessmentList: AssessmentList = {
            assessmentId,
            dateCreated: Date.now(),
            dateUpdated: Date.now(),
            subjects: this.mapRightListInputs(this.leftList),
          };

          this.firebaseService.create('assessmentList/' + assessmentId, assessmentList)
            .then(() => {
              this.assessmentList.unshift(assessmentList);
              this.fetchLeftList();
              this.toastr.success('Assessment Created successfully', 'Created');
              this.resetRightListAndForm();
              this.assessmentTitle = '';
              // this.router.navigate(['/assessment-list']);
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

  closeModal(): void {
    this.isModalVisible = false; // For the Assessment Details modal
    this.eConfirmationVisible = false; // For the Delete Confirmation modal
  }
  checkAssessmentTitleUniqueness(title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getAllData(this.assess_table).subscribe((assessments: any[]) => {
        const existingTitles = assessments.map((assessment) => assessment.assessmentName.toLowerCase());
        if (existingTitles.includes(title.toLowerCase())) {
          resolve(false); // Title already exists
        } else {
          resolve(true); // Title is unique
        }
      }, (error) => {
        reject('Failed to fetch assessment data for uniqueness check: ' + error);
      });
    });
  }
  assessmentTitleWarning: string = ''; // Variable to hold the warning message
  assessmentList: AssessmentList[] = [];

  resetRightListAndForm(): void {
    this.rightList = [];
    this.rightListForm.reset();
    this.initializeRightListForm();
    this.fetchLeftList(); // Reload subjects
    this.saveToLocalStorage();
  }
  // trying to
  fetchLeftList(): void {
    this.firebaseService.getAllDataByFilter(this.tableName, 'isDisabled', false).subscribe((data: any[]) => {
      this.leftList = data
        .map(item => ({ subjectId: item.subjectId, subjectName: item.subjectName })) // Fetch both subjectId and subjectName
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName)); // Sort subjects alphabetically

        this.subjectList = this.leftList
        .map(item => ({ subjectId: item.subjectId, subjectName: item.subjectName })) // Use subjectName for display in HTML
    });
  }

  getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  mapRightListInputs(left:any): any {
    return this.rightListInputs.value.reduce((subjects: any, input: any) => {
      subjects[input.item.subjectId] = {  // input.item is subjectId now, not subjectName
        easy: input.easy,
        medium: input.medium,
        hard: input.hard,
        descriptive: input.descriptive,
      };
      return subjects;

    }, {});
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
  }
}