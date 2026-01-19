import { Component } from '@angular/core';
import {RegistrationForm} from "./components/registration-form/registration-form";

@Component({
  selector: 'pizza-admin-registration',
  imports: [
    RegistrationForm
  ],
  templateUrl: './registration.html',
  styleUrl: './registration.scss',
})
export class Registration {

}
