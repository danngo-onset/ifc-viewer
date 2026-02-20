import { useEffect, useState } from "react";

import * as OBC from "@thatopen/components";

import { useBimComponent } from "@/hooks/BIM";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const CameraViewModes = () => {
  const world = useBimComponent(BimComponent.World);

  const [navigationMode, setNavigationMode] = useState<OBC.NavModeID>("Orbit");
  const [projection, setProjection] = useState<OBC.CameraProjection>("Perspective");

  useEffect(() => {
    if (!world) return;

    setNavigationMode(world.camera.mode.id);
    setProjection(world.camera.projection.current);

    //console.log(world.camera.controls);
  }, [world]);

  const handleNavigationModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!world) return;

    const selectedValue = event.target.value as OBC.NavModeID;

    const { current } = world.camera.projection;
    const isOrtho = current === "Orthographic";
    const isFirstPerson = selectedValue === "FirstPerson";
    if (isOrtho && isFirstPerson) {
      alert("Orthographic mode does not support first person view");
      return;
    }

    // TODO: Increase camera speed when in first person mode
    /* const defaultCameraSpeed = world.camera.controls.dollySpeed;

    if (isFirstPerson) {
      console.log(world.camera.controls.maxZoom);
      world.camera.controls.smoothTime = 0.01;
      console.log(world.camera.controls.polarRotateSpeed);
    } else {
      console.log(world.camera.controls.polarRotateSpeed);
      world.camera.controls.dollySpeed = defaultCameraSpeed;
    } */

      /* if (selectedValue === "FirstPerson") {
        world.camera.controls.infinityDolly = true;
        world.camera.controls.dollySpeed = 200;    // try 3–10
        world.camera.controls.smoothTime = 0.0005; // optional: more responsive
      } else {
        world.camera.controls.infinityDolly = false;
        world.camera.controls.dollySpeed = 1;
        world.camera.controls.smoothTime = 0.25;
      } */

    world.camera.set(selectedValue);

    setNavigationMode(selectedValue);
  };

  const handleProjectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!world) return;

    const selectedValue = event.target.value as OBC.CameraProjection;

    const isOrtho = selectedValue === "Orthographic";
    const isFirstPerson = world.camera.mode.id === "FirstPerson";
    if (isOrtho && isFirstPerson) {
      alert("Perspective mode does not support orthographic projection");
      return;
    }

    world.camera.projection.set(selectedValue);

    setProjection(selectedValue);
  };

  return (
    <section className="w-64 bim-component-container">
      <div>
        <label htmlFor="navigation-mode">Navigation Mode</label>

        <select 
          id="navigation-mode"
          value={navigationMode} 
          onChange={handleNavigationModeChange}
          className="rounded border border-gray-400 p-1 w-28"
        >
          <option value="Orbit">Orbit</option>
          <option value="FirstPerson">First Person</option>
          {/* <option value="Plan">Plan</option> */}
        </select>
      </div>

      <div >
        <label htmlFor="projection">Projection</label>

        <select 
          id="projection"
          value={projection} 
          onChange={handleProjectionChange}
          className="rounded border border-gray-400 p-1 w-28"
        >
          <option value="Orthographic">Orthographic</option>
          <option value="Perspective">Perspective</option>
        </select>
      </div>
    </section>
  );
};
