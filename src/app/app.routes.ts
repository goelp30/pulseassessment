import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { SubjectlistComponent } from './components/subject/subjectlist/subjectlist.component';
import { QuestionTableComponent } from './components/questiontable/questiontable.component';
import { QuestionlistComponent } from './components/questionlist/questionlist.component';
// import { QuestionlistComponent } from './components/questions/questionlist/questionlist.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'subjects', component: SubjectlistComponent },
    { path: 'questions', component: QuestionTableComponent }, // Removed the trailing comma
    { path: '**', component: DashboardComponent, canActivate: [AuthGuard] },
];

