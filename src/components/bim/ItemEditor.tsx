import { useRef } from "react";

export const ItemEditor = () => {
  const panelContainerRef = useRef<HTMLDivElement>(null);

  return <div className="overflow-auto" ref={panelContainerRef} />
};
