import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { SubjectlistComponent } from './components/subject/subjectlist/subjectlist.component';
// import { QuestionlistComponent } from './components/questions/questionlist/questionlist.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    // { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'register', component: RegisterComponent },
    {path:'subjects', component:SubjectlistComponent},
    { path: '**', component: DashboardComponent, canActivate: [AuthGuard] }
    
];
