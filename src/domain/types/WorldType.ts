import * as OBC from "@thatopen/components";
import * as OBF from "@thatopen/components-front";

export type WorldType = OBC.SimpleWorld<
  OBC.SimpleScene, 
  OBC.OrthoPerspectiveCamera, 
  //OBC.SimpleRenderer
  OBF.PostproductionRenderer
>;
