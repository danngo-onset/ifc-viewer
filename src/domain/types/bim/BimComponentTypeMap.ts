import type { Components, FragmentsManager, Clipper, Views, SimpleGrid } from "@thatopen/components";
import type { GeneralEditor } from "@/lib/@thatopen/components";
import type { AreaMeasurement, LengthMeasurement, Highlighter, VolumeMeasurement, AngleMeasurement } from "@thatopen/components-front";

import type { CameraDistanceLocker } from "@/lib/utils/bim/CameraDistanceLocker";

import type { BimComponent } from "@/domain/enums/bim/BimComponent";
import type { IBimComponent } from "@/domain/interfaces/bim";

import type { World } from "./World";

type Bim<T> = T & IBimComponent;

export interface BimComponentTypeMap extends Record<BimComponent, IBimComponent> {
  [BimComponent.Components]:           Bim<Components>;
  [BimComponent.World]:                Bim<World>;
  [BimComponent.FragmentsManager]:     Bim<FragmentsManager>;
  [BimComponent.AreaMeasurer]:         Bim<AreaMeasurement>;
  [BimComponent.LengthMeasurer]:       Bim<LengthMeasurement>;
  [BimComponent.Highlighter]:          Bim<Highlighter>;
  [BimComponent.CameraDistanceLocker]: Bim<CameraDistanceLocker>;
  [BimComponent.Clipper]:              Bim<Clipper>;
  [BimComponent.Views]:                Bim<Views>;
  [BimComponent.VolumeMeasurer]:       Bim<VolumeMeasurement>;
  [BimComponent.Grids]:                Bim<SimpleGrid>;
  [BimComponent.AngleMeasurer]:        Bim<AngleMeasurement>;
  [BimComponent.GeneralEditor]:        Bim<GeneralEditor>;
}
