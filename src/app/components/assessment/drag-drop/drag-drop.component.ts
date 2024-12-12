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
  ngOnInit(): void {
    this.initializeRightListForm(); 
    if (this.isBrowser()) {
      this.loadFromLocalStorage(); 
      this.fetchLeftList(); // Fetch subjects from Firebase

      const savedData = localStorage.getItem('savedData'); // Load saved data
      if (savedData) {
        this.savedFormData = JSON.parse(savedData);
      }
    }
    this.subscribeToFormChanges();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.clearLocalStorageOnNavigation();  // Clear local storage on route change
      }
    });
    // for edit functionality
    this.assessmentService.assessmentId$.subscribe((assessmentId) => {
      if (assessmentId) {
        this.assessmentId = assessmentId;
        this.editFlag=true;
        console.log(this.assessmentId)
      }
    });
    this.getEditData(this.assessmentId,this.editFlag);
  }
  getEditData(assessmentId: string, isEditing: boolean): void {
    if (this.assessmentId && this.editFlag) {
      console.log('We are editing');
      
      // Use getItemsByFields to fetch the assessment data based on assessmentId
      this.firebaseService.getItemsByFields(this.assess_table, ['assessmentId'], this.assessmentId).subscribe((assessments: any[]) => {
        if (assessments && assessments.length > 0) {
          const assessment = assessments[0]; // Assuming assessmentId is unique, get the first match
          this.assessmentTitle = assessment.assessmentName; // Populate assessmentTitle
          this.viewMode = assessment.assessmentType; // Populate viewMode
  
          // You can also update other form fields as needed here
          this.updateRightListForm(assessment);
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

        this.leftList = leftListDom.map((item) => ({ subjectId: this.subjectList.find((sub) => sub.subjectName === leftListDom[0])?.subjectId || '', subjectName: item }));
        this.rightList = rightListDom.map((item) => ({ subjectId: this.subjectList.find((sub) => sub.subjectName === leftListDom[0])?.subjectId || '', subjectName: item }));
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
// clear ls when moving to another route
  clearLocalStorageOnNavigation(): void {
    localStorage.removeItem('leftList');
    localStorage.removeItem('rightList');
    localStorage.removeItem('rightListInputs');
    localStorage.removeItem('createdOn');
    localStorage.removeItem('inputText');
    localStorage.removeItem('savedData');
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
  updateRightListForm(newRightList: any[]): void {
    const updatedInputs = this.fb.array(
      newRightList.map((subject) =>  
        this.fb.group({
          item: [subject],  
          easy: [0, [Validators.min(0), Validators.max(5)]],
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
  saveFormData(): void {
    const hasDescriptiveGreaterThanZero = this.rightListInputs.controls.some((group) => {
      // Check if any subject has descriptive score greater than 0
      return group.get('descriptive')?.value > 0;
    });
   
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

  mapRightListInputs(left:any): any {
    return this.rightListInputs.value.reduce((subjects: any, input: any) => {
      subjects[input.item.subjectId] = { 
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