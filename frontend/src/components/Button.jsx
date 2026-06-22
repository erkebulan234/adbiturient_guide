import React from 'react';

const variants = {
  primary: 'ui-button primary-button',
  secondary: 'ui-button secondary-button',
  ghost: 'ui-button ui-button-ghost',
  danger: 'ui-button danger-button'
};

const sizes = {
  sm: 'ui-button-sm',
  md: 'ui-button-md',
  lg: 'ui-button-lg'
};

const spinnerSizes = {
  sm: 'ui-spinner-sm',
  md: 'ui-spinner-sm',
  lg: 'ui-spinner-md'
};

export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) {
  const classes = [
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    isLoading ? 'is-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <span className={`ui-spinner ${spinnerSizes[size] || spinnerSizes.md}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </Component>
  );
}