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
import { TermsConditionsComponent } from './components/Quiz/terms-conditions/terms-conditions.component';
import { QuizComponent } from './components/Quiz/quiz-components/quiz/quiz.component';
import { EvaluationDashboardComponent } from './components/evaluation/evaluation-dashboard/evaluation-dashboard.component';
import { EvaluateAssessmentComponent } from './components/evaluation/evaluate-assessment/evaluate-assessment.component';
import { ViewAssessmentComponent } from './components/evaluation/view-assessment/view-assessment.component';

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
  //evaluate module routes
  {path: 'evaluation',component:EvaluationDashboardComponent,},
  {path: 'evaluate',component:EvaluateAssessmentComponent,},
  {path: 'view',component:ViewAssessmentComponent,},
 { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
