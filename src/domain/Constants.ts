import type * as THREE from "three";

export default class Constants {
  public static readonly Color: Record<string, THREE.ColorRepresentation> = {
    Measurer    : "#494CB6",
    Highlighter : "#BCF124",
    OrbitLock   : "#FF0000",
  };
};
