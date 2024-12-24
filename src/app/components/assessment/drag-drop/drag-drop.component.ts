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
import { PopupModuleComponent } from '../../common/popup-module/popup-module.component';
import { ButtonComponent } from '../../common/button/button.component';
@Component({
  selector: 'app-drag-drop',
  standalone: true,
  templateUrl: './drag-drop.component.html',
  styleUrls: ['./drag-drop.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule,PopupModuleComponent,ButtonComponent],
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
  rightListForm!: FormGroup; 
  viewMode: 'internal' | 'external' = 'internal'; 
  validationWarnings: string[] = []; 
  assessmentTitle: string = ''; 
  subject_table = TableNames.Subject; 
  assess_table = TableNames.Assessment;
  isModalVisible: boolean = false;
  eConfirmationVisible: boolean = false;
  assessmentId: string = ''
  editFlag: boolean = false;
  warningTitle: string = '';
  isNewVisible:boolean=false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private firebaseService: FireBaseService<Subject | AssessmentList | Assessment>,
    private toastr: ToastrService,
    private assessmentService: AssessmentService
  ) { }
  handleBeforeUnload(event: BeforeUnloadEvent): string {
    const message = "You have unsaved changes! Are you sure you want to leave?";
    event.returnValue = message;  
    return message;               
  }
  // checking for atleast 2 ques
  checkTotalQuestions(): void {
    this.rightListInputs.controls.forEach((group, i) => {
      const easyValue = group.get('easy')?.value || 0;
      const mediumValue = group.get('medium')?.value || 0;
      const hardValue = group.get('hard')?.value || 0;
      const descriptiveValue = group.get('descriptive')?.value || 0;
      const totalSelectedForSubject = easyValue + mediumValue + hardValue + descriptiveValue;
      if (totalSelectedForSubject < 2) {
        this.totalWarning = `Please select at least 2 questions for each subject.`;
      } else {
        this.totalWarning = '';  
      }
    });
    this.updateSaveButtonStatus();
  }
  
  ngOnInit(): void {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    this.assessmentService.assessmentId$.subscribe((assessmentId) => {
      if (assessmentId) {
        this.assessmentId = assessmentId;
        this.editFlag = true;
        this.getEditData(this.assessmentId, this.editFlag);
      } else {
        this.editFlag = false;
        this.fetchLeftList(); // Fetch all subjects if not editing
      }
    });
  
    this.initializeRightListForm();
    if (this.isBrowser()) {
      this.fetchLeftList();
    }
    this.subscribeToFormChanges();
    this.setupNavigationListener();
    if(this.rightList){
      this.rightListInputs.controls.forEach((group, i) => {
        this.checkTotalQuestions(); // Check total selected questions on initialization
      });
    }
  }
  ngDoCheck():void{
    this.checkTotalQuestions();
  }
  setupNavigationListener(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
      }
    });
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
        isAutoEvaluated = false; 
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
        isautoEvaluated: this.isAutoEvaluated,
        isLinkGenerated:false
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
  checkAssessmentTitleUniqueness(title: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.firebaseService.getAllDataByFilter(this.assess_table, 'isDisabled', false).subscribe((assessments: any[]) => {
        const existingTitles = assessments.map((assessment) => assessment.assessmentName.toLowerCase());
        if (existingTitles.includes(title.toLowerCase())) {
          resolve(false);
        } else {
          resolve(true); 
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
    this.fetchLeftList(); 
  }
  fetchLeftList(): void {
    this.firebaseService.getAllDataByFilter(this.subject_table, 'isDisabled', false).subscribe((subjects: any[]) => {
      const subjectsWithQuestionCounts = subjects.map(subject => ({
        ...subject,
        questionCount: 0
      }));

      // Count questions for each subject
      const countPromises = subjectsWithQuestionCounts.map(subject =>
        this.getQuestionCountsForSubject(subject.subjectId).then(counts => {
          subject.questionCount = counts.easyCount + counts.mediumCount + counts.hardCount + counts.descriptiveCount;
        })
      );

      Promise.all(countPromises).then(() => {
        // Filter subjects with more than 1 question
        const filteredSubjects = subjectsWithQuestionCounts.filter(subject => subject.questionCount > 1);

        this.leftList = filteredSubjects
          .map(item => ({ subjectId: item.subjectId, subjectName: item.subjectName }))
          .sort((a, b) => a.subjectName.localeCompare(b.subjectName));

        // Filter out subjects that are already in the right list
        this.leftList = this.leftList.filter(subject => 
          !this.rightList.some(rightSubject => rightSubject.subjectId === subject.subjectId)
        );

        this.subjectList = filteredSubjects.map(item => ({ subjectId: item.subjectId, subjectName: item.subjectName }));
      });
    });
  }
  getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
  mapRightListInputs(list: any[]): any {
    const subjects: any = {};
    this.rightListInputs.controls.forEach((control: any) => {
      const subject = list.find((item: any) => item.subjectId === control.value.item.subjectId);
      if (subject) {
        subjects[subject.subjectId] = {
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          easy: control.get('easy')?.value || 0,
          medium: control.get('medium')?.value || 0,
          hard: control.get('hard')?.value || 0,
          descriptive: control.get('descriptive')?.value || 0
        };
      }
    });
    return subjects;
  }
  onAssessmentTitleChange(): void {
    this.validateAssessmentTitle();
  }
  questionCounts: { [subjectId: string]: { easyCount: number, mediumCount: number, hardCount: number, descriptiveCount: number } } = {};
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
  enabledQuestions: any[] = []; 
    calculateQuestionCounts(subjectId: string): void {
    this.firebaseService.listensToChangeWithFilter('questions', 'subjectId', subjectId).subscribe((questions: any[]) => {
      let easyCount = 0;
      let mediumCount = 0;
      let hardCount = 0;
      let descriptiveCount = 0;
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
      this.questionCounts[subjectId] = {
        easyCount,
        mediumCount,
        hardCount,
        descriptiveCount
      };
    });
  }
  disable = false;
  totalWarning: string = ''; // Initialize the totalWarning variable
  onInputChange(event: Event, index: number, controlName: string, subjectId: string): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    if (input.disabled) {
      value = 0;
    }
    // Validate input values (don't allow values outside of the specified range)
    this.getQuestionCountsForSubject(subjectId).then((availableCounts) => {
      let warningMessage = '';
      const countKey = `${controlName}Count` as keyof typeof availableCounts;
  
      if (availableCounts) {
        if (value > availableCounts[countKey]) {
          warningMessage = `The number of ${controlName.charAt(0).toUpperCase() + controlName.slice(1)} questions cannot exceed ${availableCounts[countKey]} for this subject.`;
        }
        if (value > 5) {
          warningMessage = `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} value cannot exceed 5!`;
          input.value = '5';
          value = 5;
        } else if (value < 0) {
          warningMessage = `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} value cannot be less than 0!`;
          input.value = '0';
          value = 0;
        }
  
        // Store the warning message for each input
        if (controlName === 'easy') {
          this.newValidationWarnings.easy[index] = warningMessage;
        } else if (controlName === 'medium') {
          this.newValidationWarnings.medium[index] = warningMessage;
        } else if (controlName === 'hard') {
          this.newValidationWarnings.hard[index] = warningMessage;
        } else if (controlName === 'descriptive') {
          this.newValidationWarnings.descriptive[index] = warningMessage;
        }
  
        // Update the form control value for the current input
        this.rightListInputs.at(index).get(controlName)?.setValue(value);
        // Now calculate the sum of selected values for all subjects in real-time
        let totalSelected = 0;
  
        // Iterate through each subject and sum up the values
        this.rightListInputs.controls.forEach((group, i) => {
          const easyValue = group.get('easy')?.value || 0;
          const mediumValue = group.get('medium')?.value || 0;
          const hardValue = group.get('hard')?.value || 0;
          const descriptiveValue = group.get('descriptive')?.value || 0;
          totalSelected += easyValue + mediumValue + hardValue + descriptiveValue;
        });
  
        // Real-time total check and warning message
        if (totalSelected < 2) {
          this.totalWarning = 'Please select at least 2 questions from each subject.';
        } else {
          this.totalWarning = '';  // Clear the warning if total is 2 or more
        }
  
        // Update Save button status
        this.updateSaveButtonStatus();
      }
    });
  }
  
  
  updateSaveButtonStatus(): void {
    const hasWarnings = this.rightList.some((subject, index) => {
      return this.newValidationWarnings.easy[index] ||
             this.newValidationWarnings.medium[index] ||
             this.newValidationWarnings.hard[index] ||
             this.newValidationWarnings.descriptive[index];
    });
  this.disable = hasWarnings;
  }
      async getQuestionCountsForSubject(subjectId: string): Promise<any> {
    let counts = {
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      descriptiveCount: 0
    };
    await this.fetchQuestionCountByType(subjectId, 'Easy').then(count => counts.easyCount = count);
    await this.fetchQuestionCountByType(subjectId, 'Medium').then(count => counts.mediumCount = count);
    await this.fetchQuestionCountByType(subjectId, 'Hard').then(count => counts.hardCount = count);
    await this.fetchQuestionCountByType(subjectId, 'Descriptive').then(count => counts.descriptiveCount = count);
    return counts;
  }
  fetchQuestionCountByType(subjectId: string, questionLevel: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.firebaseService.listensToChangeWithFilter('questions', 'subjectId', subjectId).subscribe((questions: any[]) => {
        const count = questions.filter(q => q.questionLevel === questionLevel || q.questionType === questionLevel).length;
        resolve(count);
      }, error => {
        console.error('Error fetching question data:', error);
        reject(error);
      });
    });
  }
  async fetchQuestionCountsForRightList(): Promise<void> {
    await Promise.all(
      this.rightList.map((subject) => this.calculateQuestionCounts(subject.subjectId))
    );
  }
  addWarning(index: number, message: string): void {
    this.validationWarnings[index] = message;
  }
  removeWarning(index: number): void {
    this.validationWarnings[index] = '';
  }
  validateAssessmentTitle(): void {
    if (this.assessmentTitle.trim().length === 0) {
      this.assessmentTitleWarning = "Assessment Title cannot be empty or just spaces.";
    } else if (this.assessmentTitle.length < 2) {
      this.assessmentTitleWarning = "Assessment Title must be at least 2 characters long.";
    } else {
      this.assessmentTitleWarning = '';
    }
  }
  rightListWarning='';
  checkRightList(): boolean {
    const isRightListNotEmpty = this.rightList && this.rightList.length > 0;
    if (!isRightListNotEmpty) {
        this.rightListWarning = "Right list is empty";
    } else {
        this.rightListWarning = "";
    }

    return isRightListNotEmpty;
}
canSave(): boolean {
  const isFormValid = this.rightListForm.valid;
  const isAssessmentTitleValid = this.assessmentTitle.trim().length > 0;
  const isTitleUnique = !this.assessmentTitleWarning;
  const isAllSubjectsValid = !this.disable;
  const isRightListNotEmpty = this.checkRightList();

  // Check if there's a warning about selecting at least 2 questions
  const hasTotalSelectedWarning = this.totalWarning !== ''; // Check if totalWarning is not empty

  // Disable save if there are validation warnings (including the totalSelected warning)
  return isFormValid && isAssessmentTitleValid && isTitleUnique && isAllSubjectsValid && isRightListNotEmpty && !hasTotalSelectedWarning;
}
  onSave(): void {
    if (!this.canSave()) {
      this.showValidationErrorToast();
    } else {
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
      this.firebaseService.listensToChangeWithFilter(this.assess_table, 'assessmentId', this.assessmentId).subscribe((assessments: any[]) => {
        if (assessments && assessments.length > 0) {
          const assessment = assessments[0];
          this.assessmentTitle = assessment.assessmentName;
          this.viewMode = assessment.assessmentType;
          this.firebaseService.listensToChangeWithFilter(TableNames.AssessmentList, 'assessmentId', this.assessmentId).subscribe((assessmentLists: any[]) => {
            if (assessmentLists && assessmentLists.length > 0) {
              const assessmentList = assessmentLists[0]; 
              const subjectsWithRatings = assessmentList.subjects; 
              
              this.rightList = Object.values(subjectsWithRatings).map((subject: any) => ({
                subjectId: subject.subjectId,
                subjectName: subject.subjectName
              }));

              const rightListInputs = this.fb.array(
                Object.values(subjectsWithRatings).map((subject: any) =>
                  this.fb.group({
                    item: [subject],
                    easy: [subject.easy, [Validators.min(0), Validators.max(5)]],
                    medium: [subject.medium, [Validators.min(0), Validators.max(5)]],
                    hard: [subject.hard, [Validators.min(0), Validators.max(5)]],
                    descriptive: [subject.descriptive, [Validators.min(0), Validators.max(5)]],
                  })
                )
              );
              this.rightListForm.setControl('rightListInputs', rightListInputs);

              // After setting the right list, fetch the left list to exclude selected subjects
              this.fetchLeftList();
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
            subjectId: subject ? subject.subjectId : '', 
            subjectName: item
          };
        });
        this.rightList = rightListDom.map((item) => {
          const subject = this.subjectList.find((sub) => sub.subjectName === item);
          return {
            subjectId: subject ? subject.subjectId : '', 
            subjectName: item
          };
        });
        this.updateRightListForm(this.rightList);
        
        // Update left list to exclude items in the right list
        this.leftList = this.subjectList.filter(subject => 
          !this.rightList.some(rightSubject => rightSubject.subjectId === subject.subjectId)
        );
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
    this.updateValidations();
  }
  ngOnDestroy(): void {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }
  subscribeToFormChanges(): void {
    this.rightListForm.valueChanges.subscribe(() => {
    });
    
  }
  updateRightListForm(newRightList: any[]): void {
    const updatedInputs = this.fb.array(
      newRightList.map((subject) => {
        const existingSubjectInput = this.rightListInputs.controls.find((control) => {
          const subjectControl = control.value;
          return subjectControl.item.subjectId === subject.subjectId;
        });

        const easy = existingSubjectInput ? existingSubjectInput.get('easy')?.value : 0;
        const medium = existingSubjectInput ? existingSubjectInput.get('medium')?.value : 0;
        const hard = existingSubjectInput ? existingSubjectInput.get('hard')?.value : 0;
        const descriptive = existingSubjectInput ? existingSubjectInput.get('descriptive')?.value : 0;

        const group = this.fb.group({
          item: [subject],
          easy: [{ value: easy, disabled: false }, [Validators.min(0), Validators.max(5)]],
          medium: [{ value: medium, disabled: false }, [Validators.min(0), Validators.max(5)]],
          hard: [{ value: hard, disabled: false }, [Validators.min(0), Validators.max(5)]],
          descriptive: [{ value: descriptive, disabled: false }, [Validators.min(0), Validators.max(5)]],
        });

        this.getQuestionCountsForSubject(subject.subjectId).then((counts) => {
          (['easy', 'medium', 'hard', 'descriptive'] as const).forEach((type) => {
            const countKey = `${type}Count` as keyof typeof counts;
            if (counts[countKey] === 0) {
              group.get(type)?.disable();
            }
          });
        });

        return group;
      })
    );

    this.rightListForm.setControl('rightListInputs', updatedInputs);
    this.updateValidations();
  }
  updateValidations(): void {
    this.rightListInputs.controls.forEach((group, index) => {
      ['easy', 'medium', 'hard', 'descriptive'].forEach(type => {
        this.onInputChange({ target: { value: group.get(type)?.value } } as any, index, type, group.value.item.subjectId);
      });
    });
  }
  onCreateNew(){
    this.isNewVisible=false;
  }
  saveFormData(): void {
    this.fetchQuestionCountsForRightList();
    const hasDescriptiveGreaterThanZero = this.rightListInputs.controls.some((group) => {
      return (group.get('descriptive')?.value || 0) > 0;
    });
    this.isAutoEvaluated = !hasDescriptiveGreaterThanZero;
  
    if (this.assessmentTitle.trim().length === 0) {
      this.assessmentTitleWarning = "Assessment Title cannot be empty or just spaces.";
      return;
    }
    if (this.editFlag) {
      this.updateAssessment();
    } else {
      this.checkAssessmentTitleUniqueness(this.assessmentTitle).then((isUnique) => {
        if (!isUnique) {
          this.assessmentTitleWarning = 'This assessment title already exists. Please choose a unique title.';
          return;
        }
        this.addAssessment().then((assessmentId: string) => {
          if (this.rightListForm.valid) {
            const subjects = this.mapRightListInputs(this.rightList);
  
            const newAssessmentList: AssessmentList = {
              assessmentId,
              dateCreated: Date.now(),
              dateUpdated: Date.now(),
              isDisable: false,
              subjects: subjects,
            };
  
            this.firebaseService.create('assessmentList/' + assessmentId, newAssessmentList)
              .then(() => {
                this.toastr.success('Assessment Created', 'Created');
                this.resetRightListAndForm();
                this.assessmentTitle = '';
                this.navigateToAssessments();
                // this.isNewVisible = true;
                this.updateSubjectsCanDeleted(Object.keys(subjects))
                  .then(() => {
                    // Do not show any additional toasts here
                  })
                  .catch((error) => {
                    console.error('Error updating subjects:', error);
                    this.toastr.error('Failed to update subjects. Please try again.');
                  });
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
    if (this.assessmentId) {
      const subjects = this.mapRightListInputs(this.rightList);
      const originalAssessment = this.assessmentList.find((assessment) => assessment.assessmentId === this.assessmentId);
      const originalDateCreated = originalAssessment ? originalAssessment.dateCreated : Date.now(); 
      const updatedAssessmentList: AssessmentList = {
        assessmentId: this.assessmentId,
        dateCreated: originalDateCreated,  
        dateUpdated: Date.now(),   
        isDisable:false,      
        subjects: subjects,            
      };
      const updatedAssessment: Assessment = {
        assessmentId: this.assessmentId,
        assessmentName: this.assessmentTitle,
        assessmentType: this.viewMode,
        dateCreated: originalDateCreated,   
        dateUpdated: Date.now(),              
        isDisabled: false,                    
        isautoEvaluated: this.isAutoEvaluated,
        isLinkGenerated:false
      };

      this.firebaseService.update('assessment/' + this.assessmentId, updatedAssessment)
        .then(() => {
          this.firebaseService.update('assessmentList/' + this.assessmentId, updatedAssessmentList)
            .then(() => {
              this.assessmentList = this.assessmentList.map((assessment) => {
                if (assessment.assessmentId === this.assessmentId) {
                  return updatedAssessmentList; 
                }
                return assessment;
              });
              this.toastr.success('Assessment and Assessment List Updated successfully', 'Updated');
              this.resetRightListAndForm();  
              this.assessmentTitle = '';     
              this.navigateToAssessments(); 
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
  // saveAssessmentAndSubjects(): void {
  //   this.addAssessment().then((assessmentId: string) => {
  //     if (this.rightListForm.valid) {
  //       const subjects = this.mapRightListInputs(this.rightList);
  //       const assessmentList: AssessmentList = {
  //         assessmentId,
  //         dateCreated: Date.now(),
  //         dateUpdated: Date.now(),
  //         isDisable:false,
  //         subjects: subjects,
  //       };

  //       this.firebaseService.create('assessmentList/' + assessmentId, assessmentList)
  //         .then(() => {
  //           this.assessmentList.unshift(assessmentList);
  //           this.fetchLeftList();
  //           this.toastr.success('Assessment Created successfully', 'Created');
  //           this.resetRightListAndForm();
  //           this.assessmentTitle = '';  
  //         })
  //         .catch((error) => {
  //           console.error('Error saving data:', error);
  //           this.toastr.error('Failed to save data. Please try again.');
  //         });
  //     } else {
  //       this.toastr.warning('Please fill in the form correctly.');
  //     }
  //   }).catch((error) => {
  //     this.toastr.error('Failed to create assessment. ' + error);
  //   });
  // }
  setRightListFormControls(controls: any[]): void {
    const rightListInputs = this.rightListForm.get('rightListInputs') as FormArray;
    while (rightListInputs.length) {
      rightListInputs.removeAt(0);
    }
    controls.forEach(control => {
      rightListInputs.push(this.fb.control(control));
    });
  }
  closeModal() {
    this.eConfirmationVisible = false;
  }
  resetPage(): void {
    this.rightList = [];
    this.subjectList = [];
    this.updatedList = [];

    this.rightListForm.reset();
    this.setRightListFormControls([]);

    this.assessmentTitle = '';
    this.viewMode = 'internal';
    console.log('Page has been reset!');
    this.eConfirmationVisible = false;
  }
  actionType: 'reset' | 'navigate' = 'reset'; 
  onReset(): void {
    this.actionType = 'reset'; 
    this.eConfirmationVisible = true; 
  }
  onBack(): void {
    this.actionType = 'navigate'; 
    this.eConfirmationVisible = true; 
  }
  updateSubjectsCanDeleted(subjectIds: string[]): Promise<void> {
    const updatePromises = subjectIds.map(subjectId => 
      this.firebaseService.update(`${TableNames.Subject}/${subjectId}`, { canDelete: false })
    );

    return Promise.all(updatePromises).then(() => {
      console.log('All subjects updated successfully');
    });
  }
  toggleMoveAllSubjects(): void {
    if (this.leftList.length > 0) {
      // If there are subjects in the left list, move all to the right
      this.moveAllSubjectsToRight();
    } else if (this.rightList.length > 0) {
      // If there are subjects in the right list, move all to the left
      this.moveAllSubjectsToLeft();
    }
  }

  // Move all subjects from left to right
  moveAllSubjectsToRight(): void {
    this.rightList = [...this.rightList, ...this.leftList];
    this.leftList = [];
    // You can call any methods to update forms or validate if needed
    this.updateRightListForm(this.rightList);
    this.updateValidations();
  }

  // Move all subjects from right to left
  moveAllSubjectsToLeft(): void {
    this.leftList = [...this.leftList, ...this.rightList];
    this.rightList = [];
    // You can call any methods to update forms or validate if needed
    // this.updateLeftListForm(this.leftList);
    this.checkTotalQuestions();
    this.updateValidations();
  }


}