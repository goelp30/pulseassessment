import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { AssessmentRecordsComponent } from './components/linkGeneration/Pages/assessment-records/assessment-records.component';
import { LinkExpiredComponent } from './components/linkGeneration/Pages/link-expired/link-expired.component';
import { QuizDashboardComponent } from './components/QUIZ/quiz-dashboard/quiz-dashboard.component';
import { TermsConditionsComponent } from './components/QUIZ/terms-conditions/terms-conditions.component';
import { AlreadyAttendedComponent } from './components/linkGeneration/Pages/already-attended/already-attended.component';
import { LinkGenerationComponent } from './components/linkGeneration/link-generation/link-generation.component';

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
  { path: 'termsandconditions', component: TermsConditionsComponent }, //Replace with terms and conditions
  { path: 'quiz', component: QuizDashboardComponent },
  
  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
