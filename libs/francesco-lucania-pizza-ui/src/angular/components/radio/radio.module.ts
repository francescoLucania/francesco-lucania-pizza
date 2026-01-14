import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RadioComponent } from './radio.component';

@NgModule({
  declarations: [RadioComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [RadioComponent],
})
export class RadioModule {}
