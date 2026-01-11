import * as OBC from "@thatopen/components";

import * as THREE from "three";

import { di } from "@/lib";

import { Constants } from "@/domain/Constants";

import { BimComponent } from "@/domain/enums/BIM";
import type { World } from "@/domain/types/BIM";
import type { IBimComponent } from "@/domain/interfaces/BIM";

export class CameraDistanceLocker implements IBimComponent {
  enabled = false;

  private readonly components         : OBC.Components;

  private readonly onMouseDownHandler : (event: MouseEvent) => Promise<void>;
  private abortController             : AbortController;

  private isActive = false;
  private marker?                     : THREE.Mesh;

  private static instance: CameraDistanceLocker;

  static getInstance(container: HTMLElement, world: World) {
    if (!this.instance) {
      this.instance = new this(container, world);
    }

    return this.instance;
  }

  private constructor(
    private readonly container : HTMLElement,
    private readonly world     : World
  ) {
    const components = di.get(BimComponent.Components);
    if (!components) {
      throw new Error("Components not initialised");
    }
    this.components = components;

    this.abortController = new AbortController();

    this.onMouseDownHandler = async (event: MouseEvent) => {
      if (event.button !== 0 || !this.isActive) return; // only left mouse button

      // Each raycaster is associated with a specific world.
      const raycaster = this.components.get(OBC.Raycasters)
                                       .get(this.world);

      const intersection = await raycaster.castRay();
      if (!intersection) return;

      const point = intersection.point;
      
      this.removeMarker();
      this.marker = this.createMarker(point);
      
      // Set the orbit target to the picked point, keep current camera position
      // camera-controls API exposed by OrthoPerspectiveCamera
      await this.world.camera.controls.setTarget(point.x, point.y, point.z, false);
      
      // Fallback: preserve position and update lookAt target
      /* const pos = this.world.camera.controls.getPosition(new THREE.Vector3());
      await this.world.camera.controls.setLookAt(pos.x, pos.y, pos.z, point.x, point.y, point.z, false); */
    };

    this.enabled = this.isActive;

    if (this.enabled) {
      this.container.addEventListener(
        "mousedown", 
        this.onMouseDownHandler, 
        { passive: true, signal: this.abortController.signal }
      );
    }
  }

  setEnabled(value: boolean) {
    if (value) {
      if (!this.isActive) {
        this.abortController = new AbortController();

        this.container.addEventListener(
          "mousedown", 
          this.onMouseDownHandler, 
          { passive: true, signal: this.abortController.signal }
        );
        this.isActive = true;
      }
    } else {
      if (this.isActive) {
        this.abortController.abort();
        this.isActive = false;
        this.removeMarker();
      }
    }
  }

  private createMarker(point: THREE.Vector3) { 
    const geometry = new THREE.CircleGeometry(0.5, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: Constants.Color.OrbitLock, 
      transparent: true, 
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const marker = new THREE.Mesh(geometry, material);
    marker.position.copy(point);
    
    // Orient the circle to face the camera
    const pos = this.world.camera.three.position;
    marker.lookAt(pos.x, pos.y, pos.z);
    
    this.world.scene.three.add(marker);

    return marker;
  }

  private removeMarker() {
    if (!this.marker) return;

    this.world.scene.three.remove(this.marker);
    this.marker.geometry.dispose();

    if (Array.isArray(this.marker.material)) {
      this.marker.material.forEach(m => m.dispose());
    } else {
      this.marker.material.dispose();
    }

    this.marker = undefined;
  }

  dispose() {
    this.abortController.abort();
    this.isActive = false;
    this.removeMarker();

    di.dispose(BimComponent.CameraDistanceLocker);
  }
}
