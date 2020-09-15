import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OthersRoutingModule } from './others-routing.module';
import { NotFoundComponent } from './not-found/not-found.component';
import { RouterModule } from '@angular/router';
import { UnautherizedComponent } from './unautherized/unautherized.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    OthersRoutingModule,
    FormsModule
  ],
  declarations: [NotFoundComponent,UnautherizedComponent]
})
export class OthersModule { }
