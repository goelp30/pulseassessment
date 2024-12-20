import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageLabelService {
  private currentPageSubject = new BehaviorSubject<string>('Manage Subjects');
  currentPage$ = this.currentPageSubject.asObservable();  // Observable to subscribe to

  // Method to update the current page label
  updatePageLabel(label: string): void {
    this.currentPageSubject.next(label);
  }
}
