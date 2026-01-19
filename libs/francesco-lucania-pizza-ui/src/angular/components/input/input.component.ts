import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  forwardRef,
  Host,
  HostBinding,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  output,
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
    ControlValueAccessor
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
  public name = input<string | undefined>(undefined);
  public formControlName = input<string | undefined>(undefined);
  public type = input<string | undefined>(undefined); // password, email, number итд
  public minlength = input<string | number | undefined>(undefined);
  public maxlength = input<string | number | undefined>(undefined);
  public autocomplete = input<boolean>(false);
  public placeholder = input<string | undefined>(undefined);
  public tabIndex = input<string | number | undefined>(undefined);
  public ariaLabel = input<string | undefined>(undefined);
  public readOnly = input<boolean | undefined>(undefined);
  public disabled = input<boolean>(false);
  public multiline = input<boolean | undefined>(undefined);
  public commitOnInput = input<boolean>(true); // коммитить по input или по change
  public invalid = input<boolean>(false);
  public size = input<'small' | 'base' | 'large'>('base');
  public maskitoOptions = input<MaskitoOptions | null>(null);
  public id = input<string>('');

  public value = '';

  private destroyed = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control: AbstractControl | null = null;
  private onTouchedCallback!: () => void;
  public showToggle = false;
  public showPassword = false;

  constructor(
    private changeDetection: ChangeDetectorRef,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer
  ) {}

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
    this.check();
  }

  public ngOnChanges() {
    this.check();
  }

  public ngDoCheck() {
    if (this.control) {
      this.touched = this.control.touched;
    }
    this.check();
  }

  public ngOnDestroy() {
    this.destroyed = true;
  }

  public showButtonKeypress(event: Event): void {
    event.stopPropagation();
  }

  public switchPasswordMode(): void {
    this.showPassword = !this.showPassword;
    this.changeDetection.detectChanges();
  }

  public writeValue(value: string | number) {
    this.value = value === null || value === undefined ? '' : '' + value;
    if (this.multiline() && this.inputElement) {
      this.inputElement.nativeElement.value = this.value;
    }
    this.check();
    if (!this.destroyed) {
      this.changeDetection.detectChanges();
    }
  }

  public handleBlur() {
    this.focused = false;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.check();
    this.changeDetection.detectChanges();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.check();
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
    this.value = this.inputElement.nativeElement.value;
    if (this.commitOnInput()) {
      this.commit(this.value);
    }
    this.check();
  }

  public handleChange(): void {
    this.value = this.inputElement.nativeElement.value;
    if (!this.commitOnInput()) {
      this.commit(this.value);
    }
    this.check();
  }

  public forceChange() {
    this.check();
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

  public check() {}
  protected commit(value: string): void {}
}
