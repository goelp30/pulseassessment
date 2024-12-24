import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { AssessmentListComponent } from './components/assessment/assessment-list/assessment-list.component';
import { authGuard } from './auth.guard';
import { AssessmentRecordsComponent } from './components/linkGeneration/Pages/assessment-records/assessment-records.component';
import { LinkExpiredComponent } from './components/linkGeneration/Pages/link-expired/link-expired.component';
import { AlreadyAttendedComponent } from './components/linkGeneration/Pages/already-attended/already-attended.component';
import { LinkGenerationComponent } from './components/linkGeneration/link-generation/link-generation.component';
import { DragDropComponent } from './components/assessment/drag-drop/drag-drop.component';
import { SubjectlistComponent } from './components/subject/subjectlist/subjectlist.component';
import { QuestionlistComponent } from './components/question/questionlist/questionlist.component';
import { TermsConditionsComponent } from './components/Quiz/terms-conditions/terms-conditions.component';
import { QuizComponent } from './components/Quiz/quiz-components/quiz/quiz.component';
import { InvalidComponent } from './components/linkGeneration/Pages/invalid/invalid.component';
import { EvaluationDashboardComponent } from './components/evaluation/evaluation-dashboard/evaluation-dashboard.component';
import { EvaluateAssessmentComponent } from './components/evaluation/evaluate-assessment/evaluate-assessment.component';
import { ViewAssessmentComponent } from './components/evaluation/view-assessment/view-assessment.component';
import { LinkStatusGuard } from './components/Quiz/auth/link-status.guard';
import { ThankYouComponent } from './components/Quiz/quiz-components/thank-you/thank-you.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // Link Generation Routes
  {
    path: 'generatelink',
    component: LinkGenerationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'assessmentrecords',
    component: AssessmentRecordsComponent,
    canActivate: [authGuard],
  },
  { path: 'linkexpired', component: LinkExpiredComponent },
  { path: 'alreadyattended', component: AlreadyAttendedComponent },
  { path: 'invalid', component: InvalidComponent },
  {
    path: 'termsandconditions/:assessmentId/:userId/:timestamp',
    component: TermsConditionsComponent,
    canActivate: [LinkStatusGuard],
  },
  {
    path: 'assessment-list',
    component: AssessmentListComponent,
    canActivate: [authGuard],
  },
  {
    path: 'manage-assessment',
    component: DragDropComponent,
    canActivate: [authGuard],
  },
  {
    path: 'subjects',
    component: SubjectlistComponent,
    canActivate: [authGuard],
  },
  {
    path: 'questions',
    component: QuestionlistComponent,
    canActivate: [authGuard],
  },
  { path: 'app-quiz', component: QuizComponent },
  //evaluate module routes
  {
    path: 'evaluation',
    component: EvaluationDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'evaluate',
    component: EvaluateAssessmentComponent,
    canActivate: [authGuard],
  },
  {
    path: 'view',
    component: ViewAssessmentComponent,
    canActivate: [authGuard],
  },
  { path: 'thank-you', component: ThankYouComponent },
  { path: '**', component: DashboardComponent, canActivate: [authGuard] },
];
