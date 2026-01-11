import type * as OBC from "@thatopen/components";
import type * as OBCF from "@thatopen/components-front";

import type { CameraDistanceLocker } from "@/lib/utils/BIM/CameraDistanceLocker";

import type { BimComponent } from "@/domain/enums/BIM/BimComponent";
import type { IBimComponent } from "@/domain/interfaces/BIM";

export interface BimComponentTypeMap extends Record<BimComponent, IBimComponent> {
  [BimComponent.Components]: OBC.Components & IBimComponent;
  [BimComponent.FragmentsManager]: OBC.FragmentsManager & IBimComponent;
  [BimComponent.AreaMeasurer]: OBCF.AreaMeasurement & IBimComponent;
  [BimComponent.LengthMeasurer]: OBCF.LengthMeasurement & IBimComponent;
  [BimComponent.Highlighter]: OBCF.Highlighter & IBimComponent;
  [BimComponent.CameraDistanceLocker]: CameraDistanceLocker;
  [BimComponent.Clipper]: OBC.Clipper & IBimComponent;
  [BimComponent.Views]: OBC.Views & IBimComponent;
};
