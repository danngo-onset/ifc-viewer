import { useCallback, useEffect, useState } from "react";

import { useBimComponent } from "@/hooks/BIM";

import * as OBC from "@thatopen/components";

import { BimComponent } from "@/domain/enums/BIM/BimComponent";

type OrientationOptions = OBC.BoundingBoxer.OrientationOptions;

export const Orientation = () => {
  const [modelLoaded, setModelLoaded] = useState(false);

  const components = useBimComponent(BimComponent.Components);
  const world = useBimComponent(BimComponent.World);
  const fragmentsManager = useBimComponent(BimComponent.FragmentsManager);

  const viewFromOrientation = useCallback(
    async (orientation: OrientationOptions) => {
      if (!components || !world || !world.camera.hasCameraControls()) 
        return;
  
      const boundingBoxer = components.get(OBC.BoundingBoxer);
      const { position, target } = await boundingBoxer.getCameraOrientation(orientation, 0.5);

      // TODO: Handle distance for large models
  
      await world.camera.controls.setLookAt(
        position.x, position.y, position.z,
        target.x, target.y, target.z,
        true
      );
    },
    [components, world]
  );

  useEffect(() => {
    if (!fragmentsManager) return;

    if (fragmentsManager.list.size > 0) {
      setModelLoaded(true);
      return;
    }
  }, [fragmentsManager?.list.size]);

  return (
    <>{modelLoaded 
      ? <ul className="
          bim-component-container p-0! space-y-0!
          *:hover:bg-gray-300 *:px-2 *:py-1 *:cursor-pointer
        ">
          <li className="rounded-t-md" onClick={async () => await viewFromOrientation("front")}>
            Front
          </li>

          <li onClick={async () => await viewFromOrientation("back")}>
            Back
          </li>

          <li onClick={async () => await viewFromOrientation("left")}>
            Left
          </li>

          <li onClick={async () => await viewFromOrientation("right")}>
            Right
          </li>

          <li onClick={async () => await viewFromOrientation("top")}>
            Top
          </li>

          <li className="rounded-b-md" onClick={async () => await viewFromOrientation("bottom")}>
            Bottom
          </li>
        </ul>

      : <section className="w-48 text-center bim-component-container">
          <p>Load a model to view from different orientations</p>
        </section>
    }</>
  );
};
