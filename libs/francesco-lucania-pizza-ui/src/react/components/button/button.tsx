import * as React from 'react';
import styles from './button.module.scss';

export type ButtonProps = {
  onClick?: () => void;
  label?: string;
  theme?: 'base' | 'secondary' | 'brand';
  size?: 'base' | 'small' | 'large';
  fullWidth?: boolean;
  showLoader?: boolean;
  disabled?: boolean;
  buttonType?: 'submit' | 'reset' | 'button';
  link?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
};

export const NeoReactButton: React.FC<ButtonProps> = ({
  onClick,
  label = '',
  theme = 'base',
  size = 'base',
  fullWidth = false,
  showLoader = false,
  disabled = false,
  buttonType = 'button',
  link = '',
  target = '_self',
}) => {
  const classNames = [
    styles['pizza-ui-button'],
    theme === 'brand' ? styles['pizza-ui-button--theme-brand'] : '',
    theme === 'secondary' ? styles['pizza-ui-button--theme-secondary'] : '',
    size === 'small' ? styles['pizza-ui-button--size-small'] : '',
    size === 'large' ? styles['pizza-ui-button--size-large'] : '',
    fullWidth ? styles['pizza-ui-button--full-width'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.();
  };

  const content = showLoader ? '...' : label;
  const rel = target === '_blank' ? 'noopener noreferrer' : undefined;

  if (link) {
    return (
      <a
        href={link}
        target={target}
        rel={rel}
        className={classNames}
        aria-disabled={disabled}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={buttonType}
      className={classNames}
      onClick={handleClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
};

export default NeoReactButton;
