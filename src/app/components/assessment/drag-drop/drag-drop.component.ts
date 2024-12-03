import { Component, AfterViewInit, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FireBaseService } from '../../../../sharedServices/FireBaseService';
import { Subject } from '../../../models/subject';
import { TableNames } from '../../../enums/TableName';
import Sortable from 'sortablejs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drag-drop',
  standalone: true,
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
})
export class DragDropComponent implements AfterViewInit, OnInit {
  leftList: string[] = []; // Dynamically loaded from Firebase
  rightList: string[] = [];
  createdOn: string = '';
  savedFormData: any = null;
  rightListForm!: FormGroup;
  private appVersion = '1.0.0';
  viewMode: 'internal' | 'external' = 'internal';
  validationWarnings: string[] = [];
  assessmentTitle: string = '';
  tableName = 'subject'; // Firebase collection name

  constructor(private fb: FormBuilder, private firebaseService: FireBaseService<Subject>) {}

  ngOnInit(): void {
    this.initializeRightListForm();
    if (this.isBrowser()) {
      this.checkVersionAndResetData();
      this.loadFromLocalStorage();

      // Fetch subjects from Firebase
      this.fetchLeftList();

      // Load saved data for recently saved view
      const savedData = localStorage.getItem('savedData');
      if (savedData) {
        this.savedFormData = JSON.parse(savedData);
      }
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser()) {
      const updateLists = () => {
        const leftListDom = Array.from(
          document
            .getElementById('sortable-left')!
            .querySelectorAll('li span:first-child')
        ).map((el) => el.textContent || '');

        const rightListDom = Array.from(
          document
            .getElementById('sortable-right')!
            .querySelectorAll('li span:first-child')
        ).map((el) => el.textContent || '');

        this.leftList = leftListDom;
        this.updateRightListForm(rightListDom);
        this.rightList = rightListDom;

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

  updateRightListForm(newRightList: string[]): void {
    const updatedInputs = this.fb.array(
      newRightList.map((item) =>
        this.fb.group({
          item: [item],
          easy: [0, [Validators.min(0), Validators.max(5)]],
          medium: [0, [Validators.min(0), Validators.max(5)]],
          hard: [0, [Validators.min(0), Validators.max(5)]],
          descriptive: [0, [Validators.min(0), Validators.max(5)]],
        })
      )
    );
    this.rightListForm.setControl('rightListInputs', updatedInputs);
  }

  saveToLocalStorage(): void {
    if (this.isBrowser()) {
      localStorage.setItem('appVersion', this.appVersion);
      localStorage.setItem('leftList', JSON.stringify(this.leftList));
      localStorage.setItem('rightList', JSON.stringify(this.rightList));
      localStorage.setItem(
        'rightListInputs',
        JSON.stringify(this.rightListInputs.value)
      );
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
                descriptive: [
                  entry.descriptive,
                  [Validators.min(0), Validators.max(5)],
                ],
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
      localStorage.clear();
      this.leftList = [];
      this.rightList = [];
      this.initializeRightListForm();
    }
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  saveFormData(): void {
    if (this.rightListForm.valid) {
      this.savedFormData = {
        createdOn: this.getCurrentTimestamp(),
        inputText: this.rightListForm.value.inputText,
        rightListInputs: this.rightListInputs.value,
        viewMode: this.viewMode,
        assessmentTitle: this.assessmentTitle,
      };

      localStorage.setItem('savedData', JSON.stringify(this.savedFormData));

      alert('Data saved successfully!');

      // Reset only the right list and form
      this.resetRightListAndForm();
    } else {
      alert('Please fill in the form correctly.');
    }
  }

  resetRightListAndForm(): void {
    // Clear the right list
    this.rightList = [];
    this.rightListForm.reset();
    this.initializeRightListForm();  // Reinitialize the form to start fresh
    
    // Optionally, re-fetch the left list from Firebase (if needed)
    this.fetchLeftList();
    
    this.saveToLocalStorage();  // Save the changes to local storage
  }

  fetchLeftList(): void {
    // Fetch subjects from Firebase
    this.firebaseService.getAllData(this.tableName).subscribe((res: Subject[]) => {
      this.leftList = res.map(subject => subject.subjectName);
      this.saveToLocalStorage();  // Save to local storage after fetching
    });
  }

  getCurrentTimestamp(): string {
    return new Date().toLocaleString();
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
