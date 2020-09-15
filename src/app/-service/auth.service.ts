 
import { Injectable } from '@angular/core';
import { catchError, finalize, map, delay } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError, BehaviorSubject, Observable, Subscription } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { LoginRequest } from '../-model/login-request';
import { LoggedInUser } from '../-model/logged-in-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
// private tokenSubject: BehaviorSubject<string>;
// public token: Observable<string>;
refreshSubscription:Subscription;
jwtHelperService;
authenticated = false;
constructor(private _http: HttpClient, private router: Router,public sanitizer: DomSanitizer) {
  this.jwtHelperService = new JwtHelperService()
  // this.tokenSubject = new BehaviorSubject<string>(null);
  // this.token = this.tokenSubject.asObservable();
}

private loginAPI(actionName: string): string {
  //return environment.serviceEndpoint + actionName;
  return environment.serviceEndpoint + actionName;
}

login(loginRequest :LoginRequest) {
  return this._http.post<any>(this.loginAPI('login'), loginRequest)
    .pipe(
      map((token:any) => {
        //let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6InN1c2FuLmphbWVzIiwiZ2l2ZW5fbmFtZSI6IlNVU0FOIEpBTUVTIiwiZW1haWwiOiJzdXNhbi5qYW1lc0Bzb21lZG9tYWluLmNvbSIsIkVtcGxveWVlSWQiOiIxMCIsIkxvZ2luU2Vzc2lvbktleSI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsIm5iZiI6MTU5Nzc0NjA0NSwiZXhwIjoxNTk3NzY3NjQ1LCJpYXQiOjE1OTc3NDYwNDV9.CLVweX8ESc51XH7wRf9dFYpKr4UVsKxjVCbOxH5p6G8"
        
          // login successful if there's a jwt token in the response
          if (token) {
              // store username and jwt token in local storage to keep user logged in between page refreshes
             
              localStorage.setItem('Authorization', token.access_token);
              localStorage.setItem('RefreshToken', token.refresh_token);
              this.authenticated = true;
              //this.tokenSubject.next(token);
              this.startRefreshTokenTimer()
              
          }
      }),
      catchError(this.handlError),
      finalize(() => {
        //console.log("Inside finalize");          
      })
    );
}

logout(logoutRequest :any) {     
    return this._http.post<any>(this.loginAPI('logout'), logoutRequest)
    .pipe(
      map((data:any) => {
          // login successful if there's a jwt token in the response
          if (data) {
            this.authenticated = false;
            this.stopRefreshTokenTimer()
          }
      }),
      catchError(this.handlError),
      finalize(() => {
        this.authenticated = false;
        localStorage.removeItem("Authorization")              
      })
    );       
    }    

refreshToken() { 
  // let header = new HttpHeaders();
  // header= header.append('Authorization', `Bearer ${localStorage.getItem('RefreshToken')}`);
  return this._http.get<any>(this.loginAPI('refresh'))
  .pipe(
    map((token:any) => {
        if (token) {  
          localStorage.setItem('Authorization', token.access_token);           
          //this.tokenSubject.next(token);
          this.startRefreshTokenTimer(); 
                  
        }
    }),
    catchError(this.handlError),
    finalize(() => {
    })
  );       
}

get isLoggedIn(){    
    return new JwtHelperService().isTokenExpired(localStorage.getItem('Authorization'))
}
get loggedInUser():LoggedInUser{

    let loggedInUser= new LoggedInUser();
    let token = new JwtHelperService().decodeToken(localStorage.getItem('Authorization'))

    if(token){      
        if(token.identity){
          loggedInUser.UserName =token.identity;  
          loggedInUser.EmployeeName =token.identity;  
        }      
    }
    return loggedInUser;
    }

    deleteData(reqest : any) {
      return this._http.post<any>(this.loginAPI('delete'), reqest)
        .pipe(
        map(data => data),
        catchError(this.handlError),
        finalize(() => {       
           
        })
        );
    }
    

 

  private refreshTokenTimeout;

  private startRefreshTokenTimer() {
      // parse json object from base64 encoded jwt token
      const jwtToken = new JwtHelperService().decodeToken(localStorage.getItem('Authorization'))
      // set a timeout to refresh the token a minute before it expires
      const expires = new Date(jwtToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (120 * 1000);
      this.refreshTokenTimeout = setTimeout(() => {
        if (this.refreshSubscription) {
          this.refreshSubscription.unsubscribe();
        }
        this.refreshSubscription = this.refreshToken().subscribe();
      },timeout);
  }

  private stopRefreshTokenTimer() {
      clearTimeout(this.refreshTokenTimeout);
  } 

  private handlError(httpErrorResponse: HttpErrorResponse) {
  return throwError(httpErrorResponse);
  } 
 
}
