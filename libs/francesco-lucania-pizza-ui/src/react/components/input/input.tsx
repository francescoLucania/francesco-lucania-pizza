import * as React from 'react';
import { Maskito, MaskitoOptions } from '@maskito/core';
import styles from './input.module.scss';

export type InputProps = {
  onInput?: (value: string) => void;
  value?: string | number;
  name?: string;
  formControlName?: string;
  type?: string; // password, email, number итд
  minlength?: string | number;
  maxlength?: string | number;
  autocomplete?: boolean;
  placeholder?: string;
  tabIndex?: string | number;
  ariaLabel?: string;
  readOnly?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  commitOnInput?: boolean; // коммитить по input или по change
  invalid?: boolean;
  size?: 'small' | 'base' | 'large';
  autoFocus?: boolean;
  maskitoOptions?: MaskitoOptions;
  phoneMask?: MaskitoOptions;
};

const defaultPhoneMask: MaskitoOptions = {
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

export const NeoReactInput: React.FC<InputProps> = ({
  onInput,
  value,
  name,
  formControlName,
  type = 'text',
  minlength,
  maxlength,
  autocomplete = true,
  placeholder = '',
  tabIndex,
  ariaLabel,
  readOnly = false,
  disabled = false,
  multiline = false,
  commitOnInput = false,
  invalid = false,
  size = 'base',
  autoFocus = false,
  maskitoOptions,
  phoneMask = defaultPhoneMask,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const wrapperClassName = [
    styles['pizza-ui-input'],
    invalid ? styles['pizza-ui-input--invalid'] : '',
    disabled ? styles['pizza-ui-input--disable'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const inputClassName = [
    styles['pizza-ui-input__tag'],
    size === 'small' ? styles['pizza-ui-input__tag--size-small'] : '',
    size === 'large' ? styles['pizza-ui-input__tag--size-large'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleInput = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onInput?.(event.currentTarget.value);
  };

  const togglePasswordVisibility = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const displayValue =
    value === undefined || value === null ? '' : String(value);
  const isPassword = type === 'password';
  const isPhone = type === 'phone';
  const inputType =
    isPassword && showPassword ? 'text' : isPhone ? 'tel' : type;

  const minLengthValue =
    minlength === undefined || minlength === null
      ? undefined
      : Number(minlength);
  const maxLengthValue =
    maxlength === undefined || maxlength === null
      ? undefined
      : Number(maxlength);
  const tabIndexValue =
    tabIndex === undefined || tabIndex === null ? undefined : Number(tabIndex);

  const sharedProps = {
    value: displayValue,
    name,
    placeholder,
    tabIndex: tabIndexValue,
    readOnly,
    disabled,
    'aria-label': ariaLabel,
    minLength: minLengthValue,
    maxLength: maxLengthValue,
    autoFocus,
    autoComplete: autocomplete ? 'on' : 'off',
    onInput: commitOnInput ? handleInput : undefined,
    onChange: commitOnInput ? undefined : handleInput,
    'data-form-control-name': formControlName,
  } as const;

  React.useEffect(() => {
    if (multiline || !inputRef.current) {
      return;
    }
    const options = isPhone ? phoneMask : maskitoOptions;
    if (!options) {
      return;
    }

    const instance = new Maskito(inputRef.current, options);
    return () => instance.destroy();
  }, [isPhone, maskitoOptions, multiline]);

  return (
    <div className={wrapperClassName}>
      {isPassword && displayValue.length > 0 && !multiline && (
        <button
          type="button"
          className={[
            styles['pizza-ui-input__show-hide'],
            showPassword ? styles['show'] : '',
            invalid ? styles['invalid'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          tabIndex={tabIndexValue}
          onMouseDown={(event) => event.preventDefault()}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
        </button>
      )}
      {multiline ? (
        <textarea className={inputClassName} {...sharedProps} />
      ) : (
        <input
          ref={inputRef}
          className={inputClassName}
          type={inputType}
          {...sharedProps}
        />
      )}
    </div>
  );
};
