declare module 'react-textfit' {
  import * as React from 'react';
  export interface TextfitProps extends React.HTMLAttributes<HTMLDivElement> {
    mode?: 'single' | 'multi';
    min?: number;
    max?: number;
    forceSingleModeWidth?: boolean;
    throttle?: number;
    autoResize?: boolean;
    onReady?: (fontSize: number) => void;
  }
  export const Textfit: React.FC<TextfitProps>;
} 