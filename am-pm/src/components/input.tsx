import React from "react";
import "../styles/ui-input.css";
import { cn } from "./utils";

export type InputSize = "sm" | "md" | "lg";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: InputSize;
};

export const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className = "", size = "md", type = "text", ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn("ui-input", `ui-input--${size}`, className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
