import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../sharedServices/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn.value == false) {
        console.log('Not authorized');
        router.navigate(['/login']);
        return false;
    }

    return authService.isLoggedIn.value;
};
