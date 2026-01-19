import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  DoCheck,
  effect,
  ElementRef,
  forwardRef,
  Host,
  HostBinding,
  input,
  model,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  output,
  signal,
  SkipSelf,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  FormValueControl,
  ValidationError,
} from '@angular/forms/signals';
import { Suggest, SuggestItem } from './models/suggest';
import { HelperService } from '../../services';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions } from '@maskito/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pizza-lib-input',
  templateUrl: './input.component.html',
  styleUrls: [
    '../../../../assets/styles/theme-provider/lib-components/input/input.component.scss',
  ],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  imports: [NgClass, FormsModule, MaskitoDirective, NgTemplateOutlet],
})
export class InputComponent
  implements
    OnInit,
    OnChanges,
    AfterViewInit,
    DoCheck,
    OnDestroy,
    ControlValueAccessor,
    FormValueControl<string>
{
  @ViewChild('input') protected inputElement!: ElementRef<HTMLInputElement>;

  @HostBinding('attr.id')
  public get externalId(): string | null {
    return this.id() || null;
  }

  // focus и blur искусственные, одноименные с естественными, остальные события просто всплывают
  public cleared = output<void>();
  public focusEvent = output<FocusEvent>();
  public blurEvent = output<FocusEvent>();
  public selectSuggest = output<Suggest | SuggestItem>();
  // эти события не перехватываются и всплывают:
  // input, change, keydown, keyup, keypress, click, dblclick, touchstart, touchend,
  // touchmove, mousedown, mouseup, mouseenter, mouseleave, mouseover, mouseout, mousemove

  // name используется для назначения аттрибуту, но чтобы связать контрол с формой - используйте formControlName
  // For FormValueControl compatibility, name must be InputSignal<string>
  public name = input<string>('');
  public formControlName = input<string | undefined>(undefined);
  public type = input<string | undefined>(undefined); // password, email, number итд
  public minlength = input<string | number | undefined>(undefined);
  public maxlength = input<string | number | undefined>(undefined);
  public autocomplete = input<boolean>(false);
  public placeholder = input<string | undefined>(undefined);
  public tabIndex = input<string | number | undefined>(undefined);
  public ariaLabel = input<string | undefined>(undefined);
  // readOnly kept for backward compatibility, readonly is for FormValueControl
  public readOnly = input<boolean | undefined>(undefined);
  public disabled = input<boolean>(false);
  public multiline = input<boolean | undefined>(undefined);
  public commitOnInput = input<boolean>(true); // коммитить по input или по change
  public invalidView = input<boolean>(false);
  public size = input<'small' | 'base' | 'large'>('base');
  public maskitoOptions = input<MaskitoOptions | null>(null);
  public id = input<string>('');

  // FormValueControl required signal
  readonly value = model<string>('');

  // FormValueControl optional signals
  readonly errors = input<readonly ValidationError[]>([]);
  readonly touched = model<boolean>(false);
  readonly dirty = model<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly minLength = input<number | undefined>(undefined);
  readonly maxLength = input<number | undefined>(undefined);
  readonly pattern = input<readonly RegExp[]>([]);

  // Internal value for backward compatibility with ControlValueAccessor
  private _internalValue = '';

  private destroyed = signal(false);
  public focused = signal(false);
  private _touched = signal(false); // For backward compatibility
  public control: AbstractControl | null = null;
  private onTouchedCallback!: () => void;
  public showToggle = computed(() => this.type() === 'password');
  public showPassword = signal(false);

  constructor(
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer
  ) {
    // Sync value signal with input element when changed externally (e.g., via formField)
    effect(() => {
      const signalValue = this.value();
      if (signalValue !== this._internalValue && this.inputElement?.nativeElement) {
        this._internalValue = signalValue;
        if (this.inputElement.nativeElement.value !== signalValue) {
          this.inputElement.nativeElement.value = signalValue;
        }
      }
    });
  }

  public ngOnInit(): void {
    if (this.controlContainer && this.formControlName()) {
      this.control = this.controlContainer?.control?.get(this.formControlName()!)
        ? this.controlContainer?.control?.get(this.formControlName()!)
        : null;
    } else {
      this.control = null;
    }
  }

  public registerOnChange(fn: (value: unknown) => void): void {
    this.commit = fn;
  }

  public ngAfterViewInit(): void {
    // Signals handle reactivity automatically
  }

  public ngOnChanges() {
    // Signals handle reactivity automatically
  }

  public ngDoCheck() {
    if (this.control) {
      const controlTouched = this.control.touched;
      this._touched.set(controlTouched);
      if (controlTouched !== this.touched()) {
        this.touched.set(controlTouched);
      }
    }
  }

  public ngOnDestroy() {
    this.destroyed.set(true);
  }

  public showButtonKeypress(event: Event): void {
    event.stopPropagation();
  }

  public switchPasswordMode(): void {
    this.showPassword.update(value => !value);
  }

  public writeValue(value: string | number) {
    const stringValue = value === null || value === undefined ? '' : '' + value;
    this._internalValue = stringValue;
    this.value.set(stringValue);
    if (this.multiline() && this.inputElement) {
      this.inputElement.nativeElement.value = stringValue;
    }
  }

  public handleBlur() {
    this.focused.set(false);
    this.touched.set(true);
    this._touched.set(true);
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
  }

  public handleFocus() {
    this.focused.set(true);
    this.touched.set(true);
    this._touched.set(true);
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
  }

  public returnFocus(e?: Event) {
    if (
      this.inputElement &&
      this.inputElement.nativeElement &&
      (!e || e.target !== this.inputElement.nativeElement)
    ) {
      this.inputElement.nativeElement.focus();
      HelperService.resetSelection(this.inputElement.nativeElement);
    }
  }

  public loseFocus() {
    this.inputElement.nativeElement.blur();
  }

  public handleInput(e: Event) {
    const newValue = this.inputElement.nativeElement.value;
    this._internalValue = newValue;
    this.value.set(newValue);
    this.dirty.set(true);
    if (this.commitOnInput()) {
      this.commit(newValue);
    }
  }

  public handleChange(): void {
    const newValue = this.inputElement.nativeElement.value;
    this._internalValue = newValue;
    this.value.set(newValue);
    this.dirty.set(true);
    if (!this.commitOnInput()) {
      this.commit(newValue);
    }
  }

  public forceChange() {
    // No-op: signals handle reactivity automatically
  }

  public registerOnTouched(fn: () => void) {
    this.onTouchedCallback = fn;
  }

  public notifyBlurEvent(event: FocusEvent) {
    this.blurEvent.emit(event);
  }

  public notifyFocusEvent(event: FocusEvent) {
    this.focusEvent.emit(event);
  }

  protected commit(value: string): void {}
}
