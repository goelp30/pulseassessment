import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AssessmentListComponent } from './components/assessment/assessment-list/assessment-list.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { AssessmentRecordsComponent } from './components/linkGeneration/Pages/assessment-records/assessment-records.component';
import { LinkExpiredComponent } from './components/linkGeneration/Pages/link-expired/link-expired.component';
import { AlreadyAttendedComponent } from './components/linkGeneration/Pages/already-attended/already-attended.component';
import { LinkGenerationComponent } from './components/linkGeneration/link-generation/link-generation.component';

import { DragDropComponent } from './components/assessment/drag-drop/drag-drop.component';
<<<<<<< HEAD
import { QuizHomeComponent } from './components/Quiz/quiz-home/quiz-home.component';
import { TestTableComponent } from './components/Quiz/test-table/test-table.component';
import { TermsConditionsComponent } from './components/Quiz/terms-conditions/terms-conditions.component';
=======
import { TermsConditionsComponent } from './components/Quiz/terms-conditions/terms-conditions.component';
import { QuizComponent } from './components/Quiz/quiz-components/quiz/quiz.component';
>>>>>>> c1ae72f5ca00993e78a4b8a7bed6b45131ffe056

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'register', component: RegisterComponent },
  // Link Generation Routes
  {path: 'generatelink',component: LinkGenerationComponent,},
  { path: 'assessmentrecords', component: AssessmentRecordsComponent },
  { path: 'linkexpired', component: LinkExpiredComponent },
  { path: 'alreadyattended', component: AlreadyAttendedComponent },
  {
  path: 'termsandconditions/:assessmentId/:userId',
  component: TermsConditionsComponent
},
  // Quiz Module Routes 
  {path:'termsandconditions',component:TermsConditionsComponent},
  {
    path: 'assessment-list',
    component: AssessmentListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'drag-and-drop',
    component: DragDropComponent,
  },
  {
    path: 'app-quiz',
    component: QuizComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
