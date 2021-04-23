import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ComputorRoutingModule } from './computor-routing.module';
import { ComputorComponent } from './computor.component';
import { FormsModule } from '@angular/forms';
import { KatexModule } from 'ng-katex';

@NgModule({
  declarations: [ComputorComponent],
  imports: [CommonModule, ComputorRoutingModule, FormsModule, KatexModule],
})
export class ComputorModule {}
