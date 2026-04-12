import { ReactNode, useState } from "react";

type Props = {
  message  : string;
  children : ReactNode;
  position : "top" | "bottom";
}

export const WithTooltip = ({ message, children, position }: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <span
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}

      { showTooltip && 
        <p className="tooltip" data-position={position}>
          {message}
        </p>
      }
    </span>
  );
};
