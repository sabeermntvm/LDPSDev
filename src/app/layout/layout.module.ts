import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe, LowerCasePipe, CurrencyPipe, PercentPipe, DecimalPipe } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { LayoutRoutingModule } from './layout-routing.module';
import { HomeComponent } from '../home/home.component';
import { NgApexchartsModule } from 'ng-apexcharts';

import {MatCardModule} from '@angular/material/card';
import { LayoutComponent } from './layout.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MenuListItemComponent } from '../shared/menu-list-item/menu-list-item.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { DynamicPipe } from '../pipes/dynamic.pipe';
import { MatDialogModule } from '@angular/material/dialog';
import { DefaultPredictionComponent } from '../default-prediction/default-prediction.component';
@NgModule({
  declarations: [ 
    HomeComponent, 
    DefaultPredictionComponent,
    LayoutComponent,
    MenuListItemComponent, 
    HeaderComponent, 
    FooterComponent,
    DynamicPipe
  ],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    NgApexchartsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatDialogModule
  ],
  providers:[
    DatePipe,
    UpperCasePipe,
    LowerCasePipe,
    CurrencyPipe,
    PercentPipe,
    DecimalPipe
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class LayoutModule { }
