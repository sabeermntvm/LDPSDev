import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { map, catchError, finalize } from 'rxjs/operators';
import { throwError, Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable(
    {
      providedIn: 'root'
    }
  )
  export class ResolutionModelService {
    constructor(private _http: HttpClient, private _router: Router,public sanitizer: DomSanitizer) {
  
    }
    private getAPI(actionName: string): string {
      return environment.serviceEndpoint + actionName;
      //return environment.serviceEndpoint +"LoanDefaultPredition/" + actionName;
    }   
    

  getResolution(reqest : any) {
    return this._http.post<any>(this.getAPI('resolution'), reqest)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  }  

  restartFromQuestion(reqest : any) {
    return this._http.post<any>(this.getAPI('back'), reqest)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  }  

  clearResolution(reqest : any) {
    return this._http.post<any>(this.getAPI('clearresolution'), reqest)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  } 
   

  private handlError(httpErrorResponse: HttpErrorResponse) {
    return throwError(httpErrorResponse);
  }
}