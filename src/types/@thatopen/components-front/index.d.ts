import type { AngleMeasurement } from "@thatopen/components-front";

declare module "@thatopen/components-front" {
  namespace AngleMeasurement {
    type Unit = AngleMeasurement["units"];
  }
}
