import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/-service/auth.service';
import { LoggedInUser } from 'src/app/-model/logged-in-user';
import { NavService } from '../services/nav-service';
import { LoginRequest } from 'src/app/-model/login-request';
import { HttpErrorResponse } from '@angular/common/http';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  loggedInUser: LoggedInUser;
  constructor(private _router: Router,private auth:AuthService,private navService:NavService) { 

  }

  ngOnInit(): void {
    this.loggedInUser = this.auth.loggedInUser;
  }

  logout() {
    this.blockUI.start();  
    var logoutReq = { uname:this.loggedInUser.UserName }
    this.auth.logout(logoutReq)
    .subscribe(
      (data: any) => {  
        this.blockUI.stop();
        this._router.navigate(['/signin']);
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.blockUI.stop();
        this._router.navigate(['/signin']);
      }
    );    
  }
  closeMenu(){
    this.navService.openNav();
  }
}
