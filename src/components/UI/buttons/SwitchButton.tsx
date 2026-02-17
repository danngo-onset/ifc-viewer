import { Switch } from "@mui/material";

import type { Props } from ".";

interface SwitchButtonProps extends Props {
  id: string;
  checked: boolean;

  /** Colour in Tailwind @example "blue-400" */
  colour: string;
}

export const SwitchButton = ({ 
  id, 
  checked, 
  onClick, 
  colour 
}: SwitchButtonProps) => (
  <Switch 
    id={id}
    checked={checked}
    onChange={onClick}
    slotProps={{
      switchBase: {className: `text-${colour}`},  // ripple effect
      thumb: {className: `text-${colour}`},  // thumb
      track: {className: `bg-gray-700 [.MuiSwitch-root:has(.Mui-checked)_&]:bg-${colour}`} // track
    }} 
  />
);
