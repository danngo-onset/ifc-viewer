import type * as THREE from "three";

export class Constants {
  public static readonly Color: Record<string, THREE.ColorRepresentation> = {
    Measurer           : "#494CB6",
    Highlighter        : "#BCF124",
    CameraDistanceLock : "#FF0000",
  };
};
