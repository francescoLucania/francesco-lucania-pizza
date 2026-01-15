import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  Host,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
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
  public externalId: string | null = '';

  // focus и blur искусственные, одноименные с естественными, остальные события просто всплывают
  @Output() public cleared = new EventEmitter<void>();
  @Output() public focusEvent = new EventEmitter<FocusEvent>();
  @Output() public blurEvent = new EventEmitter<FocusEvent>();
  @Output() public selectSuggest = new EventEmitter<Suggest | SuggestItem>();
  // эти события не перехватываются и всплывают:
  // input, change, keydown, keyup, keypress, click, dblclick, touchstart, touchend,
  // touchmove, mousedown, mouseup, mouseenter, mouseleave, mouseover, mouseout, mousemove

  // name используется для назначения аттрибуту, но чтобы связать контрол с формой - используйте formControlName
  @Input() public name?: string;
  @Input() public formControlName?: string;
  @Input() public type?: string; // password, email, number итд
  @Input() public minlength?: string | number;
  @Input() public maxlength?: string | number;
  @Input() public autocomplete = false;
  @Input() public placeholder?: string;
  @Input() public tabIndex?: string | number;
  @Input() public ariaLabel?: string;
  @Input() public readOnly?: boolean;
  @Input() public disabled = false;
  @Input() public multiline?: boolean;
  @Input() public commitOnInput = true; // коммитить по input или по change
  @Input() public invalid = false;
  @Input() public size: 'small' | 'base' | 'large' = 'base';
  @Input() public maskitoOptions: MaskitoOptions | null = null;

  @Input()
  public set id(value: string) {
    this._ID = value;
    this.externalId = null;
  }

  public get id() {
    return this._ID;
  }

  public value = '';

  private destroyed = false;
  public focused = false;
  public touched = false;
  public invalidDisplayed = false;
  public control: AbstractControl | null = null;

  private _ID = '';
  private onTouchedCallback!: () => void;
  public showToggle = false;
  public showPassword = false;

  constructor(
    private changeDetection: ChangeDetectorRef,
    @Optional() @Host() @SkipSelf() private controlContainer: ControlContainer
  ) {}

  public ngOnInit(): void {
    if (this.controlContainer && this.formControlName) {
      this.control = this.controlContainer?.control?.get(this.formControlName)
        ? this.controlContainer?.control?.get(this.formControlName)
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
    if (this.multiline && this.inputElement) {
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

    this.blurEvent.emit();
    this.changeDetection.detectChanges();
  }

  public handleFocus() {
    this.focused = this.touched = true;
    if (this.onTouchedCallback) {
      this.onTouchedCallback();
    }
    this.check();
    this.focusEvent.emit();
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
    if (this.commitOnInput) {
      this.commit(this.value);
    }
    this.check();
  }

  public handleChange(): void {
    this.value = this.inputElement.nativeElement.value;
    if (!this.commitOnInput) {
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
