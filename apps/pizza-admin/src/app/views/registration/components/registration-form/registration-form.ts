import { Component, signal } from '@angular/core';
import {
  form,
  required,
  email,
  minLength,
  maxLength,
} from '@angular/forms/signals';
import {Gender, RegistrationBody} from "@francesco-lucania-pizza-models";

@Component({
  selector: 'pizza-admin-registration-form',
  imports: [],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.css',
})
export class RegistrationForm {
  protected readonly registrationModel = signal<RegistrationBody>({
    email: '',
    phone: '',
    name: '',
    fullName: '',
    gender: '' as Gender,
    dateIssue: '',
    password: '',
  });

  protected readonly registrationForm = form(
    this.registrationModel,
    (schema) => {
      required(schema.email);
      email(schema.email);
      required(schema.phone);
      required(schema.name);
      required(schema.fullName);
      required(schema.gender);
      required(schema.dateIssue);
      required(schema.password);
      minLength(schema.password, 8);
      maxLength(schema.password, 16);
    }
  );

  protected send(): void {
    if (this.registrationForm().valid()) {
      const formValue = this.registrationModel();
      console.log('Form submitted:', formValue);
      // TODO: Implement form submission logic
    }
  }
}
