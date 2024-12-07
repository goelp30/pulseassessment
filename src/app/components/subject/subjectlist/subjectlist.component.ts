import { Component } from '@angular/core';
import { SubjectTableComponent } from '../subjecttable/subjecttable.component';

@Component({
  selector: 'app-subjectlist',
  standalone: true,
  imports: [SubjectTableComponent],
  templateUrl: './subjectlist.component.html',
  styleUrl: './subjectlist.component.css'
})
export class SubjectlistComponent {

}
