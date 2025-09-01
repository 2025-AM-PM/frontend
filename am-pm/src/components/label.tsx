import React from "react";
import "../styles/ui-label.css";
import { cn } from "./utils";

export type LabelSize = "sm" | "md" | "lg";

type Props = React.LabelHTMLAttributes<HTMLLabelElement> & {
  size?: LabelSize; // 기본 "md"
  muted?: boolean; // 보조 톤
  requiredMark?: boolean; // * 표시 자동 추가
  disabledStyle?: boolean; // 비활성 스타일 강제 적용(필요 시)
};

export const Label = React.forwardRef<HTMLLabelElement, Props>(
  (
    {
      className = "",
      size = "md",
      muted = false,
      requiredMark = false,
      disabledStyle = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <label
        ref={ref}
        data-slot="label"
        className={cn(
          "ui-label",
          `ui-label--${size}`,
          muted && "ui-label--muted",
          disabledStyle && "ui-label--disabled",
          className
        )}
        {...props}
      >
        {children}
        {requiredMark && (
          <span className="ui-label__req" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";
export default Label;
