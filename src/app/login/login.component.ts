import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, state, style, transition, group, animate } from '@angular/animations';
import { LoginRequest } from '../-model/login-request';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../-service/auth.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

const incr = 1;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    trigger('slideInOut', [
        state('in', style({height: '*', opacity: 0})),
        transition(':leave', [
            style({height: '*', opacity: 1}),

            group([
                animate(300, style({height: 0})),
                animate('200ms ease-in-out', style({'opacity': '0'}))
            ])

        ]),
        transition(':enter', [
            style({height: '0', opacity: 0}),

            group([
                animate(300, style({height: '*'})),
                animate('400ms ease-in-out', style({'opacity': '1'}))
            ])

        ])
    ])
]
})

export class LoginComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  progress = 0;
  showProgressBar= false;
  form: FormGroup;
  public loginInvalid: boolean;
  private formSubmitAttempt: boolean;
  private returnUrl: string;
  hideLogin =true;
  user: LoginRequest;
  loadingText: string;
  loading: boolean;
  errorMsg: any;
  constructor(private fb: FormBuilder, private _route:ActivatedRoute, private _router: Router, private _authService:AuthService) {

  }

  ngOnInit() {
    this.hideLogin =true;
    this.user = new LoginRequest();
    this.loadingText  = "Loading....";

    this.form = this.fb.group({
      // username: ['', Validators.email],
      // password: ['', Validators.required]
      // username: [null],
      // password: [null]
    });
   
  }

  onClearDataAndLogin(){
    this.blockUI.start();
    var request = {
      // ckey: this.selectedLoan.ckey,
      // ikey: this.selectedLoan.ikey
    };
    this._authService.deleteData(request).subscribe( data=> {
      this.blockUI.stop();
    },    
    (httpErrorResponse: HttpErrorResponse) => {
      this.blockUI.stop();
      console.log("Error in delete")
      console.log(httpErrorResponse)
    }); 

  }

  onSubmit(loginForm) {
    // this.showProgressBar= true;
    // setInterval(() => this.manageProgress(), 10 )
    this.loading = true;
    this.blockUI.start();  
    let returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || '/';
    localStorage.setItem('returnUrl', returnUrl);
    this._authService.login(this.user)
    .subscribe(
      (data: any) => {   
        this.blockUI.stop();  
        this.loading = false;  
        this._router.navigate(['/home']);
        this.onClearDataAndLogin();
        return;   
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.blockUI.stop();  
        this.loginInvalid = true
        this.loading = false;
        this.errorMsg = httpErrorResponse.error;
      }
    );
  }
  onCredentialChanged(){
    this.loginInvalid = false;
  }
  manageProgress() {    
    if(this.progress === 100) {
      this.showProgressBar= false;
      this.hideLogin = false;    
      this._router.navigate(['/home']);   
     
    }
    else {
      this.progress = this.progress + incr;
    }
  }

}
