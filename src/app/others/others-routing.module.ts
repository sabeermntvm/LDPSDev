import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { UnautherizedComponent } from './unautherized/unautherized.component';

const routes: Routes = [
    {
        path: '404', component: NotFoundComponent
    },
    {
        path: '403',component: UnautherizedComponent
    }    
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OthersRoutingModule { }
