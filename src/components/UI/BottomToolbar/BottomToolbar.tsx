import { 
  LengthMeasurerButton, AreaMeasurerButton, VolumeMeasurerButton, CameraDistanceLockerButton, HighlighterButton,
  ClipperButton
} from "./buttons";

export const BottomToolbar = () => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
      <div className="bg-white border border-gray-300 rounded-md shadow-xl p-1 flex items-end gap-2">
        <LengthMeasurerButton />

        <AreaMeasurerButton />

        <VolumeMeasurerButton />

        <CameraDistanceLockerButton />

        <HighlighterButton />

        <ClipperButton />
      </div>
    </div>
  );
};
