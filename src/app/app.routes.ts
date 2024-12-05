import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { AddQuestionComponent } from './components/add-question/add-question.component';
import { AssessmentFormComponent } from './components/assessment-form/assessment-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: 'register', component: RegisterComponent },
  { path: 'ques', component: AddQuestionComponent },
  { path: 'quesform', component: AssessmentFormComponent },

  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
