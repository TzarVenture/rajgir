import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuLoaderCircle } from "react-icons/lu";
import { cn } from "./cn";

/**
 * Buttons from designn.md section 9: 8px radius, Manrope 600, heights 36 / 44 / 48 / 52,
 * primary = brand red, secondary = white with border, tertiary = red text.
 */
export type ButtonVariant = "primary" | "secondary" | "tertiary";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-btn font-manrope font-semibold transition-colors duration-150 " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-red " +
  "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand-red text-white hover:bg-brand-red-dark",
  secondary: "border border-charcoal-300 bg-white text-charcoal-800 hover:bg-charcoal-50",
  tertiary: "bg-transparent text-brand-red hover:underline",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
  xl: "h-[52px] px-7 text-base",
};

export function buttonClasses({
  variant = "primary",
  size = "lg",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  return cn(
    BASE,
    VARIANTS[variant],
    variant === "tertiary" ? "h-auto px-0" : SIZES[size],
    fullWidth && "w-full",
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  icon?: IconType;
  iconRight?: IconType;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...rest}
    >
      {loading ? <LuLoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {children}
      {IconRight && !loading ? <IconRight className="h-4 w-4" aria-hidden /> : null}
    </button>
  );
}

interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: IconType;
  iconRight?: IconType;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function LinkButton({
  href,
  variant,
  size,
  fullWidth,
  icon: Icon,
  iconRight: IconRight,
  className,
  children,
  onClick,
}: LinkButtonProps) {
  return (
    <Link href={href} onClick={onClick} className={buttonClasses({ variant, size, fullWidth, className })}>
      {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
      {children}
      {IconRight ? <IconRight className="h-4 w-4" aria-hidden /> : null}
    </Link>
  );
}
