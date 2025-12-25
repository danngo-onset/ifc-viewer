export default class Constants {
  // TODO: Convert to string enum for better type safety
  public static readonly ComponentsKey        = "components";
  public static readonly FragmentsManagerKey  = "fragmentsManager";
  public static readonly AreaMeasurementKey   = "areaMeasurer";
  public static readonly LengthMeasurementKey = "lengthMeasurer";
  public static readonly HighlighterKey       = "highlighter";
  public static readonly OrbitLockKey         = "orbitLock";

  public static readonly Color = {
    Measurer    : "#494CB6",
    Highlighter : "#BCF124",
    OrbitLock   : "#FF0000",
  };
};
