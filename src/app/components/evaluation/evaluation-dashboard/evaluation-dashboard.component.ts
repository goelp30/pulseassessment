import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrl: './evaluation-dashboard.component.css'
})
export class EvaluationDashboardComponent {

}
