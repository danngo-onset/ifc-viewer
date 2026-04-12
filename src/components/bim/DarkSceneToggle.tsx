import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

import { useBimStoreShallow } from "@/store";

import { WithTooltip } from "@/components/ui";

export const DarkSceneToggle = () => {
  const { darkSceneEnabled, setDarkSceneEnabled } = useBimStoreShallow(s => ({
    darkSceneEnabled: s.darkSceneEnabled,
    setDarkSceneEnabled: s.setDarkSceneEnabled
  }));

  return (
    <button 
      onClick={() => setDarkSceneEnabled(!darkSceneEnabled)}
      id="dark-scene-toggle"
      data-enabled={darkSceneEnabled}
    >
      { darkSceneEnabled 
        ? <WithTooltip message="Switch to light scene" position="bottom">
            <MoonIcon /> 
          </WithTooltip>

        : <WithTooltip message="Switch to dark scene" position="bottom">
            <SunIcon /> 
          </WithTooltip>
      }
    </button>
  );
};
