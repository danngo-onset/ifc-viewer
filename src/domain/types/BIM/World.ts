import type * as OBC from "@thatopen/components";
import type * as OBCF from "@thatopen/components-front";

export type World = OBC.SimpleWorld<
  //OBC.SimpleScene, 
  OBC.ShadowedScene,
  OBC.OrthoPerspectiveCamera, 
  OBC.SimpleRenderer
  //OBCF.PostproductionRenderer
>;
