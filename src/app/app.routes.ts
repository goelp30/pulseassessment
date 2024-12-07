import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { GenerateLinkComponent } from './components/linkGeneration/generate-link/generate-link.component';
import { AssessmentRecordsComponent } from './components/linkGeneration/assessment-records/assessment-records.component';
import { LinkExpiredComponent } from './components/linkGeneration/link-expired/link-expired.component';

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
    path: 'generatelink',
    component: GenerateLinkComponent,
  },
  { path: 'assessmentrecords', component: AssessmentRecordsComponent },
  { path: 'link-expired', component: LinkExpiredComponent },
  { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];
