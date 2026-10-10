import React from "react";
import { BUTTON_VARIANTS } from "@/theme/tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "quickLog";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyle = BUTTON_VARIANTS[variant]?.className || BUTTON_VARIANTS.primary.className;

  return (
    <button className={`${baseStyle} ${className}`} {...props}>
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
