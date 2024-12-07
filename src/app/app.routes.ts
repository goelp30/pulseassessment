import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AssessmentListComponent } from './components/assessment/assessment-list/assessment-list.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { DragDropComponent } from './components/assessment/drag-drop/drag-drop.component';
import { QuizHomeComponent } from './components/Quiz/quiz-home/quiz-home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'register', component: RegisterComponent },
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

  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
