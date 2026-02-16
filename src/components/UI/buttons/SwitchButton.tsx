import type { Props } from ".";
import { Switch } from "@mui/material";

interface SwitchButtonProps extends Props {
  id: string;
  checked: boolean;
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
