import * as THREE from "three";

import Constants from "@/domain/Constants";
import type { WorldType } from "@/domain/types/WorldType";

export default class BimExtensions {
  static createOrbitLockMarker(world: WorldType, point: THREE.Vector3): THREE.Mesh { 
    const geometry = new THREE.CircleGeometry(0.5, 16);
    const material = new THREE.MeshBasicMaterial({ 
      color: Constants.Color.OrbitLock, 
      transparent: true, 
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const orbitLockMarker = new THREE.Mesh(geometry, material);
    orbitLockMarker.position.copy(point);
    
    // Orient the circle to face the camera
    const pos = world.camera.three.position;
    orbitLockMarker.lookAt(pos.x, pos.y, pos.z);
    
    world.scene.three.add(orbitLockMarker);

    return orbitLockMarker;
  }

  static removeOrbitLockMarker(world: WorldType, orbitLockMarker?: THREE.Mesh) {
    if (!orbitLockMarker) return;

    world.scene.three.remove(orbitLockMarker);
    orbitLockMarker.geometry.dispose();

    if (Array.isArray(orbitLockMarker.material)) {
      orbitLockMarker.material.forEach(m => m.dispose());
    } else {
      orbitLockMarker.material.dispose();
    }
  }
}
