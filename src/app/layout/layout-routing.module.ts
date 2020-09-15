import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { LayoutComponent } from './layout.component';
import { ReportsComponent } from '../reports/reports.component';
import { AuthGaurd } from '../-service/auth-guard';
import { DefaultPredictionComponent } from '../default-prediction/default-prediction.component';


const routes: Routes = [ { path:'',component:LayoutComponent,children: [
  { path: 'home', component: HomeComponent, canActivate: [AuthGaurd] },
   { path: 'prediction', component: DefaultPredictionComponent, canActivate: [AuthGaurd] }
  // { path: 'reports', component: ReportsComponent }
] }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
