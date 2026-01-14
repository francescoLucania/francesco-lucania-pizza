import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [CheckboxComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [CheckboxComponent],
})
export class CheckboxModule {}
