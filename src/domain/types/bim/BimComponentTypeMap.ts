import type { Components, FragmentsManager, Clipper, Views, SimpleGrid } from "@thatopen/components";
import type { AreaMeasurement, LengthMeasurement, Highlighter, VolumeMeasurement, AngleMeasurement } from "@thatopen/components-front";

import type { CameraDistanceLocker } from "@/lib/utils/bim/CameraDistanceLocker";

import type { BimComponent } from "@/domain/enums/bim/BimComponent";
import type { IBimComponent } from "@/domain/interfaces/bim";

import type { World } from "./World";

export interface BimComponentTypeMap extends Record<BimComponent, IBimComponent> {
  [BimComponent.Components]: Components & IBimComponent;
  [BimComponent.World]: World & IBimComponent;
  [BimComponent.FragmentsManager]: FragmentsManager & IBimComponent;
  [BimComponent.AreaMeasurer]: AreaMeasurement & IBimComponent;
  [BimComponent.LengthMeasurer]: LengthMeasurement & IBimComponent;
  [BimComponent.Highlighter]: Highlighter & IBimComponent;
  [BimComponent.CameraDistanceLocker]: CameraDistanceLocker;
  [BimComponent.Clipper]: Clipper & IBimComponent;
  [BimComponent.Views]: Views & IBimComponent;
  [BimComponent.VolumeMeasurer]: VolumeMeasurement & IBimComponent;
  [BimComponent.Grids]: SimpleGrid & IBimComponent;
  [BimComponent.AngleMeasurer]: AngleMeasurement & IBimComponent;
};
