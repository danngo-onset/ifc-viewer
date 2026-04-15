import { useEffect, RefObject, type SetState } from "react";

export const useClickOutside = (
  ref       : RefObject<HTMLDivElement | null>,
  isOpen    : boolean,
  setIsOpen : SetState<boolean>
) => {
  useEffect(() => {
    if (!isOpen) return;

    const abortController = new AbortController();
    
    document.addEventListener(
      "mousedown", 
      (event: MouseEvent) => {
        if (!ref.current) return;

        const target = event.target as Node;
        
        if (!ref.current.contains(target)) {
          setIsOpen(false);
        }
      }, 
      { signal: abortController.signal }
    );

    return () => {
      abortController.abort();
    };
  }, [isOpen, ref, setIsOpen]);
};
