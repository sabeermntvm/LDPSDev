import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
// import { HeaderComponent } from './shared/header/header.component';
// import { FooterComponent } from './shared/footer/footer.component';
import { ReportsComponent } from './reports/reports.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatTabsModule} from '@angular/material/tabs';
import { NavService } from './shared/services/nav-service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RequestInterceptor } from './http.interceptor';
import { LocationStrategy, HashLocationStrategy, DatePipe, UpperCasePipe, LowerCasePipe, CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import { LoanEditComponent } from './loan-edit/loan-edit.component';
import { MatNativeDateModule } from '@angular/material/core';
import { BlockUIModule } from 'ng-block-ui';
import { BlockUIHttpModule } from 'ng-block-ui/http';
import { DefaultPredictionComponent } from './default-prediction/default-prediction.component';
import { DynamicPipe } from './pipes/dynamic.pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { appInitializer } from './app.initializer';
import { AuthService } from './-service/auth.service';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,    
    ReportsComponent, LoanEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    BlockUIModule.forRoot(),
    //  BlockUIHttpModule.forRoot(),     
    // MatToolbarModule,
    // MatMenuModule,
    // MatPaginatorModule,
    // MatSlideToggleModule,
    MatButtonToggleModule,
    // MatDialogModule
    
  ],

  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true
    },
    // { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AuthService] },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    NavService    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
