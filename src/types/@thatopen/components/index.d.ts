import * as OBC from "@thatopen/components";

declare module "@thatopen/components" {
  namespace BoundingBoxer {
    type OrientationOptions = "front" | "back" | "left" | "right" | "top" | "bottom";
  }
}
