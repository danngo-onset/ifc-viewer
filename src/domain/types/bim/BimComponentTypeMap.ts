import type * as OBC from "@thatopen/components";
import type * as OBCF from "@thatopen/components-front";

import type { CameraDistanceLocker } from "@/lib/utils/bim/CameraDistanceLocker";

import type { BimComponent } from "@/domain/enums/bim/BimComponent";
import type { IBimComponent } from "@/domain/interfaces/bim";

import type { World } from "./World";

export interface BimComponentTypeMap extends Record<BimComponent, IBimComponent> {
  [BimComponent.Components]: OBC.Components & IBimComponent;
  [BimComponent.World]: World & IBimComponent;
  [BimComponent.FragmentsManager]: OBC.FragmentsManager & IBimComponent;
  [BimComponent.AreaMeasurer]: OBCF.AreaMeasurement & IBimComponent;
  [BimComponent.LengthMeasurer]: OBCF.LengthMeasurement & IBimComponent;
  [BimComponent.Highlighter]: OBCF.Highlighter & IBimComponent;
  [BimComponent.CameraDistanceLocker]: CameraDistanceLocker;
  [BimComponent.Clipper]: OBC.Clipper & IBimComponent;
  [BimComponent.Views]: OBC.Views & IBimComponent;
  [BimComponent.VolumeMeasurer]: OBCF.VolumeMeasurement & IBimComponent;
  [BimComponent.Grids]: OBC.SimpleGrid & IBimComponent;
};
