import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { GenerateLinkComponent } from './components/linkGeneration/generate-link/generate-link.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'register', component: RegisterComponent },
    { path: 'generatelink', component: GenerateLinkComponent }, 
    { path: '**', component: DashboardComponent, canActivate: [AuthGuard] }
];
