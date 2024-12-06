import { CommonModule } from '@angular/common';
import { AssessmentList,SubjectCounts } from '../../../models/newassessment'; // Import the AssessmentList type
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import Sortable from 'sortablejs';
import { Assessment } from '../../../models/assessment';
import { TableNames } from '../../../enums/TableName';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class DragDropComponent implements AfterViewInit, OnInit {
  leftList: string[] = []; // Dynamically loaded from Firebase
  rightList: string[] = [];
  createdOn: string = '';
  savedFormData: any = null;
  rightListForm!: FormGroup; // Form to handle right list inputs
  private appVersion = '1.0.0'; // App version for local storage management
  viewMode: 'internal' | 'external' = 'internal'; // Toggle view mode
  validationWarnings: string[] = []; // Warnings for Fvalidation
  assessmentTitle: string = ''; // Title for assessment
  tableName = 'subject'; // Firebase collection name for subjects
  assess_table=TableNames.Assessment;

  constructor(private fb: FormBuilder,private router:Router, private firebaseService: FireBaseService<Subject | AssessmentList | Assessment>) {}

  ngOnInit(): void {
    this.initializeRightListForm(); // Initialize form
    if (this.isBrowser()) {
      this.checkVersionAndResetData(); // Clear local storage if version mismatch
      this.loadFromLocalStorage(); // Load lists from local storage
      this.fetchLeftList(); // Fetch subjects from Firebase

      const savedData = localStorage.getItem('savedData'); // Load saved data
      if (savedData) {
        this.savedFormData = JSON.parse(savedData);
      }
    }

    // Subscribe to value changes for right list inputs (difficulty levels)
    this.subscribeToFormChanges();
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

        this.leftList = leftListDom; // Update left list
        this.updateRightListForm(rightListDom); // Update right list form
        this.rightList = rightListDom;

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

  updateRightListForm(newRightList: string[]): void {
    const updatedInputs = this.fb.array(
      newRightList.map((item) =>
        this.fb.group({
          item: [item],
          easy: [0, [Validators.min(0), Validators.max(5)]], // Difficulty levels
          medium: [0, [Validators.min(0), Validators.max(5)]],
          hard: [0, [Validators.min(0), Validators.max(5)]],
          descriptive: [0, [Validators.min(0), Validators.max(5)]],
        })
      )
    );
    this.rightListForm.setControl('rightListInputs', updatedInputs);
  }

  subscribeToFormChanges(): void {
    // Listen to changes in right list inputs and log them
    this.rightListForm.valueChanges.subscribe((values) => {
      console.log('Form Values Changed:', values);
      // You can perform additional actions here when form changes
    });

    // Listen to changes in specific fields like difficulty levels
    this.rightListInputs.valueChanges.subscribe((inputs: any) => {
      console.log('Right List Inputs Changed:', inputs);
      // You can process changes or trigger validation/warnings here
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
                item: [entry.item],
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
        isautoEvaluated: true
      };

      // Save the new assessment to Firebase
      this.firebaseService.create(this.assess_table + '/' + uniqueId, assessment)
        .then(() => {
          // Resolve with the unique assessmentId after successful save
          resolve(uniqueId);
        })
        .catch((error) => {
          // Reject if there is an error
          reject('Failed to save assessment: ' + error);
        });
    });
  }

  saveFormData(): void {
    // Call addAssessment() and wait for the ID to be generated
    this.addAssessment().then((assessmentId: string) => {
      // After successful assessment creation, use the assessmentId
      if (this.rightListForm.valid) {
        const assessmentList: AssessmentList = {
          assessmentId,
          subjects: this.mapRightListInputs()
        };

        // Save the data in the 'assessmentList' collection
        this.firebaseService.create('assessmentList/' + assessmentId, assessmentList)
          .then(() => {
            console.log('Data saved successfully!');
            this.resetRightListAndForm(); // Reset after save
            this.router.navigate(['/assessment-list']); 
          })
          .catch((error) => {
            console.error('Error saving data:', error);
            alert('Failed to save data. Please try again.');
          });
      } else {
        alert('Please fill in the form correctly.');
      }
    }).catch((error) => {
      alert('Failed to create assessment. ' + error);
    });
  }

  resetRightListAndForm(): void {
    this.rightList = [];
    this.rightListForm.reset();
    this.initializeRightListForm();
    this.fetchLeftList(); // Reload subjects
    this.saveToLocalStorage();
  }

  fetchLeftList(): void {
    this.firebaseService.getAllData(this.tableName).subscribe((data: any[]) => {
      this.leftList = data.map(item => item.subjectName); // Assuming subjectName field exists
    });
  }

  getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  mapRightListInputs(): any {
    return this.rightListInputs.value.reduce((subjects: any, input: any) => {
      subjects[input.item] = {
        easy: input.easy,
        medium: input.medium,
        hard: input.hard,
        descriptive: input.descriptive,
      };
      return subjects;
    }, {});
  }
  onInputChange(event: Event, index: number, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    if (value > 5) {
      input.value = '5';
      value = 5;
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

  addWarning(index: number, message: string): void {
    this.validationWarnings[index] = message;
  }

  removeWarning(index: number): void {
    this.validationWarnings[index] = '';
  }
}
 

