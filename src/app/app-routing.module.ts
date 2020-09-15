import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';



  const appRoutes: Routes = [
   
    { path:'signin',component:LoginComponent},
    { path: '', redirectTo: 'home',pathMatch: 'full'},
    { path: 'prediction', redirectTo: 'prediction',pathMatch: 'full'},
    { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule) },
    { path: 'prediction', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule) },
    { path: 'error', redirectTo: 'others/404' },
    { path: 'prediction', redirectTo: 'prediction',pathMatch: 'full'},
    ];
    
    


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
