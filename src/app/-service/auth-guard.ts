import { Router } from '@angular/router';
import { CanActivate, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { LoggedInUser } from '../-model/logged-in-user';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class AuthGaurd implements CanActivate {
  loggedInUser:LoggedInUser;
  constructor(private authService: AuthService, private router: Router) {   
    this.loggedInUser= this.authService.loggedInUser;
  }
  canActivate(route, state: RouterStateSnapshot) {     
    if (!this.authService.isLoggedIn){   
      this.authService.refreshToken().subscribe();
      return true;      
    }
    // if (this.authService.loggedInUser && this.authService.loggedInUser.UserName) {      
    //     return true;      
    // }
    else {
      localStorage.removeItem("Authorization")
      this.router.navigate(['/signin'], { queryParams: { returnUrl: state.url } });
    }
  }
}
