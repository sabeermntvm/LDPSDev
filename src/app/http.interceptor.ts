import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { HttpResponse } from "@angular/common/http";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(private _router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    var auth_token = localStorage.getItem('Authorization');
    if(request.url.endsWith("/refresh")){
      auth_token = localStorage.getItem('RefreshToken');
    }
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${auth_token}`,
        "Api-Key": `${environment.ApiKey}`
      }
    });

    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          //   SharedConstants.showSessionExpiryAlert = false;
          //   SharedConstants.sessionExpiryMessage= "";
        }
      }, (err: any) => {
        if (err instanceof HttpErrorResponse) {
          switch (err.status) {
            case 0: {              
              //this._router.navigate(['/error']);
              break;
            }
            case 400: {
              break;
            }
            case 401: {
              Array.from(document.querySelectorAll(".cdk-overlay-container .cdk-global-overlay-wrapper, .cdk-overlay-backdrop, .block-ui-wrapper, .progress_overlay")) .forEach((node, index, array) => (<HTMLElement> node).style.display = "none");
              // redirect to the login route                                      
              this._router.navigate(['/signin']);
              break;
            }
            case 403: {
              // redirect to the login route
              Array.from(document.querySelectorAll(".cdk-overlay-container .cdk-global-overlay-wrapper, .cdk-overlay-backdrop, .block-ui-wrapper, .progress_overlay")) .forEach((node, index, array) => (<HTMLElement> node).style.display = "none");
              this._router.navigate(['/signin']);
              break;
            }
            case 422: {
              break;
            }
            default:
              //this._router.navigate(['/error']);              
              break;
          }
        }
      })
    )
  }

}
