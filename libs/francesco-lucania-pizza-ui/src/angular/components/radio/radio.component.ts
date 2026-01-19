import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  forwardRef,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  FormValueControl,
  ValidationError,
} from '@angular/forms/signals';
import { EMPTY_FUNCTION } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pizza-lib-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true,
    },
  ],
  standalone: true,
})
export class RadioComponent implements ControlValueAccessor, OnInit, FormValueControl<string> {
  public static idCounter = 1;

  // Signal-based inputs
  public radioId = input<string>(''); // input ID: если не указан, генерируется уникальный ID
  public disabled = input<boolean>(false); // состояние: по умолчанию - активное
  public label = input<string>('');
  public description = input<string>('');
  public errorMessage = input<string>('');
  public required = input<boolean>(false);
  public name = input<string>('');
  public radioValue = input<string>(''); // Значение этого конкретного radio button

  // Signal-based outputs
  public changedEvent = output<string>();
  public focusEvent = output<FocusEvent>();
  public blurEvent = output<FocusEvent>();

  // FormValueControl required signal - текущее выбранное значение группы
  readonly value = model<string>('');

  // FormValueControl optional signals
  readonly errors = input<readonly ValidationError[]>([]);
  readonly touched = model<boolean>(false);
  readonly dirty = model<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  readonly pattern = input<readonly RegExp[]>([]);

  /** The method to be called in order to update ngModel */
  private controlValueAccessorChangeFn = EMPTY_FUNCTION;
  private onTouched = EMPTY_FUNCTION;
  private _controlValueAccessorChangeFn = EMPTY_FUNCTION;

  // Internal state for backward compatibility
  private _radioId = '';
  public _checked = false; // Public for template access

  constructor(private cdr: ChangeDetectorRef) {
    // Sync value signal with checked state
    effect(() => {
      const currentValue = this.value();
      const radioVal = this.radioValue();
      const shouldBeChecked = currentValue === radioVal && radioVal !== '';
      if (shouldBeChecked !== this._checked) {
        this._checked = shouldBeChecked;
        this.cdr.detectChanges();
      }
    });
  }

  public ngOnInit(): void {
    // генеририрует уникальный ID, если не указан radioId
    const id = this.radioId();
    if (!id) {
      this._radioId = 'app-radio-' + RadioComponent.idCounter++;
    } else {
      this._radioId = id;
    }
  }

  public get computedRadioId(): string {
    return this._radioId || this.radioId();
  }

  public onChange(event: Event): void {
    // всегда true, но вызывается только для активного
    const { target } = event;
    if (target instanceof HTMLInputElement && target.checked) {
      const radioVal = this.radioValue();
      this._checked = true;
      this.value.set(radioVal);
      this.dirty.set(true);
      this.touched.set(true);

      // для остальных из данной группы синхронизация произойдет через модель
      this.controlValueAccessorChangeFn(radioVal);
      this.changedEvent.emit(radioVal);
    }
  }

  public notifyFocusEvent(event: FocusEvent): void {
    this.touched.set(true);
    this.focusEvent.emit(event);
  }

  public notifyBlurEvent(event: FocusEvent): void {
    this.touched.set(true);
    this.blurEvent.emit(event);
  }

  // Обязательные методы ControlValueAccessor:

  public writeValue(value: string): void {
    const stringValue = value === null || value === undefined ? '' : String(value);
    this.value.set(stringValue);
    this._checked = stringValue === this.radioValue();
    this.cdr.detectChanges();
  }

  public registerOnChange(fn: (value: unknown) => void): void {
    this.controlValueAccessorChangeFn = fn;
    this.cdr.detectChanges();
  }

  public registerOnTouched(onTouched: () => void): void {
    this.onTouched = onTouched;
    this.cdr.detectChanges();
  }

  public setDisabledState(isDisabled: boolean): void {
    // Note: disabled is now a signal, so we can't directly set it
    // This method is called by ControlValueAccessor, but the actual disabled state
    // should be controlled through the input signal or form state
    this.cdr.detectChanges();
  }
}
