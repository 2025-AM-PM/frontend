import React from "react";
import "../styles/ui-textarea.css";
import { cn } from "./utils";

export type TextareaSize = "sm" | "md" | "lg";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: TextareaSize; // 기본 "md"
  noResize?: boolean; // true면 resize: none
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(
  ({ className = "", size = "md", noResize = true, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(
          "ui-textarea",
          `ui-textarea--${size}`,
          noResize && "ui-textarea--noresize",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
