import type { SimpleWorld, SimpleScene, ShadowedScene, OrthoPerspectiveCamera, SimpleRenderer } from "@thatopen/components";
import type { PostproductionRenderer } from "@thatopen/components-front";
  
export type World = SimpleWorld<
  //SimpleScene, 
  ShadowedScene,
  OrthoPerspectiveCamera, 
  //SimpleRenderer
  PostproductionRenderer
>;
