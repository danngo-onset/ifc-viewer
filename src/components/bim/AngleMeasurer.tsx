import { useEffect, useState, useRef, useCallback } from "react";

import { GraphicVertexPickerMode } from "@thatopen/components-front";

import { BufferGeometry, Float32BufferAttribute, Mesh } from "three";

import { useBimStoreShallow } from "@/store";

import { useBimComponent } from "@/hooks/bim";

import { BimComponent } from "@/domain/enums/bim/BimComponent";

export const AngleMeasurer = () => {
  const { syncPicking, setSyncPicking } = useBimStoreShallow(s => ({
    syncPicking: s.angleMeasurerSyncPicking,
    setSyncPicking: s.setAngleMeasurerSyncPicking
  }));
  
  const [visible, setVisible] = useState(false);
  const meshesRef = useRef(new Array<Mesh>());
  const pastDelayRef = useRef(0);
  
  const world = useBimComponent(BimComponent.World);
  const fragmentsManager = useBimComponent(BimComponent.FragmentsManager);
  const measurer = useBimComponent(BimComponent.AngleMeasurer);

  useEffect(() => {
    if (measurer) {
      setVisible(measurer.visible);
    }
  }, [measurer]);

  const makeSynchronous = useCallback(
    async (value: boolean) => {
      if (!world || !measurer) return;

      if (value) {
        measurer.pickerMode = GraphicVertexPickerMode.SYNCHRONOUS;
        measurer.delay = 0;

        for (const mesh of meshesRef.current) {
          world.meshes.add(mesh);
        }

        return;
      }

      measurer.pickerMode = GraphicVertexPickerMode.DEFAULT;
      measurer.delay = pastDelayRef.current;

      for (const mesh of meshesRef.current) {
        world.meshes.delete(mesh);
      }

      setSyncPicking(value);
    },
    [world, measurer]
  );

  useEffect(() => {
    if (!fragmentsManager || !measurer) return;

    // Add picking meshes (deduplicating geometries to save memory)
    (async () => {
      for (const model of fragmentsManager.list.values()) {
        const idsWithGeometry = await model.getItemsIdsWithGeometry();
        const allMeshesData = await model.getItemsGeometry(idsWithGeometry);
        
        const geometries = new Map<number, BufferGeometry>();

        for (const itemId in allMeshesData) {
          const meshData = allMeshesData[itemId];
          for (const geomData of meshData) {
            if (
              !geomData.positions
           || !geomData.indices
           || !geomData.transform
           || !geomData.representationId
            ) continue;

            const representationId = geomData.representationId;

            if (!geometries.has(representationId)) {
              const geometry = new BufferGeometry();
              geometry.setAttribute(
                "position", 
                new Float32BufferAttribute(geomData.positions, 3)
              );
              geometry.setIndex(Array.from(geomData.indices));
              geometries.set(representationId, geometry);
            }

            const geometry = geometries.get(representationId);

            const mesh = new Mesh(geometry);
            mesh.applyMatrix4(geomData.transform);
            mesh.applyMatrix4(model.object.matrixWorld);
            mesh.updateWorldMatrix(true, true);
            meshesRef.current.push(mesh);
          }
        }
      }

      pastDelayRef.current = measurer.delay;
      await makeSynchronous(syncPicking);
    })();

    return () => {
      makeSynchronous(true);
      meshesRef.current = [];
      pastDelayRef.current = 0;
    };
  }, [fragmentsManager, measurer, makeSynchronous]);

  return (
    <section className="w-48 bim-component-container">
      <ul className="bim-component-guide">
        <li>Double click 3 points to measure</li>
      </ul>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="angle-measurement-visible" 
          checked={visible} 
          onChange={e => {
            if (!measurer) return;

            const checked = e.target.checked;
            setVisible(checked);

            measurer.visible = checked;
          }} 
          className="rounded"
        />

        <label htmlFor="angle-measurement-visible">Measurement visible</label>
      </div>

      <div className="justify-start! gap-2! *:cursor-pointer">
        <input 
          type="checkbox" 
          id="synchronous-picking" 
          checked={syncPicking} 
          onChange={async e => {
            if (!measurer) return;

            const checked = e.target.checked;
            setSyncPicking(checked);

            await makeSynchronous(checked);
          }} 
          className="rounded"
        />

        <label htmlFor="synchronous-picking">Synchronous Picking</label>
      </div>

      <button 
        className="btn-gray"
        onClick={() => measurer?.list.clear()}
      >
        Delete All
      </button>
    </section>
  )
};
