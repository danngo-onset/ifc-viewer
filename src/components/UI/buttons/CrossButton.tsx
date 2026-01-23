import { Cross1Icon } from "@radix-ui/react-icons";

import type { Props } from ".";

export const CrossButton = ({ onClick }: Props) => {
  return (
    <button 
      onClick={onClick} 
      className="p-1.5 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
    >
      <Cross1Icon className="w-4 h-4" />
    </button>
  );
};
