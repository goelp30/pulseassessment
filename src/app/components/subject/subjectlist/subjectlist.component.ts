import { Component } from '@angular/core';
import { SubjectTableComponent } from '../subjecttable/subjecttable.component';
import { HeaderComponent } from '../../common/header/header.component';

@Component({
  selector: 'app-subjectlist',
  standalone: true,
  imports: [SubjectTableComponent,HeaderComponent],
  templateUrl: './subjectlist.component.html',
  styleUrl: './subjectlist.component.css'
})
export class SubjectlistComponent {

}
