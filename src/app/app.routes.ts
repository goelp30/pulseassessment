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
import { QuizHomeComponent } from './components/Quiz/quiz-home/quiz-home.component';
import { TestTableComponent } from './components/Quiz/test-table/test-table.component';

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
    path: 'quiz-home',
    component: QuizHomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'quiz-table',
    component: TestTableComponent,
    canActivate: [AuthGuard],
  },

  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
