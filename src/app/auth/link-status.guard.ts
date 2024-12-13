import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FireBaseService } from '../../sharedServices/FireBaseService';
import { assessmentRecords } from '../models/assessmentRecords';

@Injectable({
  providedIn: 'root',
})
export class LinkStatusGuard implements CanActivate {
  constructor(
    private firebaseService: FireBaseService<assessmentRecords>,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
  ): Observable<boolean> {
    const userId = route.params['userId'];
    const assessmentId = route.params['assessmentId'];

    return this.firebaseService.getAllData('assessmentRecords').pipe(
      map((data: assessmentRecords[]) => {
        const assessmentRecord = data.find(
          (assessment) =>
            assessment.userId === userId &&
            assessment.assessmentId === assessmentId
        );

        if (!assessmentRecord) {
          this.router.navigate(['/invalid']);
          return false;
        }

        const { expiryDate, isAccessed, isValid } = assessmentRecord;

        if (this.isLinkExpired(expiryDate)) {
          this.router.navigate(['/linkexpired']);
          return false;
        } else if (isValid && isAccessed) {
          this.router.navigate(['/alreadyattended']);
          return false;
        } else if (!isValid) {
          this.router.navigate(['/invalid']);
          return false;
        }

        return true;
      }),
      catchError((error) => {
        console.error('Error in guard:', error);
        this.router.navigate(['/invalid']);
        return of(false);
      })
    );
  }

  private isLinkExpired(expiryDate: string | Date): boolean {
    const expiryDateObj = new Date(expiryDate);
    return expiryDateObj < new Date();
  }
}
