import type { CSSProperties } from "react";
import type { Status } from "@/lib/pipeline";

interface DotProps {
  status: Status;
  /** Diameter in px (defaults to the CSS token, 14px). */
  size?: number;
  title?: string;
}

/** Status indicator — green / amber / red for success / cached / failure. */
export function Dot({ status, size, title }: DotProps) {
  return (
    <span
      className={`dot ${status}`}
      style={size ? ({ "--sz": `${size}px` } as CSSProperties) : undefined}
      title={title}
      role={title ? "img" : undefined}
      aria-label={title}
    />
  );
}
