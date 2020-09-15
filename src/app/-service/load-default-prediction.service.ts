import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { map, catchError, finalize } from 'rxjs/operators';
import { throwError, Observable, Subject } from 'rxjs';
import { LoanDetailModel } from '../-model/loan-detail-model';
import { LoanDefaultPredicationModel } from '../-model/loan-default-predication-model';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Injectable(
    {
      providedIn: 'root'
    }
  )
  export class LoanDefaultPredictionService {
  
    constructor(private _http: HttpClient, private _router: Router,public sanitizer: DomSanitizer) {
  
    }
    private getAPI(actionName: string): string {
      return environment.serviceEndpoint + actionName;
      //return environment.serviceEndpoint +"LoanDefaultPredition/" + actionName;
    }
    
    UploaDatasetAsExcel(file : File) {
        let header = new HttpHeaders();
        header= header.append('content-type', 'application/octet-stream; charset=ISO-8859-1');
        return this._http.post<LoanDetailModel[]>(this.getAPI('UploaDatasetAsExcel?fileName=' + file.name), file,{headers : header})
          .pipe(
          map(data => data),
          catchError(this.handlError),
          finalize(() => {        
            file = null;
          })
          );
      }
      UploaDatasetAsExcelNew(file : File) {
        var timeStamp = new Date(Date.now());
        var uploadTimeStamp = new DatePipe('en-US').transform(timeStamp, 'medium');    
        let header = new HttpHeaders();        
        header= header.append('content-type', 'application/octet-stream; charset=ISO-8859-1');
        return this._http.post<LoanDefaultPredicationModel>(this.getAPI('classify?filename=' +file.name+"&datetime="+uploadTimeStamp), file,{headers : header})
          .pipe(
          map(data => data),
          catchError(this.handlError),
          finalize(() => {        
            file = null;
          })
          );
      }

    DownloadFile(filePath: string): Observable<any> {
      //let fileExtension = fileType;
      let input = filePath;
      let header = new HttpHeaders();
      header= header.append('content-type', '*');
      return this._http.get(this.getAPI('DownloadFile?file='+ filePath),{headers: header, responseType: 'arraybuffer'})
      
  }

  getTemplateFile(){
   return this._http.get('assets/Template/Template.xlsx', { responseType: 'blob' })
        
  }

  getGridColumnDefinitionFile(){
    return this._http.get('assets/Template/GridColumnDefinition.xlsx', { responseType: 'blob' })
         
   }

   updateRecord(loanData : LoanDetailModel) {
    let header = new HttpHeaders();
    header= header.append('content-type', 'application/octet-stream; charset=ISO-8859-1');
    return this._http.put<any>(this.getAPI('update'), loanData)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {        
         
      })
      );
  }

  getReport(reqest : any) {
    return this._http.post<any>(this.getAPI('report'), reqest)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  }
  getDataByCkey(request : any) {
    return this._http.post<any>(this.getAPI('view'),request)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  }

  getMyCkeyList(request : any) {
    return this._http.get<any>(this.getAPI('ckeys'))
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  }

  deleteData(reqest : any) {
    return this._http.post<any>(this.getAPI('delete'), reqest)
      .pipe(
      map(data => data),
      catchError(this.handlError),
      finalize(() => {       
         
      })
      );
  }

  private _subject = new Subject<any>();

  recordModifiedEvent(event) {
    this._subject.next(event);
  }

  get events$ () {
    return this._subject.asObservable();
  }

  private handlError(httpErrorResponse: HttpErrorResponse) {
    // if(httpErrorResponse.status==401){      
    //   localStorage.removeItem("Authorization")   
    //   this._router.navigate(['/signin']);
    //   return;
    // }
    return throwError(httpErrorResponse);
  }
}