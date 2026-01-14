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
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { EMPTY_FUNCTION } from '../../constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'neo-ui-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxStandaloneComponent),
      multi: true,
    },
  ],
})
export class CheckboxStandaloneComponent implements OnInit {
  public static idCounter = 1;

  @Input() public radioId: string; // input ID: если не указан, генерируется уникальный ID
  @Input() public disabled = false; // состояние: по умолчанию - активное
  @Input() public label: string;
  @Input() public description: string;
  @Input() public errorMessage: string;
  @Input() public required = false;
  @Input() public value: string;
  @Input() public checked: boolean;

  @Output() private changed = new EventEmitter<string>();
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
      this.radioId = 'app-radio-' + CheckboxStandaloneComponent.idCounter++;
    }
  }

  public onSelected(event: Event): void {
    // всегда true, но вызывается только для активного
    const { target } = event;
    if (target instanceof HTMLInputElement) {
      this.checked = target.checked;
    }
    // для остальных из данной группы синхронизация произойдет через модель
    console.log('this.value', this.value);
    this.controlValueAccessorChangeFn(this.value);
    this.changed.emit(this.value);
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
