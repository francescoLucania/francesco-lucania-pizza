import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
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
export class RadioComponent implements ControlValueAccessor, OnInit {
  public static idCounter = 1;

  @Input() public radioId = ''; // input ID: если не указан, генерируется уникальный ID
  @Input() public disabled = false; // состояние: по умолчанию - активное
  @Input() public label = '';
  @Input() public description = '';
  @Input() public errorMessage = '';
  @Input() public required = false;
  @Input() public name = '';
  @Input() public value = '';
  @Input() public checked = false;

  @Output() private changedEvent = new EventEmitter<string>();
  @Output() private focusEvent = new EventEmitter<FocusEvent>();
  @Output() private blurEvent = new EventEmitter<FocusEvent>();

  /** The method to be called in order to update ngModel */
  private controlValueAccessorChangeFn = EMPTY_FUNCTION;
  private onTouched = EMPTY_FUNCTION;
  private _controlValueAccessorChangeFn = EMPTY_FUNCTION;

  constructor(private cdr: ChangeDetectorRef) {}

  public ngOnInit(): void {
    // генеририрует уникальный ID, если не указан radioId
    if (!this.radioId) {
      this.radioId = 'app-radio-' + RadioComponent.idCounter++;
    }
  }

  public onChange(event: Event): void {
    // всегда true, но вызывается только для активного
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.checked = target.checked;
    }

    // для остальных из данной группы синхронизация произойдет через модель
    this.controlValueAccessorChangeFn(this.value);
    this.changedEvent.emit(this.value);
  }

  public notifyFocusEvent(event: FocusEvent): void {
    this.focusEvent.emit(event);
  }

  public notifyBlurEvent(event: FocusEvent): void {
    this.blurEvent.emit(event);
  }

  // Обязательные методы ControlValueAccessor:

  public writeValue(value: string): void {
    this.checked = value === this.value;
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
    this.disabled = isDisabled;
    this.cdr.detectChanges();
  }
}
