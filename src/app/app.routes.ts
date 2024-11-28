import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { EvaluationDashboardComponent } from './components/evaluation/evaluation-dashboard/evaluation-dashboard.component';
import { ViewAssessmentComponent } from './components/evaluation/view-assessment/view-assessment.component';
import { EvaluateAssessmentComponent } from './components/evaluation/evaluate-assessment/evaluate-assessment.component';
import { QuestionsComponent } from './components/evaluation/commonEvaluationComponent/questions/questions.component';
import { MarksComponent } from './components/evaluation/commonEvaluationComponent/marks/marks.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard],},
  { path: 'register', component: RegisterComponent },
  {path: 'evaluation', component: EvaluationDashboardComponent,},
  { path: 'evaluation/view/:id', component: ViewAssessmentComponent },
  { path: 'evaluation/assessment/:id', component: EvaluateAssessmentComponent },
  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
