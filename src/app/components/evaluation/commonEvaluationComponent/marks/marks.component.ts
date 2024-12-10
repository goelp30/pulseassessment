import { Component } from '@angular/core';

@Component({
  selector: 'app-marks',
  standalone: true,
  imports: [],
  templateUrl: './marks.component.html',
  styleUrl: './marks.component.css'
})
export class MarksComponent {
  AssessementName: string = "Angular"
  obtainMark:number = 50;
  TotalMark: number = 49;
  
}
