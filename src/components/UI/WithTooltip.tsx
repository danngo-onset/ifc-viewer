import { ReactNode, useState } from "react";

type WithTooltipProps = {
  readonly message: string;
  readonly children: ReactNode;
}

export const WithTooltip = ({ message, children }: WithTooltipProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      {
        showTooltip && 
        <p className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-sm rounded whitespace-nowrap pointer-events-none">
          {message}
        </p>
      }
    </span>
  );
};
