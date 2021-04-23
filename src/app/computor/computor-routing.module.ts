import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComputorComponent } from './computor.component';

const routes: Routes = [
  {
    path: '',
    component: ComputorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComputorRoutingModule {}
