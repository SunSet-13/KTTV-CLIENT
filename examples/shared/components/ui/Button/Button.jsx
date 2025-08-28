// shared/components/ui/Button/Button.jsx
import React from 'react';
import classNames from 'classnames';
import styles from './Button.module.css';

const BUTTON_VARIANTS = {
  primary: 'primary',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  danger: 'danger',
};

const BUTTON_SIZES = {
  small: 'sm',
  medium: 'md',
  large: 'lg',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const buttonClass = classNames(
    styles.button,
    styles[`button--${BUTTON_VARIANTS[variant]}`],
    styles[`button--${BUTTON_SIZES[size]}`],
    {
      [styles['button--disabled']]: disabled,
      [styles['button--loading']]: loading,
      [styles['button--full-width']]: fullWidth,
    },
    className
  );

  const handleClick = (event) => {
    if (disabled || loading) return;
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      <span className={styles.content}>{children}</span>
    </button>
  );
};

export default Button;
