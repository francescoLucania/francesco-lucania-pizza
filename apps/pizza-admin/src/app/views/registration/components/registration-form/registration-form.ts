import { Component, inject, input, output, signal } from '@angular/core';
import {
  form,
  required,
  email,
  minLength,
  maxLength,
  ValidationError,
  FieldState,
} from '@angular/forms/signals';
import { FormsModule } from '@angular/forms';
import { FormField } from '@angular/forms/signals';
import { Gender, RegistrationBody } from '@francesco-lucania-pizza-models';
import { InputComponent } from '@francesco-lucania-pizza/angular-ui';
import { ButtonComponent } from '@francesco-lucania-pizza/angular-ui';
import { RadioComponent } from '@francesco-lucania-pizza/angular-ui';
import { MaskitoOptions } from '@maskito/core';
import { normalizePhone } from '@francesco-lucania-pizza/angular-ui';

@Component({
  selector: 'pizza-admin-registration-form',
  imports: [
    FormsModule,
    FormField,
    InputComponent,
    ButtonComponent,
    RadioComponent,
  ],
  templateUrl: './registration-form.html',
  styleUrl: './registration-form.scss',
})
export class RegistrationForm {
  protected readonly submitted = signal(false);
  protected readonly isLoading = signal(false);

  public readonly serverError = input<string | null>(null);

  // Событие для отправки данных формы в родительский компонент
  public readonly formSubmit = output<RegistrationBody>();

  // Маска для российского телефона
  protected readonly phoneMaskOptions: MaskitoOptions = {
    mask: [
      '+',
      '7',
      ' ',
      '(',
      /\d/,
      /\d/,
      /\d/,
      ')',
      ' ',
      /\d/,
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
      '-',
      /\d/,
      /\d/,
    ],
  };

  // Отслеживаем, какие поля были отредактированы
  protected readonly touchedFields = signal<Set<string>>(new Set());

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
    },
  );

  protected markFieldTouched(fieldName: string): void {
    this.touchedFields.update((fields) => {
      const newFields = new Set(fields);
      newFields.add(fieldName);
      return newFields;
    });
  }

  protected shouldShowError(
    fieldName: string,
    fieldFn: () => FieldState<unknown>,
  ): boolean {
    const fieldState = fieldFn();
    return (
      (this.submitted() || this.touchedFields().has(fieldName)) &&
      fieldState.invalid()
    );
  }

  protected getErrorMessage(errors: readonly ValidationError[]): string {
    if (!errors || errors.length === 0) {
      return '';
    }

    const firstError = errors[0];
    const errorKind = firstError.kind || '';

    // Если есть сообщение, используем его, иначе используем маппинг по kind
    if (firstError.message) {
      return firstError.message;
    }

    const errorMessages: Record<string, string> = {
      required: 'Это поле обязательно для заполнения',
      email: 'Введите корректный email адрес',
      minLength: 'Минимальная длина 8 символов',
      maxLength: 'Максимальная длина 16 символов',
    };

    return errorMessages[errorKind] || 'Ошибка валидации';
  }

  protected send(): void {
    this.submitted.set(true);
    if (this.registrationForm().valid()) {
      const formValue = this.registrationModel();
      // Нормализуем телефон перед отправкой
      const normalizedFormValue = {
        ...formValue,
        phone: normalizePhone(formValue.phone),
      };
      this.formSubmit.emit(normalizedFormValue);
    }
  }
}
