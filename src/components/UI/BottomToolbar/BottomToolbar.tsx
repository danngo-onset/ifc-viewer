import { 
  LengthMeasurerButton, AreaMeasurerButton, VolumeMeasurerButton, CameraDistanceLockerButton, HighlighterButton,
  ClipperButton
} from "./ToggleButtons";

import { CameraViewModesButton, OrientationButton } from "./AccordionButtons";

export const BottomToolbar = () => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-20">
      <div className="bottom-toolbar-sub-container">
        <LengthMeasurerButton />

        <AreaMeasurerButton />

        <VolumeMeasurerButton />

        {/* <CameraDistanceLockerButton /> */}

        <HighlighterButton />

        <ClipperButton />
      </div>

      <div className="bottom-toolbar-sub-container">
        <CameraViewModesButton />

        <OrientationButton />
      </div>
    </div>
  );
};
